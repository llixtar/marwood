import { RefreshCw, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Обмін та повернення | Marwood',
  description: 'Інформація про умови обміну та повернення товарів у магазині Marwood.',
};

export default function ReturnsPage() {
  return (
    <div className="bg-milky min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-light uppercase tracking-[0.3em] text-bottle mb-12 text-center">
          Обмін та повернення
        </h1>

        <div className="space-y-12">
          {/* Важливо про законодавство */}
          <section className="bg-amber-50/30 p-8 md:p-10 border border-amber-200">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-10 h-10 text-amber-600 flex-shrink-0" strokeWidth={1.5} />
              <div className="space-y-4 text-amber-900 leading-relaxed">
                <h2 className="text-sm font-bold uppercase tracking-widest">Згідно із Законодавством України</h2>
                <p className="text-sm">
                  Відповідно до Постанови Кабінету Міністрів України від 19 березня 1994 р. № 172, **натільно білизна та панчішно-шкарпеткові вироби належної якості входять до переліку товарів, що не підлягають обміну або поверненню**.
                </p>
                <p className="text-xs opacity-70">
                  Це зумовлено вимогами гігієни та безпеки споживачів.
                </p>
              </div>
            </div>
          </section>

          {/* Наша лояльність */}
          <section className="bg-white p-8 md:p-12 shadow-sm border border-bottle/5 space-y-8">
            <h2 className="text-xl md:text-2xl font-light uppercase tracking-widest text-bottle mb-6">Проте, ми цінуємо наших клієнтів</h2>
            
            <p className="text-bottle/80 leading-relaxed">
              Ми розуміємо, що іноді важко обрати розмір онлайн. Тому Marwood пропонує можливість **обміну** за таких умов:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-bottle">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs uppercase font-bold tracking-widest">Обмін можливий, якщо:</span>
                </div>
                <ul className="text-sm text-bottle/70 space-y-3">
                  <li>• Ви звернулися протягом **2 днів** після отримання.</li>
                  <li>• Товар не має слідів використання та сторонніх запахів.</li>
                  <li>• Всі бірки, етикетки та пакування збережені в оригінальному вигляді.</li>
                  <li>• Ви перевірили товар на пошті та зафіксували необхідність обміну.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-bottle">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-xs uppercase font-bold tracking-widest">Обмін неможливий, якщо:</span>
                </div>
                <ul className="text-sm text-bottle/70 space-y-3">
                  <li>• Трус або боді були приміряні на голе тіло.</li>
                  <li>• Товар було попрано або пошкоджено.</li>
                  <li>• Зрізані бірки або пошкоджена упаковка.</li>
                  <li>• З моменту отримання пройшло більше 14 днів.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Процедура обміну */}
          <section className="bg-bottle text-milky p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <RefreshCw strokeWidth={1.5} className="w-10 h-10" />
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-widest">Як здійснити обмін?</h2>
            </div>
            
            <ol className="list-decimal list-inside space-y-6 text-sm opacity-90 leading-relaxed font-light">
              <li>Напишіть нам в Instagram або зв&apos;яжіться за номером телефону.</li>
              <li>Надішліть фото товару та вкажіть причину обміну (не підійшов розмір / виявлено дефект).</li>
              <li>Надішліть товар Новою Поштою (рахунок оплачує клієнт, окрім випадків виробничого браку).</li>
              <li>Після перевірки товару нашими фахівцями, ми надішлемо вам інший розмір або модель протягом 1-3 днів.</li>
            </ol>
          </section>

          <p className="text-center text-xs text-bottle/40 max-w-2xl mx-auto leading-relaxed">
            Будь ласка, перевіряйте замовлення безпосередньо у відділенні «Нової Пошти». У разі виявлення пошкоджень або невідповідності замовлення — відмовляйтеся від отримання та одразу зв&apos;яжіться з нами.
          </p>
        </div>
      </div>
    </div>
  );
}
