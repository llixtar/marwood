'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, User, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export function Header() {
  return (
    // Змінили z-[100] на z-40, щоб бургер (z-50) міг відкритися ПОВЕРХ хедера
    <header className="sticky top-0 z-40 w-full border-b border-bottle/10 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        
        {/* --- ЛІВА ЧАСТИНА (Десктоп: Навігація | Мобілка: Бургер) --- */}
        <div className="flex-1 flex items-center justify-start">
          
          {/* Мобільний бургер */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-bottle">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-milky border-r border-bottle/10 w-[300px] overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>Меню навігації</SheetTitle>
                  <SheetDescription>Навігація по категоріям</SheetDescription>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-8">
                  
                  {/* КАТАЛОГ (Мобільний випадаючий список) */}
                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-medium text-bottle [&::-webkit-details-marker]:hidden">
                      Каталог
                      <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-bottle/10">
                      <SheetClose asChild><Link href="/category/panties" className="text-base text-bottle/80 hover:text-bottle">Труси</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/basic" className="text-base text-bottle/80 hover:text-bottle">Базова білизна</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/erotic" className="text-base text-bottle/80 hover:text-bottle">Еротична білизна</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/costumes" className="text-base text-bottle/80 hover:text-bottle">Костюми еротичні</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/robes" className="text-base text-bottle/80 hover:text-bottle">Халати</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/pajamas" className="text-base text-bottle/80 hover:text-bottle">Піжами</Link></SheetClose>
                      <SheetClose asChild><Link href="/category/body" className="text-base text-bottle/80 hover:text-bottle">Боді</Link></SheetClose>
                    </div>
                  </details>

                  {/* АКЦІЇ */}
                  <div className="py-2">
                    <SheetClose asChild>
                      <Link href="/sale" className="text-xl font-medium text-red-600 hover:opacity-60 transition-opacity">
                        Акції
                      </Link>
                    </SheetClose>
                  </div>

                  {/* ІНФОРМАЦІЯ (Мобільний випадаючий список) */}
                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-medium text-bottle [&::-webkit-details-marker]:hidden">
                      Інформація
                      <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-bottle/10">
                      <SheetClose asChild><Link href="/delivery" className="text-base text-bottle/80 hover:text-bottle">Оплата і доставка</Link></SheetClose>
                      <SheetClose asChild><Link href="/returns" className="text-base text-bottle/80 hover:text-bottle">Обмін та повернення</Link></SheetClose>
                      <SheetClose asChild><Link href="/reviews" className="text-base text-bottle/80 hover:text-bottle">Відгуки</Link></SheetClose>
                    </div>
                  </details>

                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Десктопна навігація */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                
                <NavigationMenuItem>
                  {/* Блокуємо hover-події, щоб меню відкривалося ТІЛЬКИ по кліку */}
                  <NavigationMenuTrigger 
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    className="bg-transparent text-bottle hover:bg-bottle/5"
                  >
                    Каталог
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                  >
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[600px] md:grid-cols-2 bg-milky shadow-2xl border border-bottle/10 rounded-md">
                      <li><Link href="/category/panties" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Труси</Link></li>
                      <li><Link href="/category/basic" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Базова білизна</Link></li>
                      <li><Link href="/category/erotic" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Еротична білизна</Link></li>
                      <li><Link href="/category/costumes" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Костюми еротичні</Link></li>
                      <li><Link href="/category/robes" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Халати</Link></li>
                      <li><Link href="/category/pajamas" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Піжами</Link></li>
                      <li><Link href="/category/body" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors">Боді</Link></li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/sale" className="text-red-600 font-medium bg-transparent hover:bg-bottle/5">Акції</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  {/* Блокуємо hover-події, щоб меню відкривалося ТІЛЬКИ по кліку */}
                  <NavigationMenuTrigger 
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    className="bg-transparent text-bottle hover:bg-bottle/5"
                  >
                    Інформація
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                  >
                    <ul className="grid w-[240px] gap-2 p-4 bg-milky shadow-2xl border border-bottle/10 rounded-md">
                      <li><Link href="/delivery" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors text-sm">Оплата і доставка</Link></li>
                      <li><Link href="/returns" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors text-sm">Обмін та повернення</Link></li>
                      <li><Link href="/reviews" className="block p-3 hover:bg-bottle/5 text-bottle rounded-md transition-colors text-sm">Відгуки</Link></li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* --- ЦЕНТР (Логотип) --- */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] text-bottle">
            Marwood
          </Link>
        </div>

        {/* --- ПРАВА ЧАСТИНА (Іконки) --- */}
        <div className="flex-1 flex items-center justify-end gap-1 md:gap-4">
          <Button variant="ghost" size="icon" className="text-bottle hover:bg-bottle/5 hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-bottle hover:bg-bottle/5">
            <User className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative text-bottle hover:bg-bottle/5">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-bottle text-milky text-[9px] flex items-center justify-center font-bold">
              0
            </span>
          </Button>
        </div>

      </div>
    </header>
  );
}