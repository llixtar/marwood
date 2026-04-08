'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    initialize();

    // Дозволяємо відкривати модалку глобально через кастомну подію
    const handleOpenAuth = () => setAuthModalOpen(true);
    window.addEventListener('open-auth', handleOpenAuth);
    (window as any).dispatchOpenAuth = () => window.dispatchEvent(new CustomEvent('open-auth'));

    return () => {
      window.removeEventListener('open-auth', handleOpenAuth);
    };
  }, [initialize]);

  return (
    <>
      {children}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export function AuthButton() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <Button variant="ghost" size="icon" className="text-bottle hover:bg-bottle/5">
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-bottle hover:bg-bottle/5"
      onClick={() => (window as any).dispatchOpenAuth?.()}
    >
      <User className="h-5 w-5" />
    </Button>
  );
}
