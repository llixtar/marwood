'use client';

import Link from 'next/link';
import { Menu, ChevronDown, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from './GlobalSearch';
import { CartButton } from '@/components/cart/CartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { AuthButton } from '@/components/auth/AuthProvider';
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
import { useState } from 'react';

export function Header() {
  const [isPlusSizeOpen, setIsPlusSizeOpen] = useState(false);
  const [menuValue, setMenuValue] = useState("");

  const handleLinkClick = () => {
    setMenuValue("");
    setIsPlusSizeOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-bottle/10 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">

        {/* --- ЛІВА ЧАСТИНА (Десктоп: Навігація | Мобілка: Бургер) --- */}
        <div className="flex-none md:flex-1 flex items-center justify-start">

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

                <nav className="flex flex-col gap-2 mt-8 pl-6">

                  {/* КАТАЛОГ (Мобільний випадаючий список) */}
                  <details className="group py-2" open>
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-xl font-medium text-bottle [&::-webkit-details-marker]:hidden">
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

                      <SheetClose asChild><Link href="/category/swimwear" className="text-base text-bottle/80 hover:text-bottle">Купальники</Link></SheetClose>

                      {/* Плюс сайз з підкатегоріями */}
                      <details className="group/sub">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-base text-bottle/80 hover:text-bottle [&::-webkit-details-marker]:hidden">
                          Плюс сайз
                          <ChevronDown className="h-4 w-4 transition-transform group-open/sub:rotate-180" />
                        </summary>
                        <div className="mt-3 flex flex-col gap-4 pl-4 border-l border-bottle/10">
                          <SheetClose asChild><Link href="/category/plus-size" className="text-sm text-bottle/60 hover:text-bottle italic">Дивитись все</Link></SheetClose>
                          <SheetClose asChild><Link href="/category/plus-size-swimwear" className="text-sm text-bottle/60 hover:text-bottle">Купальники</Link></SheetClose>
                        </div>
                      </details>
                    </div>
                  </details>

                  {/* АКЦІЇ */}
                  <div className="py-2">
                    <SheetClose asChild>
                      <Link
                        href="/#sale"
                        onClick={() => {
                          if (window.location.pathname === '/') {
                            setTimeout(() => {
                              window.dispatchEvent(new HashChangeEvent('hashchange'));
                            }, 10);
                          }
                        }}
                        className="text-xl font-heading font-medium text-bottle hover:opacity-60 transition-opacity uppercase tracking-widest"
                      >
                        Акції
                      </Link>
                    </SheetClose>
                  </div>

                  {/* ІНФОРМАЦІЯ (Мобільний випадаючий список) */}
                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-xl font-medium text-bottle [&::-webkit-details-marker]:hidden">
                      Інформація
                      <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-bottle/10">
                      <SheetClose asChild><Link href="/delivery" className="text-base text-bottle/80 hover:text-bottle">Оплата і доставка</Link></SheetClose>
                      <SheetClose asChild><Link href="/returns" className="text-base text-bottle/80 hover:text-bottle">Обмін та повернення</Link></SheetClose>
                      <SheetClose asChild><Link href="/care" className="text-base text-bottle/80 hover:text-bottle">Догляд за білизною</Link></SheetClose>
                      <SheetClose asChild><Link href="/reviews" className="text-base text-bottle/80 hover:text-bottle">Відгуки</Link></SheetClose>
                    </div>
                  </details>

                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Десктопна навігація */}
          <div className="hidden md:flex">
            <NavigationMenu value={menuValue} onValueChange={setMenuValue}>
              <NavigationMenuList>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    className="!bg-bottle !text-white hover:!bg-bottle/90 data-[state=open]:!bg-bottle/90 rounded-full px-5 py-2.5 h-auto flex items-center gap-2 group transition-all"
                  >
                    <LayoutGrid className="w-4 h-4 opacity-80" />
                    <span className="font-heading font-bold uppercase text-[10px] tracking-[0.2em]">Каталог</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                  >
                    <ul className="flex flex-col w-[260px] p-2 bg-milky shadow-2xl border border-bottle/10 rounded-2xl">
                      <li><NavigationMenuLink asChild><Link href="/category/panties" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Труси</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/basic" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Базова білизна</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/erotic" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Еротична білизна</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/costumes" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Костюми еротичні</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/robes" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Халати</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/pajamas" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Піжами</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/category/body" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Боді</Link></NavigationMenuLink></li>

                      <li><NavigationMenuLink asChild><Link href="/category/swimwear" onClick={handleLinkClick} className="block px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium">Купальники</Link></NavigationMenuLink></li>

                      {/* Плюс сайз з підкатегоріями */}
                      <li className="flex flex-col">
                        <button
                          onClick={() => setIsPlusSizeOpen(!isPlusSizeOpen)}
                          className="flex items-center justify-between w-full px-4 py-2 hover:bg-bottle hover:text-white text-bottle rounded-xl transition-all text-sm font-medium group/btn"
                        >
                          <span>Плюс сайз</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isPlusSizeOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isPlusSizeOpen && (
                          <ul className="pl-6 mt-1 mb-2 flex flex-col gap-1 transition-all">
                            <li>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/category/plus-size"
                                  onClick={handleLinkClick}
                                  className="block px-4 py-1.5 hover:text-bottle text-bottle/60 transition-all text-[13px] font-medium border-l border-bottle/10 italic"
                                >
                                  Дивитись все
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/category/plus-size-swimwear"
                                  onClick={handleLinkClick}
                                  className="block px-4 py-1.5 hover:text-bottle text-bottle/60 transition-all text-[13px] font-medium border-l border-bottle/10"
                                >
                                  Купальники
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} !bg-transparent !text-bottle hover:!bg-bottle/5 font-heading font-bold uppercase text-[10px] tracking-[0.2em]`}>
                    <Link
                      href="/#sale"
                      onClick={() => {
                        handleLinkClick();
                        // Якщо ми вже на головній, примусово викликаємо подію зміни хешу
                        if (window.location.pathname === '/') {
                          setTimeout(() => {
                            window.dispatchEvent(new HashChangeEvent('hashchange'));
                          }, 10);
                        }
                      }}
                    >
                      Акції
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    className="bg-transparent text-bottle hover:bg-bottle/5 font-heading font-bold uppercase text-[10px] tracking-[0.2em]"
                  >
                    Інформація
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                  >
                    <ul className="grid w-[240px] gap-2 p-4 bg-milky shadow-2xl border border-bottle/10 rounded-md">
                      <li><NavigationMenuLink asChild><Link href="/delivery" onClick={handleLinkClick} className="block p-3 hover:bg-bottle hover:text-white text-bottle rounded-md transition-all text-sm font-medium">Оплата і доставка</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/returns" onClick={handleLinkClick} className="block p-3 hover:bg-bottle hover:text-white text-bottle rounded-md transition-all text-sm font-medium">Обмін та повернення</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/care" onClick={handleLinkClick} className="block p-3 hover:bg-bottle hover:text-white text-bottle rounded-md transition-all text-sm font-medium">Догляд за білизною</Link></NavigationMenuLink></li>
                      <li><NavigationMenuLink asChild><Link href="/reviews" onClick={handleLinkClick} className="block p-3 hover:bg-bottle hover:text-white text-bottle rounded-md transition-all text-sm font-medium">Відгуки</Link></NavigationMenuLink></li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* --- ЦЕНТР (Логотип) --- */}
        <div className="flex-1 flex justify-start md:justify-center ml-2 md:ml-0">
          <Link href="/" className="text-base md:text-3xl font-heading font-bold uppercase tracking-widest md:tracking-[0.3em] text-bottle transition-all">
            Marwood
          </Link>
        </div>

        {/* --- ПРАВА ЧАСТИНА (Іконки) --- */}
        <div className="flex-1 flex items-center justify-end gap-1 md:gap-4">
          <GlobalSearch />
          <WishlistButton />
          <AuthButton />
          <CartButton />
        </div>

      </div>
    </header>
  );
}