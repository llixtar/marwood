import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone } from 'lucide-react';
import type { Metadata } from 'next';

import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Замовлення прийнято — Marwood',
  description: 'Дякуємо за ваше замовлення в Marwood!',
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  let orderData = null;
  if (orderNumber) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    orderData = data;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Іконка успіху */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
            <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Заголовок */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-bottle">
            Дякуємо!
          </h1>
          <p className="text-sm text-bottle/60 leading-relaxed">
            Ваше замовлення прийнято та буде оброблено найближчим часом.
            Ми зв&apos;яжемось із вами для підтвердження.
          </p>
        </div>

        {/* Номер замовлення та Реквізити */}
        {orderNumber && (
          <div className="space-y-4">
            <div className="bg-white border border-bottle/10 p-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-bottle/50">
                <Package className="w-3.5 h-3.5" />
                Номер замовлення
              </div>
              <p className="text-2xl font-bold text-bottle font-mono tracking-wider">
                {orderNumber}
              </p>
              <p className="text-[10px] text-bottle/40">
                Збережіть цей номер для відстеження замовлення
              </p>
            </div>

            {orderData && (orderData.payment_method === 'details_full' || orderData.payment_method === 'details_cod') && (
              <div className="bg-bottle text-milky p-8 text-left space-y-6">
                <div className="space-y-2 border-b border-milky/10 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Реквізити для оплати</h3>
                  <p className="text-[10px] opacity-60 leading-relaxed">
                    Будь ласка, здійсніть переказ за вказаними реквізитами. 
                    <strong> Обов&apos;язково</strong> вкажіть номер замовлення <span className="underline">{orderNumber}</span> у коментарі до платежу.
                  </p>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">Отримувач</p>
                    <p className="font-bold">ФОП [Ваше Ім&apos;я]</p>
                  </div>
                  <div>
                    <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">IBAN</p>
                    <p className="font-bold break-all">UA00 0000 0000 0000 0000 0000 000</p>
                  </div>
                  <div className="pt-2 flex justify-between items-end border-t border-milky/10">
                    <div>
                      <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">Сума до сплати</p>
                      <p className="text-xl font-bold">
                        {orderData.payment_method === 'details_cod' ? '200' : (orderData.total / 100).toLocaleString('uk-UA')} ₴
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-40 uppercase tracking-tighter font-sans">
                        {orderData.payment_method === 'details_cod' ? 'Часткова передоплата' : 'Повна оплата'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Контакти */}
        <div className="bg-bottle/5 p-4 text-xs text-bottle/60 flex items-center justify-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          Питання? Телефонуйте: <a href="tel:+380000000000" className="font-bold text-bottle hover:underline">+38 (000) 000-00-00</a>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-bottle text-milky px-8 py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2"
          >
            Повернутися до покупок
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
