export const metadata = {
  title: 'Політика конфіденційності | Marwood',
  description: 'Політика конфіденційності щодо обробки персональних даних клієнтів магазину Marwood.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-milky min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-16 shadow-sm border border-bottle/5">
          <h1 className="text-2xl md:text-4xl font-light uppercase tracking-[0.2em] text-bottle mb-12 border-b border-bottle/10 pb-8">
            Політика конфіденційності
          </h1>

          <div className="space-y-8 text-bottle/80 leading-relaxed text-sm md:text-base">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">1. Загальні положення</h2>
              <p>
                Ця Політика конфіденційності встановлює порядок отримання, зберігання, обробки, використання та розкриття персональних даних клієнтів (далі — Користувачі) інтернет-магазину Marwood (далі — Магазин).
              </p>
              <p>
                Використовуючи сайт marwood.ua або здійснюючи замовлення, Користувач погоджується з умовами даної Політики.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">2. Які дані ми збираємо</h2>
              <p>Для оформлення та доставки замовлення ми можемо збирати наступну інформацію:</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Прізвище, ім&apos;я та по батькові Користувача;</li>
                <li>Контактний номер телефону;</li>
                <li>Адреса електронної пошти;</li>
                <li>Адреса доставки (місто, номер відділення Нової Пошти або поштомату);</li>
                <li>Історія замовлень та вподобань.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">3. Мета збору та обробки даних</h2>
              <p>Персональні дані використовуються виключно для:</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Обробки та виконання ваших замовлень;</li>
                <li>Доставки товарів через логістичні компанії;</li>
                <li>Надання клієнтської підтримки та консультацій;</li>
                <li>Повідомлення про статус замовлення та новини магазину (за вашої згоди);</li>
                <li>Покращення якості сервісу нашого Магазину.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">4. Захист та зберігання даних</h2>
              <p>
                Ми вживаємо всіх необхідних технічних та організаційних заходів для захисту ваших даних від несанкціонованого доступу, зміни або знищення. Ваші дані передаються через захищене з&apos;єднання SSL.
              </p>
              <p>
                Ми не передаємо ваші персональні дані третім особам, за винятком випадків, коли це необхідно для виконання замовлення (наприклад, передача даних кур&apos;єрській службі).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">5. Права користувача</h2>
              <p>Ви маєте право:</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Знати, які ваші дані обробляються;</li>
                <li>Вимагати виправлення неточностей у ваших даних;</li>
                <li>Вимагати видалення ваших персональних даних з нашої бази;</li>
                <li>Відмовитися від отримання маркетингових повідомлень.</li>
              </ul>
            </section>

            <section className="space-y-4 border-t border-bottle/10 pt-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bottle">Зв&apos;язок з нами</h2>
              <p>Якщо у вас виникли питання щодо Політики конфіденційності, звертайтеся за адресою: <a href="mailto:info@marwood.ua" className="font-bold underline">info@marwood.ua</a>.</p>
            </section>

            <p className="text-xs opacity-50 pt-4 italic">
              Остання редакція від: {new Date().toLocaleDateString('uk-UA')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
