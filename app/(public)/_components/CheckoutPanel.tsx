"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/app/lang";

// Простая панель чекаута: читает bookingData из localStorage и формирует ссылку WhatsApp
export default function CheckoutPanel({ initialLang }: { initialLang?: "ru" | "en" }) {
  const { lang } = useLang(initialLang);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookingData");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const t = (ru: string, en: string) => (lang === "ru" ? ru : en);

  // Справочники для отображения человеко‑читаемых названий
  const SHOWS = [
    { id: "master", ru: "Мастер-класс", en: "Master class" },
    { id: "upi", ru: "Фестиваль ЮПИ шоу", en: "UPI Festival show" },
    { id: "cinema", ru: "Кино и Шоу", en: "Cinema & Show" },
  ];
  const TICKETS_MAP: Record<string, { id: string; ru: string; en: string }[]> = {
    upi: [
      { id: "upi_child_combo", ru: "Детский (1 ребенок + 1 родитель)", en: "Child (1 kid + 1 parent)" },
      { id: "upi_adult", ru: "Взрослый", en: "Adult" },
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

  const showTitle = useMemo(() => {
    const s = SHOWS.find((x) => x.id === data?.show);
    if (!s) return data?.show || "";
    return lang === "ru" ? s.ru : s.en;
  }, [data?.show, lang]);

  const ticketsReadable = useMemo(() => {
    if (!data?.tickets || !data?.show) return "";
    const defs = TICKETS_MAP[data.show] || [];
    const nameById = new Map(defs.map((d) => [d.id, lang === "ru" ? d.ru : d.en] as const));
    const parts: string[] = [];
    Object.entries<number>(data.tickets as Record<string, number>).forEach(([id, q]) => {
      if (q > 0) {
        const label = nameById.get(id) || id;
        parts.push(`${label} × ${q}`);
      }
    });
    return parts.join(", ");
  }, [data?.tickets, data?.show, lang]);

  const fmtTotal = useMemo(() => {
    if (typeof data?.total !== 'number') return "";
    if (lang === 'en') {
      return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.total);
    }
    return new Intl.NumberFormat('ru-RU').format(data.total) + ' ₽';
  }, [data?.total, lang]);

  const message = useMemo(() => {
    const lines: string[] = [];
    lines.push(t("Здравствуйте! Хочу забронировать:", "Hello! I would like to book:"));
    if (showTitle) lines.push(t(`Шоу: ${showTitle}`, `Show: ${showTitle}`));
    if (ticketsReadable) lines.push(t(`Билеты: ${ticketsReadable}`, `Tickets: ${ticketsReadable}`));
    if (data?.firstName || data?.lastName) {
      lines.push(t(`Имя: ${data.firstName || ""} ${data.lastName || ""}`.trim(), `Name: ${data.firstName || ""} ${data.lastName || ""}`.trim()));
    }
    if (data?.phone) lines.push(t(`Телефон: ${data.phone}`, `Phone: ${data.phone}`));
    if (fmtTotal) lines.push(t(`Итого: ${fmtTotal}`, `Total: ${fmtTotal}`));
    return lines.join("\n");
  }, [data, showTitle, ticketsReadable, fmtTotal, lang]);

  const waHref = useMemo(() => {
    // Если есть корпоративный номер WhatsApp, можно подставить в wa.me/<number>
    // Пока оставим без номера, чтобы пользователь выбрал контакт в приложении
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [message]);

  return (
    <div className="w-full">
      <p className="text-base md:text-lg font-medium pl-1 mb-6" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>
        {t("Онлайн-оплата скоро будет доступна. Вы можете завершить бронирование в WhatsApp — мы ответим очень быстро.",
           "Online payment is coming soon. You can finish your booking in WhatsApp — we reply very fast.")}
      </p>

      <div className="space-y-3">
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          {t("Забронировать в WhatsApp", "Book via WhatsApp")}
        </a>
        <Link href="/" className="inline-flex items-center justify-center h-12 w-full px-6 rounded-md font-semibold border"
              style={{ color: 'var(--foreground)', borderColor: 'var(--panel-border)' }}>
          {t("Вернуться на главную", "Back to home")}
        </Link>
      </div>

      <div className="mt-6 rounded-md p-4 border text-sm" style={{ borderColor: 'var(--panel-border)', color: 'color-mix(in oklab, var(--foreground) 75%, transparent)' }}>
        <div className="font-semibold mb-2">{t("Детали брони", "Booking details")}</div>
        <div className="space-y-1">
          {showTitle && (<div>{t("Шоу", "Show")}: <span className="opacity-80">{showTitle}</span></div>)}
          {ticketsReadable && (<div>{t("Билеты", "Tickets")}: <span className="opacity-80">{ticketsReadable}</span></div>)}
          {fmtTotal && (
            <div>{t("Итого", "Total")}: <span className="opacity-80">{fmtTotal}</span></div>
          )}
          {data?.bookingId && (<div>ID: <span className="opacity-80">{String(data.bookingId)}</span></div>)}
        </div>
      </div>
    </div>
  );
}
