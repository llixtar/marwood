'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export type CustomerProfile = {
  id: string;
  auth_user_id: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  saved_city: string | null;
  saved_city_ref: string | null;
  saved_warehouse: string | null;
  saved_warehouse_ref: string | null;
  saved_address: string | null;
  saved_delivery_method: string | null;
  orders_count: number;
  total_spent: number;
  is_guest: boolean;
  cart_data: any;
  wishlist_data: any;
};

export async function getCustomerProfile(authUserId: string): Promise<CustomerProfile | null> {
  const { data } = await supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  return data;
}

export async function updateCustomerProfile(
  authUserId: string,
  updates: Partial<Omit<CustomerProfile, 'id' | 'auth_user_id' | 'orders_count' | 'total_spent' | 'is_guest'>>
) {
  const { error } = await supabaseAdmin
    .from('customer_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', authUserId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function syncCustomerData(
  authUserId: string,
  type: 'cart' | 'wishlist',
  data: any
) {
  const column = type === 'cart' ? 'cart_data' : 'wishlist_data';
  
  const { error } = await supabaseAdmin
    .from('customer_profiles')
    .update({
      [column]: data,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', authUserId);

  if (error) {
    console.error(`Failed to sync ${type}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function saveDeliveryAddress(
  authUserId: string | null,
  address: {
    city: string;
    cityRef?: string;
    warehouse?: string;
    warehouseRef?: string;
    address?: string;
    deliveryMethod: string;
  }
) {
  if (!authUserId) return; // Гості не зберігають адресу

  await supabaseAdmin
    .from('customer_profiles')
    .update({
      saved_city: address.city,
      saved_city_ref: address.cityRef || null,
      saved_warehouse: address.warehouse || null,
      saved_warehouse_ref: address.warehouseRef || null,
      saved_address: address.address || null,
      saved_delivery_method: address.deliveryMethod,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', authUserId);
}

export async function getOrCreateGuestCustomer(phone: string, name: string, email?: string) {
  // Шукаємо існуючого гостя за номером телефону
  const { data: existing } = await supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .eq('phone', phone)
    .eq('is_guest', true)
    .single();

  if (existing) {
    // Оновлюємо дані
    await supabaseAdmin
      .from('customer_profiles')
      .update({
        full_name: name,
        email: email || existing.email,
        orders_count: (existing.orders_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    return existing.id;
  }

  // Створюємо нового гостьового клієнта
  const { data: newCustomer } = await supabaseAdmin
    .from('customer_profiles')
    .insert({
      full_name: name,
      phone,
      email: email || null,
      is_guest: true,
      orders_count: 1,
    })
    .select()
    .single();

  return newCustomer?.id || null;
}

export async function getCustomerOrders(authUserId: string) {
  // Спочатку знаходимо customer_id
  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!profile) return [];

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: false });

  return orders || [];
}
