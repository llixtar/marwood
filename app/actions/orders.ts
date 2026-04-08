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
  paymentMethod: 'monopay' | 'cod';
  comment?: string;
  items: {
    id: number;
    title: string;
    price: number;
    discount_price?: number | null;
    image?: string;
    selectedSize?: string;
    quantity: number;
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

    const shippingCost = 0; // Безкоштовна доставка від 2000 ₴
    const total = subtotal + shippingCost;

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

    // Зберігаємо замовлення в Supabase
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([{
        order_number: orderNumber,
        status: 'pending',
        customer_id: customerId, // Прив'язка до профілю
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail || null,
        delivery_method: data.deliveryMethod,
        city: data.city,
        city_ref: data.cityRef || null,
        warehouse: data.warehouse || null,
        warehouse_ref: data.warehouseRef || null,
        address: data.address || null,
        payment_method: data.paymentMethod,
        payment_status: 'pending',
        items: data.items,
        subtotal: Math.round(subtotal * 100), // у копійках
        shipping_cost: Math.round(shippingCost * 100),
        total: Math.round(total * 100),
        comment: data.comment || null,
      }])
      .select()
      .single();

    if (dbError) throw new Error('Помилка збереження замовлення: ' + dbError.message);

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

    // COD (наложений платіж) — одразу підтверджуємо
    await supabaseAdmin
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id);

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
