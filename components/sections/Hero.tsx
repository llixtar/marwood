'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Кастомна сітка: 35% відео, 25% дві фотки, 40% права фотка */}
      <div className="grid grid-cols-1 md:grid-cols-[35%_25%_40%] h-auto md:min-h-[85vh]">

        {/* ЛІВА ЧАСТИНА (ВІДЕО): 35% ширини */}
        <div className="relative h-[60vh] md:h-auto group overflow-hidden border-r border-bottle/5">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          >
            <source src="/hero/main-video.MOV" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-bottle/10 group-hover:bg-bottle/20 transition-colors duration-500" />

          <div className="absolute bottom-8 left-8 md:bottom-16 md:left-12 text-milky z-10">
            <span className="text-xs uppercase tracking-[0.4em] mb-3 block opacity-90 animate-in fade-in slide-in-from-bottom-2 duration-700">
              New Collection
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Чорне мереживне <br /> <span className="italic text-milky/80">боді</span>
            </h2>
            <Button asChild variant="outline" className="bg-transparent border border-milky text-milky hover:bg-milky hover:text-bottle rounded-none px-8 py-6 text-xs md:text-sm uppercase tracking-widest transition-all duration-500 backdrop-blur-sm">
              <Link href="/category/body">Переглянути</Link>
            </Button>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНА ЧАСТИНА (Дві фотки): 25% ширини */}
        <div className="flex flex-col border-r border-bottle/5">

          {/* ВЕРХНЯ ФОТО */}
          <div className="relative h-[25vh] md:flex-1 group overflow-hidden border-b border-bottle/5">
            <Image
              src="/hero/img-top.jpg"
              alt="Еротична білизна Marwood"
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-700 flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-xl md:text-2xl text-milky uppercase tracking-[0.2em] font-extralight mb-4 translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                Ніжність, що спокушає.
              </h3>
              <Button asChild variant="link" className="text-milky p-0 h-auto uppercase tracking-[0.3em] text-[10px] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 underline-offset-8">
                <Link href="/category/erotic">Переглянути ➔</Link>
              </Button>
            </div>
          </div>

          {/* НИЖНЯ ФОТО */}
          <div className="relative h-[25vh] md:flex-1 group overflow-hidden bg-milky">
            <Image
              src="/hero/img_bottom.jpg"
              alt="Піжами та халати Marwood"
              fill
              className="object-cover mix-blend-multiply opacity-90 transition-transform duration-[1.5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-milky/10 group-hover:bg-transparent transition-colors duration-500" />

            <div className="absolute top-6 right-6 md:right-auto md:top-8 md:left-8 text-bottle z-10 flex flex-col items-end md:items-start text-right md:text-left">
              <h3 className="text-xl md:text-2xl uppercase font-bold tracking-tight mb-2">SEXY POLICE</h3>
              <p className="text-xs mb-3 opacity-80 max-w-[150px] leading-relaxed">
                Додай трішки флірту та зухвалості!
              </p>
              <Link
                href="/category/costumes"
                className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-bottle pb-1 hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                Обрати
              </Link>
            </div>
          </div>

        </div>

        {/* ПРАВА ЧАСТИНА (НОВА ФОТКА): 40% ширини */}
        <div className="relative hidden md:block md:h-auto group overflow-hidden bg-bottle/5">
          <Image
            src="/hero/img-new.jpg"
            alt="Спеціальна пропозиція"
            fill
            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

          <div className="absolute bottom-8 left-8 md:bottom-16 md:left-12 text-milky z-10">
            <h3 className="text-3xl md:text-5xl uppercase tracking-widest font-light mb-4 leading-tight">
              Ніжний, м'який <br /> як хмаринка.
            </h3>
            <Button asChild variant="link" className="text-milky p-0 h-auto uppercase tracking-[0.3em] text-xs underline-offset-8 group-hover:text-milky/70 transition-colors">
              <Link href="/category/pajamas">Більше піжам ➔</Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}