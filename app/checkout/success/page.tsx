import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CopyButton } from '@/components/checkout/CopyButton';

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
            <div className="bg-white border border-bottle/10 p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-bottle/50">
                <Package className="w-3 h-3" />
                Номер замовлення
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-bold text-bottle font-mono tracking-wider">
                  {orderNumber}
                </p>
                <CopyButton value={orderNumber} label="номер замовлення" />
              </div>
            </div>

            {orderData && (orderData.payment_method === 'details_full' || orderData.payment_method === 'details_cod') && (
              <div className="bg-bottle text-milky p-6 text-left space-y-4">
                <div className="space-y-1 border-b border-milky/10 pb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Реквізити для оплати</h3>
                  <p className="text-[9px] opacity-50 leading-tight">
                    Вкажіть номер <span className="underline">{orderNumber}</span> у коментарі до платежу.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div>
                    <p className="opacity-40 text-[8px] uppercase tracking-tighter mb-0.5 font-sans">Отримувач</p>
                    <p className="font-bold">ФОП [Ваше Ім&apos;я]</p>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="opacity-40 text-[8px] uppercase tracking-tighter mb-0.5 font-sans">IBAN</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold break-all leading-none">UA000000000000000000000000000</p>
                        <CopyButton value="UA000000000000000000000000000" label="IBAN" />
                      </div>
                    </div>
                    <div>
                      <p className="opacity-40 text-[8px] uppercase tracking-tighter mb-0.5 font-sans">ЄДРПОУ</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">12345678</p>
                        <CopyButton value="12345678" label="ЄДРПОУ" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 flex justify-between items-end border-t border-milky/10">
                    <div>
                      <p className="opacity-40 text-[8px] uppercase tracking-tighter mb-0.5 font-sans">Сума до сплати</p>
                      <p className="text-lg font-bold">
                        {orderData.payment_method === 'details_cod' ? '200' : (orderData.total / 100).toLocaleString('uk-UA')} ₴
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] opacity-40 uppercase tracking-tighter font-sans">
                        {orderData.payment_method === 'details_cod' ? 'Передоплата' : 'Повна оплата'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
