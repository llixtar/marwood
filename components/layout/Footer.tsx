'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

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

const FacebookIcon = ({ className }: { className?: string }) => (
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
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-bottle text-milky pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Блок 1: Про бренд */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="text-3xl font-bold uppercase tracking-[0.3em]">
              Marwood
            </Link>
            <p className="text-sm opacity-80 leading-relaxed max-w-[280px]">
              Ексклюзивна жіноча білизна, що підкреслює твою унікальність. Відчуй преміальну якість у кожному дотику.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                <FacebookIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Блок 2: Каталог */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Каталог</h4>
            <div className="flex flex-col gap-3">
              {['Труси', 'Базова білизна', 'Еротична білизна', 'Боді', 'Халати'].map((item) => (
                <Link key={item} href="/catalog" className="text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Блок 3: Клієнтам */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Клієнтам</h4>
            <div className="flex flex-col gap-3">
              {['Оплата і доставка', 'Обмін та повернення', 'Відгуки', 'Таблиця розмірів'].map((item) => (
                <Link key={item} href="/info" className="text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Блок 4: Контакти */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-2">Контакти</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm opacity-80">
                <Phone className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <a href="tel:+380680000000" className="hover:opacity-100">+38 (068) 000-00-00</a>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <Mail className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <a href="mailto:info@marwood.ua" className="hover:opacity-100">info@marwood.ua</a>
              </div>
              <div className="flex items-start gap-3 text-sm opacity-80">
                <MapPin className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>Відправка з м. Хмельницький<br/>по всій Україні</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-milky/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Marwood Lingerie. Всі права захищені.
          </p>
          <Link href="/privacy" className="text-[10px] opacity-50 hover:opacity-100 uppercase tracking-widest transition-opacity">
            Політика конфіденційності
          </Link>
        </div>
      </div>
    </footer>
  );
}