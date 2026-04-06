import { HandCoins, Tags, Truck, BadgeCheck } from 'lucide-react';

const featuresList = [
  { id: 1, title: 'Оплата при отриманні', icon: HandCoins },
  { id: 2, title: 'Доступна ціна', icon: Tags },
  { id: 3, title: 'Швидка відправка', icon: Truck },
  { id: 4, title: 'Хороша якість', icon: BadgeCheck },
];

export function Features() {
  return (
    <section className="w-full py-8 px-4 mt-4">
      <div className="container mx-auto">
        {/* Контейнер з легким фоном, як на скріні */}
        <div className="bg-bottle/5 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-start sm:items-center justify-between gap-6 md:gap-8">
          
          {featuresList.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center gap-4 w-full sm:w-auto">
                {/* Іконка в тонкому кружечку */}
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full border border-bottle/20 text-bottle bg-milky shadow-sm">
                  <Icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                {/* Текст */}
                <span className="font-semibold text-bottle text-sm md:text-base whitespace-nowrap">
                  {feature.title}
                </span>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}