import { Truck, CreditCard, ShieldCheck, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Оплата та доставка | Marwood',
  description: 'Інформація про способи оплати та доставки замовлень у магазині Marwood.',
};

export default function DeliveryPage() {
  return (
    <div className="bg-milky min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-light uppercase tracking-[0.3em] text-bottle mb-12 text-center">
          Оплата та доставка
        </h1>

        <div className="space-y-16">
          {/* Доставка */}
          <section className="bg-white p-8 md:p-12 shadow-sm border border-bottle/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-bottle/5 flex items-center justify-center text-bottle">
                <Truck strokeWidth={1.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-widest text-bottle">Доставка</h2>
            </div>
            
            <div className="space-y-6 text-bottle/80 leading-relaxed">
              <p>Ми здійснюємо доставку по всій території України, де працюють відділення <strong>Нової Пошти</strong>.</p>
              
              <ul className="list-none space-y-4">
                <li className="flex gap-4">
                  <span className="text-bottle">•</span>
                  <div>
                    <p className="font-bold text-bottle uppercase text-xs tracking-widest mb-1">До відділення або поштомату</p>
                    <p>Доставка здійснюється за тарифами перевізника. Зазвичай це займає 1-3 дні.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-bottle">•</span>
                  <div>
                    <p className="font-bold text-bottle uppercase text-xs tracking-widest mb-1">Кур&apos;єрська доставка</p>
                    <p>Адресна доставка кур&apos;єром Нової Пошти до ваших дверей.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-bottle">•</span>
                  <div className="p-4 bg-bottle/5 border-l-2 border-bottle">
                    <p className="font-bold text-bottle uppercase text-xs tracking-widest mb-1">Безкоштовна доставка</p>
                    <p>При замовленні на суму від <strong>2000 ₴</strong> доставка до відділення — безкоштовна.</p>
                  </div>
                </li>
              </ul>
              <p className="text-sm italic">Відправки здійснюються з м. Хмельницький щодня, окрім неділі.</p>
            </div>
          </section>

          {/* Оплата */}
          <section className="bg-white p-8 md:p-12 shadow-sm border border-bottle/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-bottle/5 flex items-center justify-center text-bottle">
                <CreditCard strokeWidth={1.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-widest text-bottle">Оплата</h2>
            </div>

            <div className="space-y-6 text-bottle/80 leading-relaxed">
              <p>Ви можете обрати найбільш зручний для вас спосіб оплати замовлення:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-bottle/10">
                  <p className="font-bold text-bottle uppercase text-xs tracking-widest mb-2">Онлайн-оплата</p>
                  <p className="text-sm">Оплата карткою Visa/MasterCard через захищене вікно Monobank (Apple Pay / Google Pay).</p>
                </div>
                <div className="p-6 border border-bottle/10">
                  <p className="font-bold text-bottle uppercase text-xs tracking-widest mb-2">Оплата на рахунок</p>
                  <p className="text-sm">Прямий переказ на рахунок ФОП за реквізитами (IBAN).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50/50 border-l-2 border-amber-200">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-900">
                  <strong>Зверніть увагу:</strong> Ми працюємо за повною або частковою передоплатою (150 ₴), оскільки білизна — це інтимний товар.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center space-y-4">
            <p className="text-sm text-bottle/50 uppercase tracking-widest">Виникли питання?</p>
            <div className="flex justify-center gap-8">
              <a href="tel:+380680000000" className="text-bottle font-bold hover:underline">+38 (068) 000-00-00</a>
              <a href="mailto:info@marwood.ua" className="text-bottle font-bold hover:underline">info@marwood.ua</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
