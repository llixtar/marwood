'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Спільна логіка для обробки FormData
async function processProductFormData(formData: FormData) {
  const files = formData.getAll('images') as File[];
  const newImageUrls: string[] = [];

  for (const file of files) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Помилка завантаження файлу ${file.name}: ` + uploadError.message);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('products')
        .getPublicUrl(filePath);

      newImageUrls.push(publicUrlData.publicUrl);
    }
  }

  const sizesInput = formData.get('sizes') as string;
  const sizesArray = sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(Boolean) : [];

  const discountPriceInput = formData.get('discount_price') as string;
  const discountPrice = discountPriceInput ? parseFloat(discountPriceInput) : null;

  const existingImagesRaw = formData.get('existing_images') as string;
  let existingImagesList: string[] = [];
  try {
    existingImagesList = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
  } catch (e) {
    existingImagesList = [];
  }

  // Об'єднуємо старі (якщо вони залишилися) та нові
  // Якщо в FormData є 'image_sequence', використовуємо його для визначення порядку
  const imageSequenceRaw = formData.get('image_sequence') as string;
  let finalImages: string[] = [];

  if (imageSequenceRaw) {
    const sequence = JSON.parse(imageSequenceRaw);
    finalImages = sequence.map((item: any) => {
      if (item.type === 'existing') return item.url;
      if (item.type === 'new') return newImageUrls[item.index];
      return null;
    }).filter(Boolean);
  } else {
    // Фоллбек для старої логіки або простих випадків
    finalImages = [...existingImagesList, ...newImageUrls];
  }

  const salesCountInput = formData.get('sales_count') as string;
  const salesCount = salesCountInput ? parseInt(salesCountInput, 10) : 0;

  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    slug: formData.get('slug') as string,
    category_slug: formData.get('category_slug') as string,
    is_new: formData.get('is_new') === 'on',
    is_sale: formData.get('is_sale') === 'on' || discountPrice !== null, 
    sales_count: salesCount,
    sku: (formData.get('sku') as string) || null,
    color: formData.get('color') as string,
    sizes: sizesArray,
    discount_price: discountPrice,
    images: finalImages,
    image_url: finalImages.length > 0 ? finalImages[0] : null, 
    stock_by_size: formData.get('stock_by_size') ? JSON.parse(formData.get('stock_by_size') as string) : {},
  };
}

export async function addProductAction(formData: FormData) {
  try {
    const rawData = await processProductFormData(formData);

    const { error: dbError } = await supabaseAdmin
      .from('products')
      .insert([rawData]);

    if (dbError) throw new Error('Помилка запису в БД: ' + dbError.message);

    revalidatePath('/admin');
    revalidatePath(`/category/${rawData.category_slug}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  try {
    const rawData = await processProductFormData(formData);

    const { error: dbError } = await supabaseAdmin
      .from('products')
      .update(rawData)
      .eq('id', id);

    if (dbError) throw new Error('Помилка оновлення БД: ' + dbError.message);

    revalidatePath('/admin');
    revalidatePath(`/category/${rawData.category_slug}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(id: string, images?: string[]) {
  try {
    if (images && images.length > 0) {
      const pathsToRemove = images.map(img => {
        const match = img.match(/\/products\/(.*?)$/);
        return match ? match[1] : null;
      }).filter(Boolean) as string[];

      if (pathsToRemove.length > 0) {
        await supabaseAdmin.storage.from('products').remove(pathsToRemove);
      }
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Помилка видалення товару: ' + error.message);

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
