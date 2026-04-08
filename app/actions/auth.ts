'use server';

import { createSupabaseServer } from '@/lib/supabase/server-ssr';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        phone: formData.phone || '',
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Створюємо профіль клієнта
  if (data.user) {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    await supabaseAdmin.from('customer_profiles').upsert({
      auth_user_id: data.user.id,
      full_name: formData.fullName,
      phone: formData.phone || null,
      email: formData.email,
      is_guest: false,
    }, { onConflict: 'auth_user_id' });
  }

  return { 
    success: true, 
    needsConfirmation: !data.session, // true якщо потрібне підтвердження email
  };
}

export async function signInAction(formData: {
  email: string;
  password: string;
}) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { success: false, error: 'Невірний email або пароль' };
    }
    if (error.message === 'Email not confirmed') {
      return { success: false, error: 'Підтвердіть email для входу' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServer();
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/api/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: false, error: 'Не вдалось отримати URL для авторизації' };
}

export async function signOutAction() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
