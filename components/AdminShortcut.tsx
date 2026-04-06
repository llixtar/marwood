'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AdminShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Гаряча клавіша: Alt + Shift + A (або кириличне 'Ф' на тій же кнопці)
      if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'ф')) {
        e.preventDefault();
        router.push('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null; // Робимо його невидимим, він тільки «слухає» події
}
