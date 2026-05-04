'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

// Чисті SVG іконки, щоб TypeScript не сварився
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);


const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21.19 5.11L18.45 18c-.19.86-.71 1.07-1.43.67L12.85 15.6l-2.01 1.93c-.22.22-.4.41-.82.41l.3-4.22 7.68-6.94c.33-.3-.07-.47-.52-.17L7.96 12.65 3.88 11.4c-.88-.28-.9-.88.18-1.3l15.93-6.14c.73-.27 1.38.17 1.2 1.15z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-bottle text-milky pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">

          {/* Блок 1: Про бренд */}
          <div className="flex flex-col items-center md:items-start gap-6 text-center md:text-left">
            <Link href="/admin" className="text-3xl font-bold uppercase tracking-[0.3em]" title="Доступ до адмін-панелі">
              Marwood
            </Link>
          </div>

          {/* Блок 2: Графік роботи */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Графік роботи</h4>
            <div className="space-y-2 opacity-80 text-sm">
              <div className="flex justify-between max-w-[150px]">
                <span>Пн - Пт:</span>
                <span>8:00 - 18:00</span>
              </div>
              <div className="flex justify-between max-w-[150px]">
                <span>Субота:</span>
                <span>09:00 - 14:00</span>
              </div>
              <p className="text-[10px] mt-2 opacity-60">* Прийом замовлень онлайн — 24/7</p>
            </div>
          </div>


          {/* Блок 3: Клієнтам */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Клієнтам</h4>
            <div className="flex flex-col gap-3">
              <Link href="/delivery" className="text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all">
                Оплата та доставка
              </Link>
              <Link href="/returns" className="text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all">
                Обмін та повернення
              </Link>
              <Link href="/care" className="text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all">
                Догляд за білизною
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Контакти</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm opacity-80">
                <Phone className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <a href="tel:+380755456857" className="hover:opacity-100">+380 75 545 68 57</a>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://instagram.com/marwood_premium" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="https://t.me/marwood_p" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                  <TelegramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Блок 5: Відправка зі складів */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Відправка зі складів</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm opacity-80">
                <MapPin className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>Шаровечка, Хмельницька обл.</span>
              </div>
              <div className="flex items-start gap-3 text-sm opacity-80">
                <MapPin className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>м. Луцьк</span>
              </div>
              <p className="text-[10px] mt-2 opacity-60">* Послуга самовивозу відсутня</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-milky/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Marwood Premium. Всі права захищені.
          </p>
          <Link href="/privacy" className="text-[10px] opacity-50 hover:opacity-100 uppercase tracking-widest transition-opacity">
            Політика конфіденційності
          </Link>
        </div>
      </div>
    </footer>
  );
}