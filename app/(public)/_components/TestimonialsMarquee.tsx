"use client";

import React, { useMemo, useState } from "react";
import CenterSwipeTestimonials from "./CenterSwipeTestimonials";
import { useLang, type Lang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";
import GlassPanelShell from "./GlassPanelShell";

type Testimonial = {
  quote: string;
  name: string;
  title?: string;
  avatar?: string; // optional url, we render initials fallback
};

const DATA_RU: Testimonial[] = [
  { quote: "Приехали на выходные и остались до понедельника — слишком крутая атмосфера.", name: "Кирилл Андреев", title: "Гость" },
  { quote: "Тут легко найти свою компанию: музыка качает, люди открытые, вечер летит.", name: "Алина Воробьёва", title: "Гостья" },
  { quote: "Бар как отдельное шоу. Миксы — бомба, персонал улыбается даже под утро.", name: "Иван Фёдоров", title: "Гость" },
  { quote: "Люблю места, куда хочется возвращаться. Это одно из них.", name: "Олеся Михайлова", title: "Гостья" },
  { quote: "Прилетели из Питера специально сюда. Не прогадали ни на минуту.", name: "Роман Гаврилов", title: "Турист" },
  { quote: "Ходим компанией — всегда безопасно и без лишней суеты на входе.", name: "Наталья Богданова", title: "Гостья" },
  { quote: "Звук чистый, свет красивый, и нет случайных людей — это редкость.", name: "Сергей Киселёв", title: "Гость" },
  { quote: "Удобно добираться, рядом с центром. После работы — идеальный перезапуск.", name: "Марина Котова", title: "Гостья" },
  { quote: "Диджеи как надо: без клише и с ростом по настроению.", name: "Данила Юрченко", title: "Гость" },
  { quote: "Брала столик на день рождения — сервис деликатный, праздник тёплый.", name: "Екатерина Лебедева", title: "Гостья" },
  { quote: "Фото из этого места собирают больше всего лайков, не шучу.", name: "София Малахова", title: "Гостья" },
  { quote: "Здесь про тебя заботятся, но не навязчиво. Это чувствуется.", name: "Павел Трофимов", title: "Гость" },
  { quote: "Выбор музыки — от диско до хауса, вечер плавно течёт, а ты в моменте.", name: "Анна Корнилова", title: "Гостья" },
  { quote: "На летней террасе кайф: воздух, огни, и тот самый вайб.", name: "Глеб Емельянов", title: "Гость" },
  { quote: "Редко где так комфортно девчонкам — охрана и персонал очень тактичные.", name: "Валерия Данилова", title: "Гостья" },
  { quote: "Днём кофе и встречи, ночью танцы — любимый формат.", name: "Никита Журавлёв", title: "Гость" },
  { quote: "Если не знаешь, куда вести друзей из другого города — сюда.", name: "Полина Селезнёва", title: "Гостья" },
  { quote: "Тут знакомятся, реально. Мы сошлись у барной стойки.", name: "Рустам Исмайлов", title: "Гость" },
  { quote: "Никакой показухи — просто хорошая музыка и правильные люди.", name: "Виктория Орлова", title: "Гостья" },
  { quote: "Самое спокойное утро — после ночи здесь.", name: "Георгий Матвеев", title: "Гость" },
];

const DATA_EN: Testimonial[] = [
  { quote: "Came for the weekend and stayed till Monday — the vibe is too good.", name: "Kirill Andreev", title: "Guest" },
  { quote: "Easy to find your crowd: music hits, people are open, the evening flies.", name: "Alina Vorobyova", title: "Guest" },
  { quote: "Bar is a show of its own. Mixes are fire, staff smiles even at dawn.", name: "Ivan Fedorov", title: "Guest" },
  { quote: "One of those places you want to return to.", name: "Olesya Mikhaylova", title: "Guest" },
  { quote: "Flew from Saint Petersburg just for this. Worth every minute.", name: "Roman Gavrilov", title: "Tourist" },
  { quote: "We come as a group — always safe and no fuss at the entrance.", name: "Natalia Bogdanova", title: "Guest" },
  { quote: "Clean sound, beautiful light, and no random crowd — rare.", name: "Sergey Kiselev", title: "Guest" },
  { quote: "Easy to reach, close to the center. Perfect after work reset.", name: "Marina Kotova", title: "Guest" },
  { quote: "DJs deliver: no clichés and the mood keeps growing.", name: "Danila Yurchenko", title: "Guest" },
  { quote: "Booked a table for a birthday — delicate service, warm celebration.", name: "Ekaterina Lebedeva", title: "Guest" },
  { quote: "Photos from here get the most likes, no joke.", name: "Sofia Malakhova", title: "Guest" },
  { quote: "They care about you without being pushy. You feel it.", name: "Pavel Trofimov", title: "Guest" },
  { quote: "Music picks from disco to house, the evening flows, you’re in the moment.", name: "Anna Kornilova", title: "Guest" },
  { quote: "Summer terrace is bliss: air, lights, and that very vibe.", name: "Gleb Emelyanov", title: "Guest" },
  { quote: "Rarely this comfy for girls — security and staff are very tactful.", name: "Valeria Danilova", title: "Guest" },
  { quote: "Coffee and meetings by day, dancing by night — favorite format.", name: "Nikita Zhuravlev", title: "Guest" },
  { quote: "If you don’t know where to take friends from another city — here.", name: "Polina Selezneva", title: "Guest" },
  { quote: "People really meet here. We clicked at the bar.", name: "Rustam Ismailov", title: "Guest" },
  { quote: "No showing off — just good music and the right people.", name: "Victoria Orlova", title: "Guest" },
  { quote: "The calmest morning is after a night here.", name: "Georgy Matveev", title: "Guest" },
];

// Helper to split into N columns and loop
function useColumns(data: Testimonial[], columns: number) {
  return useMemo(() => {
    const cols: Testimonial[][] = Array.from({ length: columns }, () => []);
    data.forEach((item, i) => {
      cols[i % columns].push(item);
    });
    return cols;
  }, [data, columns]);
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div className="tmAvatar" aria-hidden>
      <span>{initials}</span>
    </div>
  );
}

function Card({
  t,
  onHover,
  active,
}: {
  t: Testimonial;
  onHover: (v: boolean) => void;
  active: boolean;
}) {
  return (
    <GlassPanelShell
      as="article"
      className={`tmCard${active ? " isHover" : ""}`}
      disabled
      elasticity={0}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <span className="tmMark" aria-hidden>
        “
      </span>
      <p className="tmQuote">{t.quote}</p>
      <div className="tmFoot">
        <div className="tmPerson">
          {t.avatar ? (
            <img className="tmAvatarImg" src={t.avatar} alt={t.name} />
          ) : (
            <Initials name={t.name} />
          )}
          <div className="tmMeta">
            <strong>{t.name}</strong>
            {t.title && <span>{t.title}</span>}
          </div>
        </div>
      </div>
    </GlassPanelShell>
  );
}

function Column({ items, speed = 40, dimmed = false }: { items: Testimonial[]; speed?: number; dimmed?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const trackStyle: React.CSSProperties = {
    animationDuration: `${speed}s`,
    animationPlayState: paused ? "paused" : "running",
  };

  // duplicate items to create seamless loop
  const loop = [...items, ...items];

  return (
    <div className={`tmCol ${dimmed ? "isDim" : ""}`} data-paused={paused}>
      <div className="tmTrack" style={trackStyle}>
        {loop.map((t, i) => (
          <Card
            key={`${t.name}-${i}`}
            t={t}
            active={!dimmed && hoveredIndex === i % items.length}
            onHover={(v) => {
              if (dimmed) return; // side columns ignore
              setPaused(v);
              setHoveredIndex(v ? i % items.length : null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsMarquee({ initial }: { initial?: Lang }) {
  const { lang } = useLang(initial);
  // 5 columns total: 2 side dimmed (half visible), 3 main interactive
  const cols = useColumns(lang === 'ru' ? DATA_RU : DATA_EN, 5);
  const flat = useMemo(() => (lang === 'ru' ? DATA_RU : DATA_EN), [lang]);
  return (
    <section className="tmSection">
      <div className="tmWrap">
        <div className="title headline">
          <HeroLavaLetters variant="headlinePp">
            {lang === "ru" ? "Здесь отдыхают" : "Where people unwind"}
          </HeroLavaLetters>
        </div>
        <div className="subcopy">
          <HeroLavaLetters variant="body">
            {lang === "ru"
              ? "Отзывы гостей о месте, куда возвращаются"
              : "Guest reviews of a place they return to"}
          </HeroLavaLetters>
        </div>
      </div>

      {/* Mobile: centered swipe gallery */}
      <div className="tmSwipeMobile">
        <CenterSwipeTestimonials items={flat} width={380} height={260} gap={16} />
      </div>

      <div className="tmViewport">
        {/* Left dimmed (half visible) */}
        <Column items={cols[0]} speed={44} dimmed />
        {/* Three interactive */}
        <Column items={cols[1]} speed={46} />
        <Column items={cols[2]} speed={40} />
        <Column items={cols[3]} speed={48} />
        {/* Right dimmed (half visible) */}
        <Column items={cols[4]} speed={50} dimmed />
      </div>
    </section>
  );
}
