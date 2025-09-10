export type Lang = "ru" | "en";

// Centralized currency config for simple client-side conversion/formatting
export const currency = {
  ru: { target: "RUB", symbol: "₽", usdRate: 100 }, // adjust rate if needed
  en: { target: "USD", symbol: "$", usdRate: 1 },
} as const;

export const i18n = {
  ru: {
    nav: {
      about: "О нас",
      events: "События",
      help: "Помощь",
      features: "Возможности",
    },
    theme: {
      light: "Светлая",
      dark: "Тёмная",
    },
    aria: {
      theme: "Переключить тему",
      burgerOpen: "Открыть меню",
      burgerClose: "Закрыть меню",
    },
    kino: {
      title: "КИНОШОУ — кино под звёздами",
      lead: "Семейные кинопоказы на свежем воздухе: экран 5 метров, объёмный звук Dolby Atmos и удобные мягкие места. По семейному билету — попкорн в подарок. Проведите вечер всей семьёй, наслаждаясь любимыми фильмами в уютной, безопасной и праздничной атмосфере под открытым небом. Смех и комфорт делают этот вечер незабываемым.",
      ariaPrices: "Цены",
      priceChild: "Детский билет",
      priceAdult: "Взрослый билет",
      pricePopcorn: "Порция попкорна",
      ctaBook: "Забронировать",
      imgAlt: "Киношоу — вечер у экрана под звёздами",
      blockTitle: "Что входит в шоу",
      blockSub: "Ниже — все элементы программы. Они уже включены в формат вечера и складываются в цельный кинопраздник.",
      features: [
        { title: "Экран 5 метров", desc: "Погружение с большого формата — ярко видно из любой точки амфитеатра." },
        { title: "Звук Dolby Atmos", desc: "Объёмное звучание — ощущение присутствия в кадре." },
        { title: "Лежачие места", desc: "Максимальный комфорт под звёздным небом — пледы и подушки." },
        { title: "Попкорн в подарок", desc: "По семейному билету — набор попкорна бесплатно." },
        { title: "Лучшие фильмы планеты", desc: "Культовые картины и семейные релизы, которых нет в кинотеатрах." },
        { title: "Расписание вечеров", desc: "20:00 — программа, 20:20 — 1-й сеанс, 22:00 — программа, 22:20 — 2-й сеанс, 00:00 — 3-й сеанс." }
      ],
    },
    yupi: {
      title: "ЮПИ ШОУ — праздник цвета и пены",
      lead: "Современное семейное шоу на свежем воздухе с точной режиссурой и живым взаимодействием со зрителями. Игры, развлечения и лёгкая праздничная атмосфера на весь день. Мы позаботимся о безопасности и комфорте гостей, а вы сможете насладиться шоу и провести время с семьёй в уютной обстановке.",
      ariaPrices: "Цены",
      priceChild: "Детский",
      priceAdult: "Взрослый",
      pricePhoto: "Фото с артистами",
      priceChildNote: "1 ребёнок + 1 родитель",
      ctaBook: "Забронировать",
      imgAlt: "ЮПИ ШОУ — момент выступления",
      blockTitle: "Что входит в шоу",
      blockSub: "Ниже — все элементы программы. Они уже включены в сет шоу и строятся в единую динамику вечера.",
      features: [
        { title: "Пенные пушки", desc: "Шесть установок создают мягкие облака — безопасно и эффектно для фото и танцев." },
        { title: "Пена до 150 см", desc: "Фирменная рецептура, не щиплет глаза и легко смывается водой." },
        { title: "Мячи‑гиганты", desc: "Интерактив с залом — сотни рук и море эмоций на танцполе." },
        { title: "Тропический ливень", desc: "Охлаждающий туман и лёгкая влага — освежаем, не заливаем." },
        { title: "Фейерверк из красок", desc: "Неоновые вспышки и конфетти — финальная точка шоу и общий кадр на память." },
        { title: "Ростовые персонажи", desc: "Анимация и живое общение — дети в восторге, взрослые улыбаются." },
        { title: "Цирковые артисты", desc: "Пластика, свет и динамика — номер за номером без пауз в настроении." },
        { title: "Сладкая вата каждому", desc: "Маленький ритуал радости: сладкая вата — подарок ребёнку." }
      ],
    },
    master: {
      title: "МАСТЕР‑КЛАСС — сладкая вата и попкорн",
      lead: "Кулинарный мастер‑класс по изготовлению сладкой ваты и попкорна для детей всех возрастов. Развлекательные игры и обучение, жонглирование попкорном и многое другое. На целых 2 часа вы можете оставить ребёнка — мы обучим, зарядим позитивом, а вы сможете отдохнуть с прохладным напитком под зонтиком в нашем амфитеатре.",
      ariaPrices: "Цены",
      priceBoth: "Два мастер‑класса (вата + попкорн)",
      priceCandy: "Мастер‑класс сладкой ваты",
      pricePopcorn: "Мастер‑класс попкорна",
      ctaBook: "Забронировать",
      imgAlt: "Мастер‑классы — вата и попкорн",
      blockTitle: "Что входит в шоу",
      blockSub: "Ниже — все элементы программы. Они уже включены в сет и выстроены в понятный формат для ребёнка и родителей.",
      features: [
        { title: "Сладкая вата", desc: "Учим детей готовить — безопасно, весело и вкусно." },
        { title: "Попкорн", desc: "Обучение и игры с попкорном — даже жонглируем зерном." },
        { title: "Два мастер‑класса", desc: "10:00 — сладкая вата, 11:00 — попкорн. Оба входят в программу." },
        { title: "2 часа под присмотром", desc: "Можно оставить ребёнка — мы займём, обучим и подарим эмоции." },
        { title: "Зона отдыха для родителей", desc: "Пейте прохладные напитки под зонтом в амфитеатре." },
        { title: "Связь и вопросы", desc: "Подробности по телефону, на сайте или в WhatsApp — отвечаем быстро." }
      ],
    },
    about: {
      heroLine1: "МЫ",
      heroLine2: "ВДОХНОВЛЯЕМ",
      heroWords: ["ДЕТЕЙ","СЕМЬИ","ТУРИСТОВ","ПРАЗДНИКИ","МЕЧТАТЕЛЕЙ","КОМАНДЫ","ЗРИТЕЛЕЙ","АРТИСТОВ","СОЧИ"],
      heroSub: "*Если ты любишь жить — ты наш зритель.",
      mediaAlt: "Show Sochi — моменты шоу",
      companyTitle: "Show Sochi — место, где вечер становится событием.",
      companyText: "Мы создаём спектакли, которые остаются в памяти: свет, музыка и точная драматургия момента. Каждое выступление — это тщательно выстроенная история, рассказанная языком сцены, ритма и энергии города.",
      features: [
        {
          title: "Бронь за 1 минуту",
          text: "Простая оплата, мгновенное подтверждение и личный помощник в чате.",
          href: "/booking",
          badges: ["24/7 чат", "Без скрытых условий", "Подтверждение сразу"],
        },
        {
          title: "Семейно и безопасно",
          text: "Отлаженные процессы, подготовленные площадки и сертифицированные материалы.",
          href: "#help",
          badges: ["Детские зоны", "Инструктаж команды", "Мед.аптечка на локации"],
        },
        {
          title: "Вечер, который запоминают",
          text: "Свет, музыка, море и драматургия момента — премиальный опыт без компромиссов.",
          href: "#events",
          badges: ["Dolby Atmos", "5м экран", "Фото на сцене"],
        },
      ],
      scheduleTitle: "График работы",
      scheduleEveryday: "Ежедневно: 09:00–13:00, 15:00–02:00",
      weekdays: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
      scheduleTimes: "09:00–13:00\n15:00–02:00",
    },
    trust: {
      title: "Почему нам доверяют",
      sub: "Работаем прозрачно, безопасно и на результат. Мы отвечаем репутацией за каждый вечер.",
      items: [
        { title: "Опытная команда", text: "Сотни проведённых шоу и отлаженные процессы — от подготовки площадки до финального занавеса." },
        { title: "Безопасность прежде всего", text: "Сертифицированные материалы, инструктаж и аптечка на каждой площадке." },
        { title: "Честные условия", text: "Без скрытых платежей и мелкого шрифта. Всё — в одном подтверждении." },
        { title: "Высокие оценки гостей", text: "4.9★ средняя оценка и повторные визиты — лучшая проверка качества." },
        { title: "Личный подход", text: "Поможем с выбором формата, подскажем места и поддержим в чате 24/7." },
        { title: "Поддержка 24/7", text: "Всегда на связи до и после мероприятия." },
      ],
    },
    extras: {
      title: "Доп продукты",
      lead: "Выберите дополнительные услуги и угощения, чтобы сделать вечер ещё ярче.",
      groups: {
        photos: "Фото",
        ice: "Мороженое",
        congrats: "Поздравления",
      },
      items: {
        photos: [
          { title: "Фото 10×15 в рамке", subtitle: "в пене и красках", price: "500 ₽" },
          { title: "Фото набор из 10", price: "1500 ₽" },
          { title: "Большая фотосессия", subtitle: "во время шоу", price: "2500 ₽" },
        ],
        ice: [
          { title: "Мороженое в ассортименте", price: "40 ₽" },
          { title: "Мороженое стаканчик", subtitle: "Пятигорск", price: "75 ₽" },
        ],
        congrats: [
          { title: "Поздравления в микрофон", price: "300 ₽" },
          { title: "Поздравления на сцене", subtitle: "с выходом именинника", price: "900 ₽" },
        ],
      },
    },
  },
  en: {
    nav: {
      about: "About",
      events: "Events",
      help: "Help",
      features: "Features",
    },
    theme: {
      light: "Light",
      dark: "Dark",
    },
    aria: {
      theme: "Toggle theme",
      burgerOpen: "Open menu",
      burgerClose: "Close menu",
    },
    kino: {
      title: "Kino Show — movies under the stars",
      lead: "Family-friendly open-air screenings: a 5‑meter screen, immersive Dolby Atmos sound, and comfy soft seating. Family ticket includes complimentary popcorn. Spend the evening together enjoying favorite films in a cozy, safe, and festive atmosphere under the open sky. Laughter for kids and comfort for adults make this night unforgettable.",
      ariaPrices: "Prices",
      priceChild: "Child ticket",
      priceAdult: "Adult ticket",
      pricePopcorn: "Popcorn portion",
      ctaBook: "Book now",
      imgAlt: "Kino Show — an evening by the screen under the stars",
      blockTitle: "What’s included",
      blockSub: "Below are all program elements. They are already included and form a complete cinema experience.",
      features: [
        { title: "5‑meter screen", desc: "Large-format immersion — clearly visible from anywhere in the amphitheater." },
        { title: "Dolby Atmos sound", desc: "Spatial audio — a feeling of being inside the scene." },
        { title: "Reclining seats", desc: "Maximum comfort under the night sky — blankets and pillows provided." },
        { title: "Complimentary popcorn", desc: "Family ticket includes a popcorn set for free." },
        { title: "Top films worldwide", desc: "Cult classics and family releases you can’t find in regular cinemas." },
        { title: "Evening schedule", desc: "20:00 — program, 20:20 — 1st screening, 22:00 — program, 22:20 — 2nd screening, 00:00 — 3rd screening." }
      ],
    },
    yupi: {
      title: "Yupi Show — a celebration of color and foam",
      lead: "A modern family outdoor show with precise directing and live audience interaction. Games, activities, and a festive atmosphere all day long. We take care of safety and comfort, so you can enjoy the show and spend quality time with your family.",
      ariaPrices: "Prices",
      priceChild: "Child",
      priceAdult: "Adult",
      pricePhoto: "Photo with performers",
      priceChildNote: "1 child + 1 parent",
      ctaBook: "Book now",
      imgAlt: "Yupi Show — performance moment",
      blockTitle: "What’s included",
      blockSub: "Below are all program elements. They are included and build into a cohesive flow of the evening.",
      features: [
        { title: "Foam cannons", desc: "Six units create soft clouds — safe and spectacular for photos and dance." },
        { title: "Foam up to 150 cm", desc: "Signature formula — gentle on eyes and rinses off easily." },
        { title: "Giant balls", desc: "Interactive fun — hundreds of hands and a sea of emotions on the dance floor." },
        { title: "Tropical rain", desc: "Cooling mist and light moisture — refreshing without soaking." },
        { title: "Firework of colors", desc: "Neon bursts and confetti — the grand finale and a group photo moment." },
        { title: "Life-sized characters", desc: "Live interaction — kids are thrilled, adults smile." },
        { title: "Circus performers", desc: "Motion, light, and dynamics — act after act without losing the vibe." },
        { title: "Cotton candy for every kid", desc: "A small ritual of joy: cotton candy as a gift for the child." }
      ],
    },
    master: {
      title: "Master Class — cotton candy and popcorn",
      lead: "A culinary workshop on making cotton candy and popcorn for kids of all ages. Playful learning, popcorn juggling, and more. You can leave your child for a full 2 hours — we teach, engage, and inspire while you relax with a cool drink under an umbrella in our amphitheater.",
      ariaPrices: "Prices",
      priceBoth: "Two workshops (candy + popcorn)",
      priceCandy: "Cotton candy workshop",
      pricePopcorn: "Popcorn workshop",
      ctaBook: "Book now",
      imgAlt: "Workshops — candy and popcorn",
      blockTitle: "What’s included",
      blockSub: "Below are all program elements. They are included and structured clearly for both kids and parents.",
      features: [
        { title: "Cotton candy", desc: "We teach kids to make it — safe, fun, and delicious." },
        { title: "Popcorn", desc: "Learning and games with popcorn — even juggling the kernels." },
        { title: "Two workshops", desc: "10:00 — cotton candy, 11:00 — popcorn. Both are included." },
        { title: "2 hours supervised", desc: "You can leave your child — we’ll engage, teach, and deliver emotions." },
        { title: "Parents’ lounge", desc: "Enjoy cool drinks under an umbrella in the amphitheater." },
        { title: "Support & questions", desc: "Details via phone, website, or WhatsApp — quick responses." }
      ],
    },
    about: {
      heroLine1: "WE",
      heroLine2: "INSPIRE",
      heroWords: ["KIDS","FAMILIES","TRAVELERS","CELEBRATIONS","DREAMERS","TEAMS","AUDIENCES","ARTISTS","SOCHI"],
      heroSub: "*If you love life — you’re our audience.",
      mediaAlt: "Show Sochi — show moments",
      companyTitle: "Show Sochi — where an evening becomes an event.",
      companyText: "We craft performances that stay with you: light, music, and precise storytelling. Each show is a carefully built story told through stage, rhythm, and the city’s energy.",
      features: [
        {
          title: "1‑minute booking",
          text: "Simple payment, instant confirmation, and a personal assistant in chat.",
          href: "/booking",
          badges: ["24/7 chat", "No hidden terms", "Instant confirmation"],
        },
        {
          title: "Family‑friendly & safe",
          text: "Streamlined processes, prepared venues, and certified materials.",
          href: "#help",
          badges: ["Kids’ areas", "Crew briefing", "First‑aid kit on site"],
        },
        {
          title: "An evening to remember",
          text: "Light, music, the sea, and story flow — a premium experience without compromise.",
          href: "#events",
          badges: ["Dolby Atmos", "5m screen", "On‑stage photo"],
        },
      ],
      scheduleTitle: "Opening hours",
      scheduleEveryday: "Daily: 09:00–13:00, 15:00–02:00",
      weekdays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      scheduleTimes: "09:00–13:00\n15:00–02:00",
    },
    trust: {
      title: "Why people trust us",
      sub: "We work transparently, safely, and for results. We stand by our reputation for every single evening.",
      items: [
        { title: "Experienced team", text: "Hundreds of shows delivered and streamlined processes — from setup to curtain call." },
        { title: "Safety first", text: "Certified materials, crew briefing, and a first‑aid kit at every venue." },
        { title: "Fair terms", text: "No hidden fees or fine print. Everything is in one confirmation." },
        { title: "High guest ratings", text: "4.9★ average score and repeat visits — the best proof of quality." },
        { title: "Personal approach", text: "We’ll help choose the format, suggest locations, and support you in chat 24/7." },
        { title: "24/7 support", text: "Always in touch before and after the event." },
      ],
    },
    extras: {
      title: "Extras",
      lead: "Choose additional services and treats to make the evening even brighter.",
      groups: {
        photos: "Photos",
        ice: "Ice cream",
        congrats: "Greetings",
      },
      items: {
        photos: [
          { title: "10×15 framed photo", subtitle: "foam and paint", price: "$6" },
          { title: "Photo set of 10", price: "$17" },
          { title: "Full photo session", subtitle: "during the show", price: "$28" },
        ],
        ice: [
          { title: "Assorted ice cream", price: "$1" },
          { title: "Ice cream cup", subtitle: "Pyatigorsk", price: "$1" },
        ],
        congrats: [
          { title: "Mic greetings", price: "$3" },
          { title: "On‑stage greetings", subtitle: "with the birthday kid", price: "$10" },
        ],
      },
    },
  },
} as const;

export function getTexts(lang: Lang) {
  return i18n[lang];
}
