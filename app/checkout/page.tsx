import { Suspense } from 'react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Оформлення замовлення — Marwood',
  description: 'Оформіть замовлення в інтернет-магазині Marwood. Швидка доставка Новою Поштою, безпечна оплата.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-milky">
      {/* Хлібні крихти */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-bottle/40">
          <Link href="/" className="hover:text-bottle transition-colors">Головна</Link>
          <span>/</span>
          <span className="text-bottle font-bold">Оформлення замовлення</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-bottle mb-8 text-center">
          Оформлення замовлення
        </h1>

        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle"></div>
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Форма */}
            <div className="lg:col-span-7 xl:col-span-8">
              <CheckoutForm />
            </div>

            {/* Підсумок */}
            <div className="lg:col-span-5 xl:col-span-4">
              <OrderSummary />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
