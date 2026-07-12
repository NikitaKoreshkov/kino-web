export const BOOKING_WHATSAPP_PHONE = "79631630066";

export type BookingWhatsAppLang = "ru" | "en";

export type BookingWhatsAppData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  show?: string;
  timeSlot?: string;
  tickets?: Record<string, number>;
  extras?: Record<string, number>;
  total?: number;
  bookingId?: string;
};

type TicketLabel = { id: string; ru: string; en: string };
type ShowLabel = { id: string; ru: string; en: string };

const SHOWS: ShowLabel[] = [
  { id: "master", ru: "Кулинарный мастер-класс", en: "Culinary master class" },
  { id: "upi", ru: "Семейное пенное шоу", en: "Family foam show" },
  { id: "cinema", ru: "Кино и шоу под звёздами", en: "Cinema & show under the stars" },
];

const TIME_SLOTS: Record<string, { ru: string; en: string }> = {
  "10-12": { ru: "10:00 – 12:00", en: "10:00 – 12:00" },
  "17-19": { ru: "17:00 – 18:30", en: "17:00 – 18:30" },
  "20-02": { ru: "20:00 – 02:00", en: "20:00 – 02:00" },
};

const TICKETS: Record<string, TicketLabel[]> = {
  upi: [
    { id: "upi_adult", ru: "Взрослый билет", en: "Adult ticket" },
    { id: "upi_adult_pair", ru: "2 взрослых (2‑й родитель в подарок)", en: "2 adults (2nd parent free)" },
    { id: "upi_child_combo", ru: "2 взрослых (акция)", en: "2 adults (promo)" },
  ],
  cinema: [
    { id: "cinema_child", ru: "Детский", en: "Child" },
    { id: "cinema_adult", ru: "Взрослый", en: "Adult" },
  ],
  master: [
    { id: "master_combo", ru: "Два мастер‑класса: вата + попкорн", en: "Two master‑classes: cotton + popcorn" },
    { id: "master_cotton", ru: "По сладкой вате", en: "Cotton candy" },
    { id: "master_popcorn", ru: "По попкорну", en: "Popcorn" },
  ],
};

const EXTRAS: TicketLabel[] = [
  { id: "photo_10x15", ru: "Фото 10×15 в рамке", en: "Photo 10×15 in frame" },
  { id: "photo_pack10", ru: "Фото набор из 10", en: "Photo pack of 10" },
  { id: "photosession_big", ru: "Большая фотосессия", en: "Big photosession" },
  { id: "icecream_mix", ru: "Мороженое в ассортименте", en: "Ice cream assorted" },
  { id: "icecream_cup", ru: "Мороженое стаканчик", en: "Ice cream cup" },
  { id: "congrats_mic", ru: "Поздравления в микрофон", en: "Congrats on mic" },
  { id: "congrats_stage", ru: "Поздравления на сцене", en: "Congrats on stage" },
  { id: "upi_photo_artists", ru: "Фото с артистами", en: "Photo with artists" },
];

function pick(lang: BookingWhatsAppLang, ru: string, en: string) {
  return lang === "ru" ? ru : en;
}

function showTitle(showId: string | undefined, lang: BookingWhatsAppLang, override?: string) {
  if (override?.trim()) return override.trim();
  const s = SHOWS.find((x) => x.id === showId);
  if (!s) return showId || "";
  return lang === "ru" ? s.ru : s.en;
}

function timeLabel(slot: string | undefined, lang: BookingWhatsAppLang) {
  if (!slot) return "";
  const def = TIME_SLOTS[slot];
  if (!def) return slot;
  return lang === "ru" ? def.ru : def.en;
}

function ticketName(showId: string | undefined, ticketId: string, lang: BookingWhatsAppLang) {
  const defs = (showId && TICKETS[showId]) || [];
  const found = defs.find((d) => d.id === ticketId);
  if (found) return lang === "ru" ? found.ru : found.en;
  const extra = EXTRAS.find((d) => d.id === ticketId);
  if (extra) return lang === "ru" ? extra.ru : extra.en;
  return ticketId;
}

function formatMoney(total: number | undefined, lang: BookingWhatsAppLang) {
  if (typeof total !== "number" || !Number.isFinite(total)) return "";
  if (lang === "en") {
    return (
      "$" +
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(total)
    );
  }
  return new Intl.NumberFormat("ru-RU").format(total) + " ₽";
}

function qtyLines(
  map: Record<string, number> | undefined,
  showId: string | undefined,
  lang: BookingWhatsAppLang,
) {
  if (!map) return [];
  const lines: string[] = [];
  Object.entries(map).forEach(([id, q]) => {
    if (!q || q <= 0) return;
    lines.push(`• ${ticketName(showId, id, lang)} × ${q}`);
  });
  return lines;
}

export function buildBookingWhatsAppMessage(
  data: BookingWhatsAppData,
  lang: BookingWhatsAppLang,
  opts?: { showTitleOverride?: string },
): string {
  const lines: string[] = [];
  lines.push(pick(lang, "Здравствуйте! Хочу забронировать.", "Hello! I would like to book."));
  lines.push("");

  const show = showTitle(data.show, lang, opts?.showTitleOverride);
  if (show) lines.push(pick(lang, `Шоу: ${show}`, `Show: ${show}`));

  const time = timeLabel(data.timeSlot, lang);
  if (time) lines.push(pick(lang, `Время: ${time}`, `Time: ${time}`));

  const ticketLines = qtyLines(data.tickets, data.show, lang);
  if (ticketLines.length) {
    lines.push("");
    lines.push(pick(lang, "Билеты:", "Tickets:"));
    lines.push(...ticketLines);
  }

  const extraLines = qtyLines(data.extras, data.show, lang);
  if (extraLines.length) {
    lines.push("");
    lines.push(pick(lang, "Дополнительно:", "Extras:"));
    lines.push(...extraLines);
  }

  lines.push("");
  const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
  if (name) lines.push(pick(lang, `Имя: ${name}`, `Name: ${name}`));
  if (data.phone) lines.push(pick(lang, `Телефон: ${data.phone}`, `Phone: ${data.phone}`));

  const total = formatMoney(data.total, lang);
  if (total) {
    lines.push("");
    lines.push(pick(lang, `Итого: ${total}`, `Total: ${total}`));
  }

  if (data.bookingId) {
    lines.push("");
    lines.push(`ID: ${data.bookingId}`);
  }

  return lines.join("\n");
}

export function buildBookingWhatsAppUrl(
  data: BookingWhatsAppData,
  lang: BookingWhatsAppLang,
  opts?: { showTitleOverride?: string; phone?: string },
): string {
  const message = buildBookingWhatsAppMessage(data, lang, opts);
  const phone = (opts?.phone || BOOKING_WHATSAPP_PHONE).replace(/\D+/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function openBookingWhatsApp(
  data: BookingWhatsAppData,
  lang: BookingWhatsAppLang,
  opts?: { showTitleOverride?: string; phone?: string },
) {
  const url = buildBookingWhatsAppUrl(data, lang, opts);
  if (typeof window === "undefined") return url;
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
