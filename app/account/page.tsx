'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { updateCustomerProfile } from '@/app/actions/customers';
import { User, Mail, Phone, MapPin, Truck, Save, Loader2, CheckCircle2, ChevronRight, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, profile, fetchProfile, isInitialized } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  if (!isInitialized) return null;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-light uppercase tracking-widest text-bottle mb-4">Приватна зона</h1>
        <p className="text-bottle/60 mb-8 text-center max-w-md">
          Будь ласка, авторизуйтесь, щоб отримати доступ до свого профілю та історії замовлень.
        </p>
        <button 
          onClick={() => (window as any).dispatchOpenAuth?.()}
          className="bg-bottle text-milky px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-bottle/90 transition-colors"
        >
          Увійти
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const result = await updateCustomerProfile(user.id, {
      full_name: fullName,
      phone: phone,
    });

    if (result.success) {
      await fetchProfile();
      setMessage({ type: 'success', text: 'Профіль оновлено успішно' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Помилка оновлення' });
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-milky min-h-screen py-12 lg:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar / Navigation */}
          <aside className="lg:w-1/4">
            <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-bottle mb-8">Мій акаунт</h1>
            <nav className="space-y-1">
              <Link 
                href="/account" 
                className="flex items-center justify-between p-4 bg-bottle text-milky text-xs font-bold uppercase tracking-widest"
              >
                Особисті дані
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/account/orders" 
                className="flex items-center justify-between p-4 bg-white text-bottle text-xs font-bold uppercase tracking-widest hover:bg-bottle/5 transition-colors border border-bottle/10"
              >
                Мої замовлення
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
            
            <div className="mt-12 p-6 bg-bottle/5 border border-dashed border-bottle/20 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 mb-2">Статус лояльності</p>
              <p className="text-xs text-bottle mb-4">Ви зробили {profile?.orders_count || 0} замовлень</p>
              <div className="w-full h-1 bg-bottle/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-bottle transition-all duration-1000" 
                  style={{ width: `${Math.min(((profile?.orders_count || 0) / 5) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-bottle/40 mt-2 uppercase tracking-tighter">
                {5 - (profile?.orders_count || 0) > 0 
                  ? `Ще ${5 - (profile?.orders_count || 0)} до наступного рівня`
                  : 'Максимальний рівень клієнта'}
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="bg-white p-8 lg:p-12 shadow-sm border border-bottle/5">
              <h2 className="text-lg font-light uppercase tracking-widest text-bottle mb-8 border-b border-bottle/10 pb-4">
                Персональна інформація
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                {message.text && (
                  <div className={`p-4 text-xs flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                      Ім&apos;я та Прізвище
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/20" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-bottle/10 pl-10 pr-4 py-3 text-sm focus:border-bottle focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                      Телефон
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/20" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-bottle/10 pl-10 pr-4 py-3 text-sm focus:border-bottle focus:outline-none transition-colors"
                        placeholder="+380..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/50 mb-2 block">
                    Email (не можна змінити)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/10" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border border-bottle/5 pl-10 pr-4 py-3 text-sm bg-gray-50 text-bottle/40 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-bottle text-milky px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-bottle/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Зберегти зміни
                  </button>
                </div>
              </form>

              {/* Saved Delivery Address Info */}
              <div className="mt-16">
                <h2 className="text-lg font-light uppercase tracking-widest text-bottle mb-8 border-b border-bottle/10 pb-4">
                  Адреса за замовчуванням
                </h2>
                
                {profile?.saved_city ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-milky border border-bottle/5 space-y-3">
                      <div className="flex items-center gap-2 text-bottle/40">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Місто</span>
                      </div>
                      <p className="text-sm text-bottle font-medium">{profile.saved_city}</p>
                      
                      <div className="flex items-center gap-2 text-bottle/40 pt-2">
                        <Truck className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Спосіб доставки</span>
                      </div>
                      <p className="text-sm text-bottle">
                        {profile.saved_delivery_method === 'nova_poshta_warehouse' 
                          ? 'У відділення Нової Пошти' 
                          : 'Кур&apos;єром Нової Пошти'}
                      </p>
                    </div>

                    <div className="p-6 bg-milky border border-bottle/5 space-y-3">
                      <div className="flex items-center gap-2 text-bottle/40">
                        <Building2 className="w-4 h-4 text-bottle/40" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Деталі</span>
                      </div>
                      <p className="text-sm text-bottle">
                        {profile.saved_delivery_method === 'nova_poshta_warehouse' 
                          ? profile.saved_warehouse 
                          : profile.saved_address}
                      </p>
                      <p className="text-[9px] text-bottle/30 italic pt-2">
                        Адреса оновлюється автоматично після успішного замовлення
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-bottle/10 text-center">
                    <p className="text-xs text-bottle/40 italic">
                      У вас ще немає збереженої адреси. Вона з&apos;явиться тут після першого замовлення.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function Building2(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  );
}
