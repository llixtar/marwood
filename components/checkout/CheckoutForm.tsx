'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { createOrderAction } from '@/app/actions/orders';
import { NovaPoshtaCitySelect, NovaPoshtaWarehouseSelect } from './NovaPoshtaSelect';
import { 
  User, Phone, Mail, MapPin, Truck, CreditCard, MessageSquare,
  ArrowRight, Loader2, ShieldCheck, Package, Building2, AlertCircle
} from 'lucide-react';

type DeliveryMethod = 'nova_poshta_warehouse' | 'nova_poshta_courier';
type PaymentMethod = 'monopay' | 'cod';

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('nova_poshta_warehouse');
  const [city, setCity] = useState('');
  const [cityRef, setCityRef] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [warehouseRef, setWarehouseRef] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('monopay');
  const [comment, setComment] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofill logic
  useEffect(() => {
    if (profile && mounted) {
      if (!name) setName(profile.full_name || '');
      if (!phone && profile.phone) setPhone(formatPhone(profile.phone));
      if (!email) setEmail(profile.email || '');
      
      // Автозаповнення адреси (корисно для постійних клієнтів)
      if (!city && profile.saved_city) {
        setCity(profile.saved_city);
        setCityRef(profile.saved_city_ref || '');
        setDeliveryMethod((profile.saved_delivery_method as DeliveryMethod) || 'nova_poshta_warehouse');
        
        if (profile.saved_delivery_method === 'nova_poshta_warehouse') {
          setWarehouse(profile.saved_warehouse || '');
          setWarehouseRef(profile.saved_warehouse_ref || '');
        } else {
          setAddress(profile.saved_address || '');
        }
      }
    }
  }, [profile, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const total = totalPrice();
  const codPrepaymentThreshold = 500;
  const codPrepaymentRequired = paymentMethod === 'cod' && total > codPrepaymentThreshold;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return '+' + digits;
    if (digits.length <= 5) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 8) return `+${digits.slice(0, 2)} (${digits.slice(2, 5)}) ${digits.slice(5)}`;
    if (digits.length <= 10) return `+${digits.slice(0, 2)} (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError("Вкажіть ваше ім'я");
      return false;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      setError('Вкажіть коректний номер телефону');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!city) {
      setError('Оберіть місто доставки');
      return false;
    }
    if (deliveryMethod === 'nova_poshta_warehouse' && !warehouse) {
      setError('Оберіть відділення Нової Пошти');
      return false;
    }
    if (deliveryMethod === 'nova_poshta_courier' && !address.trim()) {
      setError('Вкажіть адресу доставки');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    if (items.length === 0) {
      setError('Кошик порожній');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createOrderAction({
        customerName: name,
        customerPhone: phone.replace(/\D/g, ''),
        customerEmail: email || undefined,
        deliveryMethod,
        city,
        cityRef,
        warehouse: warehouse || undefined,
        warehouseRef: warehouseRef || undefined,
        address: deliveryMethod === 'nova_poshta_courier' ? address : undefined,
        paymentMethod,
        comment: comment || undefined,
        items,
      });

      if (result.success) {
        clearCart();

        if (result.paymentUrl) {
          // Redirect to MonoPay
          window.location.href = result.paymentUrl;
        } else {
          // COD → success page
          router.push(`/checkout/success?order=${result.orderNumber}`);
        }
      } else {
        setError(result.error || 'Сталася помилка при оформленні замовлення');
      }
    } catch (err) {
      setError('Сталася непередбачена помилка. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Прогрес-бар */}
      <div className="flex items-center gap-0">
        {[
          { num: 1, label: 'Контакти' },
          { num: 2, label: 'Доставка' },
          { num: 3, label: 'Оплата' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => { if (s.num < step || (s.num === 1) || (s.num === 2 && validateStep1()) || (s.num === 3 && validateStep1() && validateStep2())) { setStep(s.num); setError(''); }}}
              className={`flex items-center gap-2 transition-all ${
                step === s.num 
                  ? 'text-bottle font-bold' 
                  : step > s.num
                    ? 'text-green-600'
                    : 'text-bottle/30'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step === s.num 
                  ? 'border-bottle bg-bottle text-white' 
                  : step > s.num
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-bottle/20 text-bottle/30'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="text-[10px] uppercase tracking-widest hidden sm:inline">{s.label}</span>
            </button>
            {i < 2 && (
              <div className={`flex-1 h-[2px] mx-2 transition-all ${step > s.num ? 'bg-green-600' : 'bg-bottle/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Помилка */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-xs font-medium animate-in slide-in-from-top">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* КРОК 1: Контактні дані */}
      {step === 1 && (
        <div className="bg-white border border-bottle/10 p-6 space-y-5 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-widest text-bottle flex items-center gap-2">
            <User className="w-4 h-4" />
            Контактні дані
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
                Ваше ім&apos;я *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ім'я та прізвище"
                className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
                <Phone className="w-3 h-3 inline mr-1" />
                Телефон *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+38 (0__) ___-__-__"
                className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30 font-mono"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
                <Mail className="w-3 h-3 inline mr-1" />
                Email <span className="text-bottle/30">(опціонально)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => { if (validateStep1()) setStep(2); }}
            className="w-full bg-bottle text-milky py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2"
          >
            Далі — Доставка
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* КРОК 2: Доставка */}
      {step === 2 && (
        <div className="bg-white border border-bottle/10 p-6 space-y-5 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-widest text-bottle flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Доставка
          </h2>

          {/* Метод доставки */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 block">
              Спосіб доставки
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMethod('nova_poshta_warehouse')}
                className={`p-4 border text-left transition-all ${
                  deliveryMethod === 'nova_poshta_warehouse'
                    ? 'border-bottle bg-bottle/5'
                    : 'border-bottle/15 hover:border-bottle/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-bottle/60" />
                  <span className="text-xs font-bold text-bottle">У відділення</span>
                </div>
                <p className="text-[10px] text-bottle/50">Нова Пошта — відділення</p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('nova_poshta_courier')}
                className={`p-4 border text-left transition-all ${
                  deliveryMethod === 'nova_poshta_courier'
                    ? 'border-bottle bg-bottle/5'
                    : 'border-bottle/15 hover:border-bottle/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-bottle/60" />
                  <span className="text-xs font-bold text-bottle">Кур&apos;єр</span>
                </div>
                <p className="text-[10px] text-bottle/50">Нова Пошта — адресна доставка</p>
              </button>
            </div>
          </div>

          {/* Місто */}
          <NovaPoshtaCitySelect
            onCitySelect={(c, ref) => {
              setCity(c);
              setCityRef(ref);
              setWarehouse('');
              setWarehouseRef('');
            }}
            selectedCity={city}
          />

          {/* Відділення або адреса */}
          {deliveryMethod === 'nova_poshta_warehouse' ? (
            <NovaPoshtaWarehouseSelect
              cityRef={cityRef}
              cityName={city}
              onWarehouseSelect={(w, ref) => {
                setWarehouse(w);
                setWarehouseRef(ref);
              }}
              selectedWarehouse={warehouse}
            />
          ) : (
            city && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 block">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Адреса доставки кур&apos;єром *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Вулиця, будинок, квартира"
                  className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
                  style={{ fontSize: '16px' }}
                />
                <p className="text-[10px] text-bottle/40 -mt-1">
                  Наприклад: вул. Степана Бандери, 25, кв. 12
                </p>
              </div>
            )
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-4 border border-bottle/15 text-bottle/50 uppercase tracking-widest text-[10px] font-bold hover:border-bottle/30 transition-colors"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => { if (validateStep2()) setStep(3); }}
              className="flex-1 bg-bottle text-milky py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2"
            >
              Далі — Оплата
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* КРОК 3: Оплата */}
      {step === 3 && (
        <div className="bg-white border border-bottle/10 p-6 space-y-5 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-widest text-bottle flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Оплата
          </h2>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('monopay')}
              className={`w-full p-4 border text-left transition-all flex items-center gap-4 ${
                paymentMethod === 'monopay'
                  ? 'border-bottle bg-bottle/5'
                  : 'border-bottle/15 hover:border-bottle/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">mono</span>
              </div>
              <div>
                <span className="text-xs font-bold text-bottle block">Оплата онлайн</span>
                <span className="text-[10px] text-bottle/50">MonoPay — Visa, Mastercard, Apple Pay, Google Pay</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`w-full p-4 border text-left transition-all flex items-center gap-4 ${
                paymentMethod === 'cod'
                  ? 'border-bottle bg-bottle/5'
                  : 'border-bottle/15 hover:border-bottle/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-bottle/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-bottle/60" />
              </div>
              <div>
                <span className="text-xs font-bold text-bottle block">Наложений платіж</span>
                <span className="text-[10px] text-bottle/50">Оплата при отриманні (+ комісія НП)</span>
              </div>
            </button>
          </div>

          {codPrepaymentRequired && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <strong>Увага:</strong> Для замовлень понад {codPrepaymentThreshold} ₴ потрібна передоплата 200 ₴ для підтвердження.
              Ми зв&apos;яжемось з вами для уточнення.
            </div>
          )}

          {/* Коментар */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Коментар <span className="text-bottle/30">(опціонально)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Побажання до замовлення..."
              rows={3}
              className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30 resize-none"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Зведення */}
          <div className="bg-[#fafaf5] border border-bottle/10 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-bottle/60">
              <span>Одержувач:</span>
              <span className="font-medium text-bottle">{name}</span>
            </div>
            <div className="flex justify-between text-bottle/60">
              <span>Телефон:</span>
              <span className="font-mono text-bottle">{phone}</span>
            </div>
            <div className="flex justify-between text-bottle/60">
              <span>Доставка:</span>
              <span className="text-bottle text-right max-w-[60%] truncate">
                {deliveryMethod === 'nova_poshta_warehouse' ? warehouse : address}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-4 border border-bottle/15 text-bottle/50 uppercase tracking-widest text-[10px] font-bold hover:border-bottle/30 transition-colors"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-bottle text-milky py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-bottle/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обробка...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {paymentMethod === 'monopay' ? 'Оплатити' : 'Оформити замовлення'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
