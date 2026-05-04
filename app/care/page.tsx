import { Waves, Hand, WashingMachine, Wind, Sun, Box, Heart } from 'lucide-react';

export const metadata = {
  title: 'Догляд за білизною | Marwood',
  description: 'Поради щодо правильного догляду за вашою білизною, щоб вона служила довго.',
};

export default function CarePage() {
  const careSteps = [
    {
      icon: <Waves className="w-6 h-6" />,
      title: '1. Прання — делікатне і регулярне',
      content: (
        <>
          <p>Нижню білизну краще прати після кожного використання. Використовуй м’які мийні засоби (без агресивних відбілювачів).</p>
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-bottle/5 rounded-lg border border-bottle/5">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Бавовна</span>
              <span className="text-sm font-bold text-bottle">до 60°C</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-bottle/5 rounded-lg border border-bottle/5">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 leading-tight">Делікатні тканини (мереживо, шовк)</span>
              <span className="text-sm font-bold text-bottle sm:text-right">30°C або холодна вода</span>
            </div>
          </div>
        </>
      ),
    },
    {
      icon: <Hand className="w-6 h-6" />,
      title: '2. Ручне прання — найкращий варіант',
      content: 'Особливо для бюстгальтерів і тонких тканин. Просто замочи на 10–15 хвилин і акуратно прополощи, не викручуючи.',
    },
    {
      icon: <WashingMachine className="w-6 h-6" />,
      title: '3. Якщо пральна машина — то обережно',
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Використовуй спеціальні мішечки для білизни</li>
          <li>Обирай делікатний режим</li>
          <li>Застібай бюстгальтери, щоб не пошкодити тканину</li>
        </ul>
      ),
    },
    {
      icon: <Wind className="w-6 h-6" />,
      title: '4. Сушіння — без поспіху',
      content: 'Не варто сушити білизну в сушарці або на батареї — це псує еластичність. Краще — на повітрі, у горизонтальному положенні (особливо для бюстгальтерів).',
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: '5. Не зловживай прасуванням',
      content: 'Більшість білизни не потребує прасування. Висока температура може пошкодити тканину.',
    },
    {
      icon: <Box className="w-6 h-6" />,
      title: '6. Зберігання',
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Тримай у сухому місці</li>
          <li>Бюстгальтери не згинай навпіл (чашки деформуються)</li>
          <li>Окремо від грубого одягу</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="bg-milky min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <Heart className="w-12 h-12 text-bottle mx-auto mb-6 opacity-20" />
          <h1 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-[0.3em] text-bottle mb-6">
            Догляд за білизною
          </h1>
          <p className="text-bottle/60 max-w-2xl mx-auto leading-relaxed">
            Ми створюємо білизну з любов&apos;ю, і хочемо, щоб вона радувала вас якомога довше. 
            Дотримуйтесь цих простих правил, щоб зберегти вигляд та еластичність ваших улюблених комплектів.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {careSteps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white p-8 shadow-sm border border-bottle/5 hover:border-bottle/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-bottle/5 flex items-center justify-center text-bottle mb-6 group-hover:bg-bottle group-hover:text-milky transition-colors">
                {step.icon}
              </div>
              <h2 className="text-lg font-heading font-bold uppercase tracking-wider text-bottle mb-4">
                {step.title}
              </h2>
              <div className="text-bottle/80 leading-relaxed text-sm">
                {step.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-bottle text-milky text-center rounded-2xl">
          <p className="font-heading italic text-lg">
            &ldquo;Правильний догляд — це прояв любові до себе та своїх речей.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
