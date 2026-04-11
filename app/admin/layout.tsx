import { createSupabaseServer } from '@/lib/supabase/server-ssr';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Globe } from 'lucide-react';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();

  // 1. Отримуємо поточного юзера
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // 2. Отримуємо профілі і перевіряємо чи є він адміном
  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] flex-col md:flex-row font-sans">

      {/* Бокова панель навігації */}
      <aside className="w-full md:w-64 bg-bottle text-milky flex flex-col p-6 shadow-xl z-10 hidden md:flex">
        <div className="text-2xl font-bold uppercase tracking-[0.3em] mb-12 border-b border-milky/20 pb-4">
          Marwood<br />
          <span className="text-sm font-light uppercase tracking-widest text-milky/60 mb-2 block mt-1">Admin Panel</span>
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          <Link href="/admin" className="flex items-center gap-3 hover:text-milky/70 transition-colors group">
            <LayoutDashboard className="w-5 h-5 text-milky/60 group-hover:text-milky/90" />
            <span className="uppercase text-sm tracking-wider font-light">Всі товари</span>
          </Link>

          <Link href="/admin/products/new" className="flex items-center gap-3 hover:text-milky/70 transition-colors group">
            <PlusCircle className="w-5 h-5 text-milky/60 group-hover:text-milky/90" />
            <span className="uppercase text-sm tracking-wider font-light">Додати товар</span>
          </Link>

          <Link href="/admin/inventory" className="flex items-center gap-3 hover:text-milky/70 transition-colors group">
            <LayoutDashboard className="w-5 h-5 text-milky/60 group-hover:text-milky/90" />
            <span className="uppercase text-sm tracking-wider font-light">Управління складом</span>
          </Link>

          <Link href="/" className="flex items-center gap-3 hover:text-milky/70 transition-colors group mt-auto pt-10 border-t border-milky/10">
            <Globe className="w-5 h-5 text-milky/60 group-hover:text-milky/90" />
            <span className="uppercase text-sm tracking-wider font-light opacity-80">Перейти на сайт</span>
          </Link>
        </nav>
      </aside>

      {/* Мобільна навігація (спрощена) */}
      <div className="md:hidden bg-bottle text-milky p-4 flex justify-between items-center shadow-md z-10">
        <div className="text-lg font-bold uppercase tracking-[0.2em]"></div>
        <div className="flex gap-4">
          <Link href="/admin" className="text-xs uppercase tracking-wider hover:opacity-70">Товари</Link>
          <Link href="/admin/inventory" className="text-xs uppercase tracking-wider hover:opacity-70 font-bold text-milky">Склад</Link>
          <Link href="/admin/products/new" className="text-xs uppercase tracking-wider hover:opacity-70">Додати</Link>
          <Link href="/" className="text-xs uppercase tracking-wider hover:opacity-70 opacity-60">Сайт</Link>
        </div>
      </div>

      {/* Робоча область */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {children}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
