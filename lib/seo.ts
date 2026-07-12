import type { Metadata } from "next";

/** Punycode apex — use everywhere for metadataBase / canonical / sitemap */
export const SITE_ORIGIN = "https://xn--h1alalj0ac.xn--p1ai";
export const SITE_HOST_CYRILLIC = "шоусочи.рф";
export const SITE_NAME = "ШоуСочи";
export const SITE_NAME_EN = "Show Sochi";

export const SITE_PHONE_DISPLAY = "+7 (963) 163-00-66";
export const SITE_PHONE_E164 = "+79631630066";
export const SITE_WHATSAPP = "79631630066";

export const SITE_ADDRESS = {
  street: "улица Калинина, 1/1",
  city: "Сочи",
  region: "Краснодарский край",
  postalCode: "354340",
  country: "RU",
  fullRu: "Краснодарский край, Сочи, ул. Калинина, 1/1",
  fullEn: "Kalinin St, 1/1, Sochi, Russia",
};

/** Amphitheater near Южное взморье (Yandex org pin) */
export const SITE_GEO = {
  lat: 43.427962,
  lng: 39.912852,
};

export const YANDEX_MAPS_ORG =
  "https://yandex.ru/maps/org/shousochi/131805703222?si=xuveu79t4ej551g2etpf7ty3t8";

export const DEFAULT_OG_IMAGE = "/logo.png";
export const DEFAULT_OG_IMAGE_FALLBACK =
  "/uploads/1ef6ec94-3b83-46e7-9163-4e485f931cad.jpg";

export const DEFAULT_DESCRIPTION_RU =
  "ШоуСочи — амфитеатр на Южном взморье в Сочи. Семейное пенное шоу, кино под звёздами с Dolby Atmos и кулинарные мастер-классы. Билеты онлайн, ул. Калинина, 1/1.";

export const DEFAULT_DESCRIPTION_EN =
  "Show Sochi — amphitheater at Yuzhnoye Vzmorye in Sochi. Family foam show, outdoor cinema under the stars with Dolby Atmos, and culinary master classes. Book tickets online.";

export type ShowKey = "yupi" | "cinema" | "master";

export const SHOWS: Record<
  ShowKey,
  {
    path: string;
    titleRu: string;
    titleEn: string;
    descriptionRu: string;
    descriptionEn: string;
    timesRu: string;
    timesEn: string;
    priceFrom: number;
    keywords: string[];
  }
> = {
  yupi: {
    path: "/shows/yupi",
    titleRu: "Семейное пенное шоу в Сочи",
    titleEn: "Family foam show in Sochi",
    descriptionRu:
      "Семейное пенное шоу ШоуСочи: краски, пена, тропический ливень и мячи-гиганты. Каждый день в 17:00. Амфитеатр на Южном взморье, Сочи.",
    descriptionEn:
      "Family foam show at Show Sochi: paint, foam, tropical rain and giant balls. Daily at 17:00. Amphitheater at Yuzhnoye Vzmorye, Sochi.",
    timesRu: "ежедневно в 17:00",
    timesEn: "daily at 17:00",
    priceFrom: 1500,
    keywords: ["пенное шоу Сочи", "семейное шоу", "Юпи шоу", "фестиваль красок Сочи"],
  },
  cinema: {
    path: "/shows/cinema",
    titleRu: "Кино и шоу под звёздами в Сочи",
    titleEn: "Cinema & show under the stars in Sochi",
    descriptionRu:
      "Кино под открытым небом в ШоуСочи: большой экран, Dolby Atmos, сеансы 20:00, 22:00 и 00:00. Амфитеатр Южное взморье, Сочи.",
    descriptionEn:
      "Open-air cinema at Show Sochi: big screen, Dolby Atmos, shows at 20:00, 22:00 and 00:00. Yuzhnoye Vzmorye amphitheater, Sochi.",
    timesRu: "ежедневно 20:00, 22:00, 00:00",
    timesEn: "daily 20:00, 22:00, 00:00",
    priceFrom: 400,
    keywords: ["кино под звёздами Сочи", "открытый кинотеатр", "Dolby Atmos Сочи"],
  },
  master: {
    path: "/shows/master",
    titleRu: "Кулинарный мастер-класс в Сочи",
    titleEn: "Culinary master class in Sochi",
    descriptionRu:
      "Кулинарный мастер-класс в ШоуСочи: сладкая вата и попкорн своими руками. Каждый день в 10:00 и 11:00. Амфитеатр на Южном взморье.",
    descriptionEn:
      "Culinary master class at Show Sochi: make cotton candy and popcorn. Daily at 10:00 and 11:00. Amphitheater at Yuzhnoye Vzmorye.",
    timesRu: "ежедневно 10:00 и 11:00",
    timesEn: "daily 10:00 and 11:00",
    priceFrom: 700,
    keywords: ["мастер-класс Сочи", "сладкая вата", "попкорн мастер-класс"],
  },
};

export function absUrl(path = "/"): string {
  if (!path || path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Build Next.js Metadata with unique title, description, canonical, OG */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  type = "website",
}: PageMetaInput): Metadata {
  const url = absUrl(path);
  const ogImage = image.startsWith("http") ? image : absUrl(image);

  return {
    title,
    description,
    keywords: ["ШоуСочи", "Show Sochi", "Сочи", ...keywords],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: "ru_RU",
      alternateLocale: ["en_US"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["EntertainmentBusiness", "LocalBusiness", "TouristAttraction"],
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    alternateName: [SITE_NAME_EN, "Show Sochi", "Шоу Сочи"],
    url: SITE_ORIGIN,
    logo: absUrl("/logo.png"),
    image: [absUrl("/logo.png"), absUrl(DEFAULT_OG_IMAGE_FALLBACK)],
    description: DEFAULT_DESCRIPTION_RU,
    telephone: SITE_PHONE_E164,
    email: "admin@xn--h1alalj0ac.xn--p1ai",
    priceRange: "₽₽",
    currenciesAccepted: "RUB",
    paymentAccepted: "Cash, Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_ADDRESS.street,
      addressLocality: SITE_ADDRESS.city,
      addressRegion: SITE_ADDRESS.region,
      postalCode: SITE_ADDRESS.postalCode,
      addressCountry: SITE_ADDRESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_GEO.lat,
      longitude: SITE_GEO.lng,
    },
    hasMap: YANDEX_MAPS_ORG,
    sameAs: [YANDEX_MAPS_ORG, `https://wa.me/${SITE_WHATSAPP}`],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "02:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "354",
      bestRating: "5",
      worstRating: "1",
    },
    areaServed: {
      "@type": "City",
      name: "Сочи",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    description: DEFAULT_DESCRIPTION_RU,
    inLanguage: ["ru-RU", "en-US"],
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "ReserveAction",
      target: absUrl("/booking"),
      name: "Забронировать билет",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function showEventJsonLd(key: ShowKey) {
  const s = SHOWS[key];
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: s.titleRu,
    description: s.descriptionRu,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [absUrl("/logo.png")],
    url: absUrl(s.path),
    location: {
      "@type": "Place",
      name: "Амфитеатр ШоуСочи · Южное взморье",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_ADDRESS.street,
        addressLocality: SITE_ADDRESS.city,
        addressRegion: SITE_ADDRESS.region,
        addressCountry: SITE_ADDRESS.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE_GEO.lat,
        longitude: SITE_GEO.lng,
      },
    },
    organizer: { "@id": `${SITE_ORIGIN}/#organization` },
    offers: {
      "@type": "Offer",
      url: absUrl(`/booking?show=${key === "yupi" ? "upi" : key}`),
      priceCurrency: "RUB",
      price: String(s.priceFrom),
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().slice(0, 10),
    },
    isAccessibleForFree: false,
    inLanguage: "ru-RU",
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Где находится ШоуСочи?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `ШоуСочи — амфитеатр на Южном взморье: ${SITE_ADDRESS.fullRu}. Удобная парковка рядом.`,
        },
      },
      {
        "@type": "Question",
        name: "Какие шоу проходят каждый день?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Три формата: семейное пенное шоу (17:00), кино и шоу под звёздами (20:00, 22:00, 00:00) и кулинарный мастер-класс (10:00 и 11:00).",
        },
      },
      {
        "@type": "Question",
        name: "Как купить билеты?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Билеты бронируются онлайн на сайте шоусочи.рф в разделе «Бронирование» или через WhatsApp +7 (963) 163-00-66.",
        },
      },
      {
        "@type": "Question",
        name: "С какого возраста можно на пенное шоу?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Семейное пенное шоу рассчитано на детей и взрослых — краски и пена безопасны, атмосфера каникул для всей семьи.",
        },
      },
    ],
  };
}
