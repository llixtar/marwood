import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Замовлення прийнято — Marwood',
  description: 'Дякуємо за ваше замовлення в Marwood!',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

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

        {/* Номер замовлення */}
        {order && (
          <div className="bg-white border border-bottle/10 p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-bottle/50">
              <Package className="w-3.5 h-3.5" />
              Номер замовлення
            </div>
            <p className="text-2xl font-bold text-bottle font-mono tracking-wider">
              {order}
            </p>
            <p className="text-[10px] text-bottle/40">
              Збережіть цей номер для відстеження замовлення
            </p>
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
