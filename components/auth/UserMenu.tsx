'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { User, Package, Settings, LogOut, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user, profile, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Користувач';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-bottle hover:bg-bottle/5 px-2 py-1.5 rounded transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-bottle text-milky flex items-center justify-center text-[10px] font-bold">
          {initials}
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
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-bottle hover:bg-bottle/5 transition-colors"
            >
              <Package className="w-4 h-4 text-bottle/40" />
              Мої замовлення
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
