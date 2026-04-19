'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Дані для верхнього ряду (3 картинки)
const topCategories = [
  { id: 1, title: 'Еротична білизна', link: '/category/erotic', image: '/categories/erotic.jpg' },
  { id: 2, title: 'Костюми еротичні', link: '/category/costumes', image: '/categories/costumes.jpg' },
  { id: 3, title: 'Купальники', link: '/category/swimwear', image: '/categories/swimwear.jpg' },
];

// Дані для нижнього ряду (6 картинок)
const bottomCategories = [
  { id: 4, title: 'Базова білизна', link: '/category/basic', image: '/categories/basic.jpg' },
  { id: 5, title: 'Труси', link: '/category/panties', image: '/categories/panties2.jpg' },
  { id: 6, title: 'Боді', link: '/category/body', image: '/categories/body.jpg' },
  { id: 7, title: 'Халати', link: '/category/robes', image: '/categories/robes.jpg' },
  { id: 8, title: 'Піжами', link: '/category/pajamas', image: '/categories/pajamas.jpg' },
  { id: 9, title: 'Плюс сайз', link: '/category/plus-size', image: '/categories/plus-size.jpg' },
];

export function CatalogGallery() {
  // Налаштовуємо таймери для каруселей: не зупиняти повністю після свайпу, але паузнути при наведенні або взаємодії
  const pluginTop = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const pluginBottom = React.useRef(Autoplay({ delay: 6500, stopOnInteraction: false }));

  return (
    <section className="w-full py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center text-bottle mb-10 uppercase tracking-[0.2em]">
          Колекції
        </h2>

        {/* --- ДЕСКТОПНА ВЕРСІЯ (Сітка) --- */}
        <div className="hidden md:flex flex-col gap-4">
          {/* Верхній ряд: 3 колонки */}
          <div className="grid grid-cols-3 gap-4 h-[450px]">
            {topCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
          {/* Нижній ряд: 6 колонок (для балансу) */}
          <div className="grid grid-cols-6 gap-4 h-[350px]">
            {bottomCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>

        {/* --- МОБІЛЬНА ВЕРСІЯ (Каруселі) --- */}
        <div className="md:hidden flex flex-col gap-6">
          {/* Карусель 1: Верхні категорії */}
          <div className="w-full" onMouseEnter={() => pluginTop.current.stop()} onMouseLeave={() => pluginTop.current.play()} onTouchStart={() => pluginTop.current.stop()} onTouchEnd={() => pluginTop.current.play()}>
            <Carousel
              plugins={[pluginTop.current]}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
            <CarouselContent>
              {topCategories.map((cat) => (
                <CarouselItem key={cat.id} className="basis-1/2">
                  <div className="h-[240px]">
                    <CategoryCard category={cat} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            </Carousel>
          </div>

          {/* Карусель 2: Нижні категорії */}
          <div className="w-full" onMouseEnter={() => pluginBottom.current.stop()} onMouseLeave={() => pluginBottom.current.play()} onTouchStart={() => pluginBottom.current.stop()} onTouchEnd={() => pluginBottom.current.play()}>
            <Carousel
              plugins={[pluginBottom.current]}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {bottomCategories.map((cat) => (
                  <CarouselItem key={cat.id} className="basis-1/3 px-1">
                    <div className="h-[160px]">
                    <CategoryCard category={cat} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            </Carousel>
          </div>
        </div>

      </div>
    </section>
  );
}

// Допоміжний компонент картки
function CategoryCard({ category }: { category: { title: string, link: string, image: string } }) {
  return (
    <Link href={category.link} className="relative block w-full h-full overflow-hidden group">
      <Image
        src={category.image}
        alt={category.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Градієнт знизу для читабельності тексту */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Текст */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white max-w-[80%]">
        <h3 className="text-sm md:text-2xl uppercase tracking-widest font-light drop-shadow-md leading-tight">
          {category.title}
        </h3>
        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-medium mt-2 inline-block border-b border-white/50 pb-1 group-hover:border-white transition-colors">
          Дивитись ➔
        </span>
      </div>
    </Link>
  );
}