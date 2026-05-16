'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { User, Package, Settings, LogOut, ChevronDown, Bell } from 'lucide-react';
import { getNewOrdersCount, getCustomerOrderStats } from '@/app/actions/orders';

export function UserMenu() {
  const { user, profile, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [customerStats, setCustomerStats] = useState({ unpaid: 0, updated: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      if (isAdmin) {
        const count = await getNewOrdersCount();
        setAdminCount(count);
        setCustomerStats({ unpaid: 0, updated: 0 });
      } else {
        const stats = await getCustomerOrderStats(user.id);
        
        // Звіряємо з localStorage (які оновлення вже бачили)
        let unreadUpdates = 0;
        try {
          const viewedStr = localStorage.getItem('viewed_order_updates');
          const viewed = viewedStr ? JSON.parse(viewedStr) : {};
          
          unreadUpdates = stats.updatedOrders.filter((o: any) => {
            // Якщо ще не бачили, або статус/час оновився після того, як бачили
            return !viewed[o.id] || viewed[o.id] < o.updated_at;
          }).length;
        } catch (e) {
          unreadUpdates = stats.updatedOrders.length;
        }

        setCustomerStats({ unpaid: stats.unpaid, updated: unreadUpdates });
      }
    }

    fetchStats();

    // Слухаємо подію оновлення
    const handleRefresh = () => fetchStats();
    window.addEventListener('refresh-orders-count', handleRefresh);

    // Періодичне оновлення (раз на 2 хвилини)
    const interval = setInterval(fetchStats, 120000);

    return () => {
      window.removeEventListener('refresh-orders-count', handleRefresh);
      clearInterval(interval);
    };
  }, [isAdmin, user]);

  if (!user) return null;

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Користувач';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const { clearCart } = useCartStore();
  const { clearWishlist } = useWishlistStore();

  const handleSignOut = async () => {
    await signOut();
    clearCart();
    clearWishlist();
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-bottle hover:bg-bottle/5 px-2 py-1.5 rounded transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-bottle text-milky flex items-center justify-center text-[10px] font-bold relative">
          {initials}
          {isAdmin && adminCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse" />
          )}
          {!isAdmin && customerStats.unpaid > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          )}
          {!isAdmin && customerStats.updated > 0 && customerStats.unpaid === 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline max-w-[100px] truncate">
          {displayName.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 text-bottle/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-bottle/10 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="px-4 py-3 border-b border-bottle/10 bg-[#fafaf5]">
            <p className="text-xs font-bold text-bottle truncate">{displayName}</p>
            <p className="text-[10px] text-bottle/40 truncate">{user.email}</p>
            {profile?.orders_count ? (
              <p className="text-[10px] text-bottle/40 mt-1">
                Замовлень: {profile.orders_count}
              </p>
            ) : null}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-bottle hover:bg-bottle/5 transition-colors"
            >
              <Settings className="w-4 h-4 text-bottle/40" />
              Мої дані
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-bottle hover:bg-bottle/5 transition-colors group/item"
            >
              <Package className="w-4 h-4 text-bottle/40" />
              <div className="flex items-center justify-between flex-1">
                <span className="flex items-center gap-2">
                  {isAdmin ? 'Замовлення' : 'Мої замовлення'}
                  {!isAdmin && customerStats.unpaid > 0 && (
                    <span className="animate-pulse text-red-500 font-bold">!</span>
                  )}
                  {!isAdmin && customerStats.updated > 0 && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  )}
                </span>
                {isAdmin && adminCount > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    {adminCount}
                  </span>
                )}
                {!isAdmin && (customerStats.unpaid > 0 || customerStats.updated > 0) && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold text-white ${customerStats.unpaid > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                    {customerStats.unpaid > 0 ? customerStats.unpaid : customerStats.updated}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-bottle/10 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
