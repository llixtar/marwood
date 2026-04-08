import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { invoiceId, status, modifiedDate, reference } = body;

    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Маппінг статусів MonoPay → наших
    const paymentStatusMap: Record<string, string> = {
      'created': 'pending',
      'processing': 'processing',
      'hold': 'processing',
      'success': 'success',
      'failure': 'failure',
      'reversed': 'reversed',
      'expired': 'failure',
    };

    const paymentStatus = paymentStatusMap[status] || 'pending';

    // Оновлюємо замовлення
    const updateData: Record<string, any> = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    // Якщо оплата успішна — підтверджуємо замовлення
    if (paymentStatus === 'success') {
      updateData.status = 'confirmed';
    }

    // Якщо оплата провалена — скасовуємо
    if (paymentStatus === 'failure') {
      updateData.status = 'cancelled';
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('mono_invoice_id', invoiceId);

    if (error) {
      console.error('Webhook: DB update error:', error);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    // MonoPay очікує 200 OK
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
