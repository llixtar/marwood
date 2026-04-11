'use client';

import { useState, useEffect, useTransition } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signUpAction, signInAction } from '@/app/actions/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useRouter } from 'next/navigation';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refreshSession } = useAuthStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Заповніть всі поля');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const result = await signInAction({ email, password });

    if (result.success) {
      await refreshSession();
      startTransition(() => {
        router.refresh(); // Оновлюємо серверні дані
      });
      onClose();
      resetForm();
    } else {
      setError(result.error || 'Помилка входу');
    }
    setIsSubmitting(false);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError("Заповніть обов'язкові поля");
      return;
    }
    if (password.length < 6) {
      setError('Пароль має містити мінімум 6 символів');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const result = await signUpAction({ email, password, fullName, phone });

    if (result.success) {
      if (result.needsConfirmation) {
        setSuccess('Перевірте пошту для підтвердження реєстрації!');
      } else {
        await refreshSession();
        startTransition(() => {
          router.refresh(); // Оновлюємо серверні дані
        });
        onClose();
        resetForm();
      }
    } else {
      setError(result.error || 'Помилка реєстрації');
    }
    setIsSubmitting(false);
  };


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-milky w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Закрити */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bottle/40 hover:text-bottle transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h2 className="text-lg font-light uppercase tracking-[0.3em] text-bottle">
            {mode === 'login' ? 'Вхід' : 'Реєстрація'}
          </h2>
          <p className="text-[10px] text-bottle/40 mt-1 uppercase tracking-widest">
            Marwood — Ексклюзивна білизна
          </p>
        </div>

        {/* Tabs */}
        <div className="px-8 flex border-b border-bottle/10">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all ${
              mode === 'login'
                ? 'border-bottle text-bottle'
                : 'border-transparent text-bottle/30 hover:text-bottle/50'
            }`}
          >
            Вхід
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all ${
              mode === 'register'
                ? 'border-bottle text-bottle'
                : 'border-transparent text-bottle/30 hover:text-bottle/50'
            }`}
          >
            Реєстрація
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4">

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-xs">
              {error}
            </div>
          )}

          {/* Register extra fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1 block">
                  Ваше ім&apos;я *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ім'я та прізвище"
                    className="w-full border border-bottle/15 pl-10 pr-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1 block">
                  Телефон <span className="text-bottle/30">(опціонально)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+38 (0__) ___-__-__"
                    className="w-full border border-bottle/15 pl-10 pr-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30 font-mono"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1 block">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-bottle/15 pl-10 pr-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1 block">
              Пароль *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Мінімум 6 символів' : '••••••••'}
                className="w-full border border-bottle/15 pl-10 pr-10 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                style={{ fontSize: '16px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    mode === 'login' ? handleLogin() : handleRegister();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bottle/30 hover:text-bottle/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={isSubmitting}
            className="w-full bg-bottle text-milky py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-bottle/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Обробка...
              </>
            ) : (
              <>
                {mode === 'login' ? 'Увійти' : 'Зареєструватись'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
