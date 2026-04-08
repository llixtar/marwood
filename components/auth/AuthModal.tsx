'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signUpAction, signInAction, signInWithGoogleAction } from '@/app/actions/auth';
import { useAuthStore } from '@/lib/store/authStore';

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
  const { initialize } = useAuthStore();

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
      await initialize();
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
        await initialize();
        onClose();
        resetForm();
      }
    } else {
      setError(result.error || 'Помилка реєстрації');
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await signInWithGoogleAction();
    } catch (err) {
      setError('Помилка авторизації через Google');
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

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-bottle/15 py-3 text-sm text-bottle hover:bg-bottle/5 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-xs font-medium">Увійти через Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-bottle/10" />
            <span className="text-[10px] text-bottle/30 uppercase tracking-wider">або</span>
            <div className="flex-1 h-px bg-bottle/10" />
          </div>

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
