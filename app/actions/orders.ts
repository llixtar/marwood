'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { getOrCreateGuestCustomer, saveDeliveryAddress } from './customers';
import { getCurrentUser } from './auth';
import { createSupabaseServer } from '@/lib/supabase/server-ssr';

// Генерація номера замовлення: MW-20260408-XXXX
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MW-${date}-${rand}`;
}

export type OrderFormData = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: 'nova_poshta_warehouse' | 'nova_poshta_courier';
  city: string;
  cityRef?: string;
  warehouse?: string;
  warehouseRef?: string;
  address?: string;
  paymentMethod: 'monopay' | 'details_full' | 'details_cod';
  comment?: string;
  items: {
    id: string;
    title: string;
    price: number;
    discount_price?: number | null;
    image?: string;
    selectedSize?: string;
    quantity: number;
    sku?: string;
  }[];
};

export async function createOrderAction(data: OrderFormData) {
  try {
    const orderNumber = generateOrderNumber();

    // Підрахунок суми
    const subtotal = data.items.reduce((sum, item) => {
      const price = item.discount_price ?? item.price;
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = 0;
    const total = subtotal;

    // Визначаємо клієнта (зареєстрований або гість)
    const user = await getCurrentUser();
    let customerId: string | null = null;

    if (user) {
      // Знаходимо існуючий профіль юзера
      const { data: profile } = await supabaseAdmin
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      customerId = profile?.id || null;
    } else {
      // Створюємо або знаходимо гостьовий профіль
      customerId = await getOrCreateGuestCustomer(
        data.customerPhone,
        data.customerName,
        data.customerEmail
      );
    }

    // Зберігаємо замовлення в Supabase через RPC (з контролем залишків)
    const { data: orderResponse, error: dbError } = await supabaseAdmin
      .rpc('create_order_with_stock', {
        p_order_number: orderNumber,
        p_customer_id: customerId,
        p_customer_name: data.customerName,
        p_customer_phone: data.customerPhone,
        p_customer_email: data.customerEmail || null,
        p_delivery_method: data.deliveryMethod,
        p_city: data.city,
        p_city_ref: data.cityRef || null,
        p_warehouse: data.warehouse || null,
        p_warehouse_ref: data.warehouseRef || null,
        p_address: data.address || null,
        p_payment_method: data.paymentMethod,
        p_payment_status: 'pending',
        p_status: data.paymentMethod.startsWith('details') ? 'awaiting_payment' : 'pending',
        p_items: data.items,
        p_subtotal: Math.round(subtotal * 100),
        p_shipping_cost: Math.round(shippingCost * 100),
        p_total: Math.round(total * 100),
        p_comment: data.comment || null,
      });

    if (dbError) throw new Error('Помилка збереження замовлення: ' + dbError.message);
    const order = orderResponse;

    // Зберігаємо адресу доставки в профіль для наступного разу (якщо юзер авторизований)
    if (user) {
      await saveDeliveryAddress(user.id, {
        city: data.city,
        cityRef: data.cityRef,
        warehouse: data.warehouse,
        warehouseRef: data.warehouseRef,
        address: data.address,
        deliveryMethod: data.deliveryMethod,
      });
    }

    // Якщо оплата MonoPay — створюємо рахунок
    if (data.paymentMethod === 'monopay') {
      const invoiceResult = await createMonoInvoice(order.id, order.order_number, total, data.items);
      
      if (invoiceResult.success && invoiceResult.pageUrl) {
        // Оновлюємо замовлення з invoiceId
        await supabaseAdmin
          .from('orders')
          .update({ mono_invoice_id: invoiceResult.invoiceId })
          .eq('id', order.id);

        return {
          success: true,
          orderNumber,
          paymentUrl: invoiceResult.pageUrl,
        };
      } else {
        return {
          success: false,
          error: invoiceResult.error || 'Помилка створення рахунку MonoPay',
        };
      }
    }

    // COD (наложений платіж) — встановлюємо спеціальний статус "Очікує передоплати"
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'awaiting_payment' })
      .eq('id', order.id);

    if (updateError) {
      console.error('Помилка оновлення статусу до pending:', updateError);
    }

    return {
      success: true,
      orderNumber,
      paymentUrl: null,
    };
  } catch (error: any) {
    console.error('createOrderAction error:', error);
    return { success: false, error: error.message };
  }
}

async function createMonoInvoice(
  orderId: string,
  orderNumber: string,
  totalUAH: number,
  items: OrderFormData['items']
) {
  const monoToken = process.env.MONO_TOKEN;
  if (!monoToken) {
    return { success: false, error: 'MONO_TOKEN не налаштовано' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const basketOrder = items.map((item) => ({
    name: item.title,
    qty: item.quantity,
    sum: Math.round((item.discount_price ?? item.price) * 100),
    total: Math.round((item.discount_price ?? item.price) * item.quantity * 100),
    unit: 'шт.',
    code: String(item.id),
  }));

  try {
    const response = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': monoToken,
      },
      body: JSON.stringify({
        amount: Math.round(totalUAH * 100), // в копійках
        ccy: 980, // UAH
        merchantPaymInfo: {
          reference: orderNumber,
          destination: `Замовлення ${orderNumber} — Marwood`,
          basketOrder,
        },
        redirectUrl: `${appUrl}/checkout/success?order=${orderNumber}`,
        webHookUrl: `${appUrl}/api/mono/webhook`,
        validity: 3600, // 1 година
        paymentType: 'debit',
      }),
    });

    const result = await response.json();

    if (response.ok && result.pageUrl) {
      return {
        success: true,
        invoiceId: result.invoiceId,
        pageUrl: result.pageUrl,
      };
    }

    return {
      success: false,
      error: result.errText || result.message || 'MonoPay API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

 export async function getAllOrdersAdmin() {
   const { data: orders, error } = await supabaseAdmin
     .from('orders')
     .select('*')
     .order('created_at', { ascending: false });
 
   if (error) {
     console.error('getAllOrdersAdmin error:', error);
     return [];
   }
 
   return orders || [];
 }

 export async function updateOrderStatus(orderId: string, status: string) {
   const { error } = await supabaseAdmin
     .from('orders')
     .update({ status })
     .eq('id', orderId);
 
   if (error) {
     console.error('updateOrderStatus error:', error);
     return { success: false, error: error.message };
   }
   return { success: true };
 }
 
 export async function getNewOrdersCount() {
   const { count, error } = await supabaseAdmin
     .from('orders')
     .select('*', { count: 'exact', head: true })
     .in('status', ['pending', 'awaiting_payment']);
 
   if (error) {
     console.error('getNewOrdersCount error:', error);
     return 0;
   }
   return count || 0;
 }
