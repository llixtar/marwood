'use server';

import { createSupabaseServer } from '@/lib/supabase/server-ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReviewItem = {
  id: string;
  profile_id: string;
  rating: number | null;
  comment: string;
  images: string[];
  created_at: string;
  customer_profiles: {
    full_name: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
};

// Отримання всіх відгуків та статистики оцінок
export async function getReviews() {
  try {
    const { data, error } = await supabaseAdmin
      .from('customer_reviews')
      .select(`
        id,
        profile_id,
        rating,
        comment,
        images,
        created_at,
        customer_profiles (
          full_name,
          email,
          is_admin
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reviews = (data || []) as unknown as ReviewItem[];

    // Розрахунок статистики оцінок
    const ratings = reviews.filter((r) => r.rating !== null) as { rating: number }[];
    const totalRatingsCount = ratings.length;
    const averageRating = totalRatingsCount > 0 
      ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatingsCount).toFixed(1))
      : 0;

    // Співвідношення оцінок (від 1 до 5 зірок)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return {
      success: true,
      reviews,
      stats: {
        averageRating,
        totalRatingsCount,
        distribution,
      },
    };
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return {
      success: false,
      reviews: [],
      stats: {
        averageRating: 0,
        totalRatingsCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      error: error.message,
    };
  }
}

// Перевірка статусу оцінки для поточного залогованого користувача
export async function getUserRatingStatus() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, hasRated: false, existingRating: null, profile: null };
    }

    // Шукаємо профіль користувача
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, full_name, email, is_admin')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return { success: true, hasRated: false, existingRating: null, profile: null };
    }

    // Шукаємо, чи є вже відгук з оцінкою від цього профілю
    const { data: existingReview, error: reviewError } = await supabaseAdmin
      .from('customer_reviews')
      .select('rating')
      .eq('profile_id', profile.id)
      .not('rating', 'is', null)
      .limit(1)
      .maybeSingle();

    if (reviewError) throw reviewError;

    return {
      success: true,
      hasRated: !!existingReview,
      existingRating: existingReview?.rating || null,
      profile,
    };
  } catch (error: any) {
    console.error('Error checking rating status:', error);
    return { success: false, hasRated: false, existingRating: null, profile: null, error: error.message };
  }
}

// Створення нового відгуку/коментаря
export async function addReviewAction(formData: FormData) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Будь ласка, авторизуйтесь для написання відгуку.' };
    }

    // 1. Знаходимо профіль клієнта
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, full_name, email')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Профіль клієнта не знайдено.' };
    }

    const comment = formData.get('comment') as string;
    const ratingInput = formData.get('rating');
    let rating: number | null = ratingInput ? parseInt(ratingInput as string, 10) : null;

    if (!comment || comment.trim().length === 0) {
      return { success: false, error: 'Коментар не може бути порожнім.' };
    }

    // 2. Перевірка, чи користувач вже оцінював бренд
    const { data: existingReview } = await supabaseAdmin
      .from('customer_reviews')
      .select('id')
      .eq('profile_id', profile.id)
      .not('rating', 'is', null)
      .limit(1)
      .maybeSingle();

    if (existingReview && rating !== null) {
      // Якщо оцінка вже є, ми ігноруємо нову оцінку (користувач може лишити лише коментар)
      rating = null;
    }

    // 3. Завантаження зображень у Supabase Storage reviews bucket
    const files = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        // Перевірка розміру (макс 5 МБ)
        if (file.size > 5 * 1024 * 1024) {
          return { success: false, error: `Файл ${file.name} занадто великий (макс. 5MB).` };
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('reviews')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Помилка завантаження зображення: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from('reviews')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrlData.publicUrl);
      }
    }

    // 4. Записуємо відгук у БД
    const { error: insertError } = await supabaseAdmin
      .from('customer_reviews')
      .insert({
        profile_id: profile.id,
        rating,
        comment: comment.trim(),
        images: imageUrls,
      });

    if (insertError) throw insertError;

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error inserting review:', error);
    return { success: false, error: error.message };
  }
}

// Видалення відгуку адміністратором
export async function deleteReviewAction(reviewId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Авторизація обов’язкова.' };
    }

    // Перевіряємо, чи користувач адмін
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return { success: false, error: 'Недостатньо прав для цієї дії.' };
    }

    // Отримуємо URL зображень для видалення зі сховища
    const { data: review, error: getReviewError } = await supabaseAdmin
      .from('customer_reviews')
      .select('images')
      .eq('id', reviewId)
      .single();

    if (getReviewError) throw getReviewError;

    // Видаляємо зображення зі сховища (якщо вони є)
    if (review && review.images && review.images.length > 0) {
      const pathsToRemove = review.images.map((img: string) => {
        const match = img.match(/\/reviews\/(.*?)$/);
        return match ? match[1] : null;
      }).filter(Boolean) as string[];

      if (pathsToRemove.length > 0) {
        const { error: removeStorageError } = await supabaseAdmin.storage
          .from('reviews')
          .remove(pathsToRemove);

        if (removeStorageError) {
          console.warn('Failed to remove review files from storage:', removeStorageError.message);
        }
      }
    }

    // Видаляємо сам відгук з БД
    const { error: deleteError } = await supabaseAdmin
      .from('customer_reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) throw deleteError;

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
}
