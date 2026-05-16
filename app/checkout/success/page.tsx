import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CopyButton } from '@/components/checkout/CopyButton';
import { PaymentDetails } from '@/components/checkout/PaymentDetails';

export const metadata: Metadata = {
  title: 'Замовлення прийнято — Marwood',
  description: 'Дякуємо за ваше замовлення в Marwood!',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string; total?: string }>;
}) {
  const { order: orderNumber, method, total } = await searchParams;

  let orderData = null;
  if (orderNumber) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
      
    if (error) {
      console.error('Error fetching order for success page:', error);
    }
    orderData = data;
  }

  // Use DB data if available, otherwise fallback to URL params
  const paymentMethod = orderData?.payment_method || method;
  const totalAmount = orderData?.total || (total ? parseInt(total, 10) : 0);
  const showPaymentDetails = paymentMethod === 'details_full' || paymentMethod === 'details_cod';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Іконка та заголовок */}
        <div className="space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-light uppercase tracking-[0.2em] text-bottle">
              Дякуємо!
            </h1>
            <p className="text-[11px] text-bottle/60 uppercase tracking-widest">
              Замовлення прийнято
            </p>
          </div>
        </div>

        {/* Номер замовлення та Реквізити */}
        {orderNumber && (
          <div className="space-y-3">
            <div className="bg-bottle text-milky p-6 space-y-3 shadow-lg">
              <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-milky/50 font-bold">
                <Package className="w-3 h-3" />
                Номер замовлення
              </div>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-bold font-mono tracking-wider">
                  {orderNumber}
                </p>
                <CopyButton value={orderNumber} label="номер замовлення" />
              </div>
            </div>

            {showPaymentDetails && (
              <PaymentDetails 
                orderNumber={orderNumber} 
                totalAmount={totalAmount} 
                paymentMethod={paymentMethod}
              />
            )}
          </div>
        )}

        <p className="text-[11px] text-bottle/50 max-w-[280px] mx-auto leading-relaxed">
          Ми зв&apos;яжемось із вами найближчим часом для підтвердження.
        </p>

        {/* Кнопки та контакти */}
        <div className="space-y-4">
          <Link
            href="/"
            className="bg-bottle text-milky w-full py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2"
          >
            До покупок
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center justify-center gap-4 text-[10px] text-bottle/40">
            <a href="tel:+380000000000" className="flex items-center gap-1.5 hover:text-bottle transition-colors">
              <Phone className="w-3 h-3" />
              +38 (000) 000-00-00
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
