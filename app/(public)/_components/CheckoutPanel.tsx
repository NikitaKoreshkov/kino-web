"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/app/lang";
import GlassPanelShell from "./GlassPanelShell";
import {
  buildBookingWhatsAppMessage,
  buildBookingWhatsAppUrl,
  type BookingWhatsAppData,
} from "@/lib/bookingWhatsApp";

export default function CheckoutPanel({ initialLang }: { initialLang?: "ru" | "en" }) {
  const { lang } = useLang(initialLang);
  const [data, setData] = useState<BookingWhatsAppData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookingData");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const t = (ru: string, en: string) => (lang === "ru" ? ru : en);
  const waLang = lang === "en" ? "en" : "ru";

  const message = useMemo(
    () => (data ? buildBookingWhatsAppMessage(data, waLang) : ""),
    [data, waLang],
  );

  const waHref = useMemo(
    () => (data ? buildBookingWhatsAppUrl(data, waLang) : "#"),
    [data, waLang],
  );

  const previewLines = useMemo(
    () => message.split("\n").filter((l) => l.trim().length > 0),
    [message],
  );

  return (
    <div className="w-full">
      <p
        className="text-base md:text-lg font-medium pl-1 mb-6"
        style={{ color: "color-mix(in oklab, var(--foreground) 70%, transparent)" }}
      >
        {t(
          "Проверьте детали и нажмите кнопку — откроется WhatsApp с готовым сообщением. Мы ответим быстро.",
          "Check the details and tap the button — WhatsApp opens with a ready message. We reply fast.",
        )}
      </p>

      <div className="space-y-3">
        <GlassPanelShell
          as="a"
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          {t("Открыть WhatsApp", "Open WhatsApp")}
        </GlassPanelShell>
        <GlassPanelShell
          as={Link}
          href="/booking"
          className="inline-flex items-center justify-center h-12 w-full px-6 rounded-md font-semibold checkoutBackBtn"
          style={{ color: "var(--foreground)" }}
        >
          {t("Изменить данные", "Edit details")}
        </GlassPanelShell>
        <GlassPanelShell
          as={Link}
          href="/"
          className="inline-flex items-center justify-center h-12 w-full px-6 rounded-md font-semibold checkoutBackBtn"
          style={{ color: "var(--foreground)" }}
        >
          {t("Вернуться на главную", "Back to home")}
        </GlassPanelShell>
      </div>

      <div
        className="mt-6 rounded-md p-4 border text-sm whitespace-pre-wrap leading-relaxed"
        style={{
          borderColor: "var(--panel-border)",
          color: "color-mix(in oklab, var(--foreground) 75%, transparent)",
        }}
      >
        <div className="font-semibold mb-2">{t("Сообщение для WhatsApp", "WhatsApp message")}</div>
        <div className="space-y-1 opacity-90">
          {previewLines.length ? (
            previewLines.map((line, i) => <div key={`${i}-${line.slice(0, 12)}`}>{line}</div>)
          ) : (
            <div>{t("Данные бронирования не найдены.", "Booking details not found.")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
