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
  { id: 1, title: 'Еротична білизна', link: '/category/erotic', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800' },
  { id: 2, title: 'Костюми еротичні', link: '/category/costumes', image: 'https://images.unsplash.com/photo-1574634534833-28929bb1f6eb?q=80&w=800' }, // Змінене фото
  { id: 3, title: 'Піжами', link: '/category/pajamas', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800' },
];

// Дані для нижнього ряду (4 картинки)
const bottomCategories = [
  { id: 4, title: 'Базова білизна', link: '/category/basic', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800' },
  { id: 5, title: 'Труси', link: '/category/panties', image: 'https://images.unsplash.com/photo-1617392652178-953b1b9eeb2c?q=80&w=800' }, // Змінене фото
  { id: 6, title: 'Боді', link: '/category/body', image: 'https://images.unsplash.com/photo-1508243529287-e21914733111?q=80&w=800' },
  { id: 7, title: 'Халати', link: '/category/robes', image: 'https://images.unsplash.com/photo-1583532452513-a02186582ccd?q=80&w=800' },
];

export function CatalogGallery() {
  // Налаштовуємо таймери для каруселей (stopOnInteraction: true означає, що коли юзер почне свайпати сам, таймер зупиниться)
  const pluginTop = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const pluginBottom = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

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
          {/* Нижній ряд: 4 колонки */}
          <div className="grid grid-cols-4 gap-4 h-[350px]">
            {bottomCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>

        {/* --- МОБІЛЬНА ВЕРСІЯ (Каруселі) --- */}
        <div className="md:hidden flex flex-col gap-6">
          {/* Карусель 1: Верхні категорії */}
          <Carousel 
            plugins={[pluginTop.current]}
            opts={{ align: "center", loop: true }} 
            className="w-full"
          >
            <CarouselContent>
              {topCategories.map((cat) => (
                // Змінили basis на 100%, щоб картинка була по центру і не показувала наступну
                <CarouselItem key={cat.id} className="basis-full">
                  <div className="h-[450px]">
                    <CategoryCard category={cat} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Карусель 2: Нижні категорії */}
          <Carousel 
            plugins={[pluginBottom.current]}
            opts={{ align: "center", loop: true }} 
            className="w-full"
          >
            <CarouselContent>
              {bottomCategories.map((cat) => (
                <CarouselItem key={cat.id} className="basis-full">
                  <div className="h-[400px]">
                    <CategoryCard category={cat} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

      </div>
    </section>
  );
}

// Допоміжний компонент картки
function CategoryCard({ category }: { category: { title: string, link: string, image: string } }) {
  return (
    <Link href={category.link} className="relative block w-full h-full overflow-hidden group rounded-md">
      <Image
        src={category.image}
        alt={category.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Градієнт знизу для читабельності тексту */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Текст */}
      <div className="absolute bottom-6 left-6 text-white">
        <h3 className="text-2xl uppercase tracking-widest font-light drop-shadow-md">
          {category.title}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold mt-2 inline-block border-b border-white/50 pb-1 group-hover:border-white transition-colors">
          Дивитись ➔
        </span>
      </div>
    </Link>
  );
}