import BookingForm from "@/app/(public)/_components/BookingForm";
import ClientOnly from "@/app/(public)/_components/ClientOnly";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSettingsMap, read } from "@/lib/settings";

export const metadata = {
  title: "Бронирование | Every moment",
  description: "Забронируйте участие в мероприятии — премиальный опыт покупки билетов.",
};

export default async function BookingPage() {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const initialLang = cookieLang === "en" ? "en" : "ru";
  const t = (ru: string, en: string) => (initialLang === "ru" ? ru : en);
  // Read booking cover image from settings
  let coverSrc: string = "/images/cinema.svg";
  let bookingShowTitles: { master?: string; upi?: string; cinema?: string } | undefined = undefined;
  let customTickets: Record<string, Array<{ id: string; label: string; note?: string; priceText: string; price: number }>> | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const media = read<any>(settings, "booking.media", { images: {} });
    const c = typeof media === 'string' ? media : (media?.images?.cover || media?.cover || "");
    if (typeof c === 'string' && c.trim()) coverSrc = c.trim();
    // Read event titles for booking select from home.events (order: master, upi, cinema)
    const ev = read<any[]>(settings, "home.events", []);
    if (Array.isArray(ev) && ev.length) {
      bookingShowTitles = {
        master: (initialLang === 'en' ? (ev[0]?.title_en || ev[0]?.title) : ev[0]?.title)?.toString() || undefined,
        upi: (initialLang === 'en' ? (ev[1]?.title_en || ev[1]?.title) : ev[1]?.title)?.toString() || undefined,
        cinema: (initialLang === 'en' ? (ev[2]?.title_en || ev[2]?.title) : ev[2]?.title)?.toString() || undefined,
      };
    }
    // Build custom tickets from about.blocks.prices (label, note, price, ticket)
    const rawBlocks = read<any[]>(settings, 'about.blocks', []);
    if (Array.isArray(rawBlocks) && rawBlocks.length) {
      const map: Record<string, Array<{ id: string; label: string; note?: string; priceText: string; price: number }>> = {};
      rawBlocks.forEach((b: any) => {
        const key = (b?.key || '').toString();
        if (!key) return;
        const arr = Array.isArray(b?.prices) ? b.prices : [];
        const items = arr.slice(0,3).map((p: any) => {
          const id = (p?.ticket || '').toString();
          const labelBase = (p?.label || '').toString();
          const labelEn = (p?.label_en || '').toString();
          const noteBase = (p?.note || '').toString();
          const noteEn = (p?.note_en || '').toString();
          const priceBase = (p?.price || '').toString();
          const priceEn = (p?.price_en || '').toString();
          const label = (initialLang === 'en' ? (labelEn || labelBase) : labelBase);
          const note = (initialLang === 'en' ? (noteEn || noteBase) : noteBase);
          const priceText = (initialLang === 'en' ? (priceEn || priceBase) : priceBase);
          const num = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
          const price = Number.isFinite(num) ? num : 0;
          const fullLabel = note ? `${label} (${note})` : label;
          return { id, label: fullLabel, note, priceText, price };
        }).filter((it: any) => it.label);
        if (items.length) map[key] = items;
      });
      if (Object.keys(map).length) customTickets = map;
    }
  } catch {}
  return (
    <ClientOnly>
    <main className="min-h-screen w-full">
      <section className="relative min-h-[100vh] w-full overflow-hidden bookingSolid" aria-label="Booking" suppressHydrationWarning>
        {/* Tablet layout (centered card) — 501–1050px */}
        <div className="relative tabletOnly min-h-[100vh] items-center justify-center hidden md:flex">
          {/* background image */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverSrc} alt="Визуал шоу" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 w-full max-w-[520px] px-4 sm:px-6">
            <div className="tabletCard mx-auto max-w-[460px] rounded-xl backdrop-blur-[2px] border shadow-[0_20px_60px_rgba(0,0,0,.28)]" style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--foreground)' }}>
              <div className="px-6 sm:px-8 vpad">
                <div className="mb-6 flex justify-center">
                  <Link href="/" className="tracking-[0.6em] text-base font-bold uppercase" style={{ color: 'color-mix(in oklab, var(--foreground) 80%, transparent)' }}>Show Sochi</Link>
                </div>
                <p className="text-base font-medium pl-1 mb-5" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>{t("Пожалуйста, введите данные для бронирования.", "Please enter your booking details.")}</p>
                <BookingForm variant="porsche" initialLang={initialLang} showTitles={bookingShowTitles} customTickets={customTickets} />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop split layout — ≥1051px */}
        <div className="desktopOnly hidden w-full">
          {/* Left image */}
          <div className="relative flex-1 min-h-[40vh] lg:min-h-[100vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverSrc} alt="Визуал шоу" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Right white panel */}
          <div className="w-full max-w-[520px] flex ml-auto" style={{ background: 'var(--panel-bg)', color: 'var(--foreground)' }}>
            <div className="min-h-[100vh] w-full px-6 sm:px-8 vpad flex">
              <div className="my-auto w-full flex flex-col">
                {/* wordmark */}
                <div className="mb-8 flex justify-center">
                  <Link href="/" className="tracking-[0.6em] text-base md:text-lg font-bold uppercase" style={{ color: 'color-mix(in oklab, var(--foreground) 80%, transparent)' }}>Show Sochi</Link>
                </div>
                <p className="text-base md:text-lg font-medium pl-4 mb-6" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>{t("Пожалуйста, введите данные для бронирования.", "Please enter your booking details.")}</p>
                <BookingForm variant="porsche" initialLang={initialLang} showTitles={bookingShowTitles} customTickets={customTickets} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile — ≤500px */}
        <div className="mobileOnly block w-full" style={{ background: 'var(--panel-bg)', color: 'var(--foreground)' }}>
          <div className="w-full px-4 vpad">
            <div className="mb-6 flex justify-center">
              <Link href="/" className="tracking-[0.6em] text-base font-bold uppercase" style={{ color: 'color-mix(in oklab, var(--foreground) 80%, transparent)' }}>Show Sochi</Link>
            </div>
            <p className="text-base font-medium pl-2 mb-5" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>{t("Пожалуйста, введите данные для бронирования.", "Please enter your booking details.")}</p>
            <BookingForm variant="porsche" initialLang={initialLang} customTickets={customTickets} showTitles={bookingShowTitles} />
          </div>
        </div>

        {/* Solid panel override + precise media split */}
        <style>{`
          /* Make the booking panel non-transparent only on this page */
          .bookingSolid { --panel-bg: #FFFFFF; --panel-border: rgba(24,26,31,0.10); }
          html.dark .bookingSolid { --panel-bg: #141416; --panel-border: rgba(255,255,255,0.12); }

          /* Reduce extra vertical space and prevent accidental page scroll */
          .bookingSolid { --booking-vpad: clamp(56px, 8vh, 100px); --header-comp: 0px; overflow: clip; }
          /* Equal top/bottom padding without header compensation (header is fixed and overlays content) */
          .bookingSolid .vpad { padding-top: var(--booking-vpad); padding-bottom: var(--booking-vpad); }

          /* Mobile: up to 500px */
          .mobileOnly { display: block; }
          .tabletOnly { display: none; }
          .desktopOnly { display: none; }
          @media (min-width: 501px) and (max-width: 1050px) {
            .mobileOnly { display: none; }
            .tabletOnly { display: flex; }
            .desktopOnly { display: none; }
          }
          @media (min-width: 1051px) {
            .mobileOnly { display: none; }
            .tabletOnly { display: none; }
            .desktopOnly { display: flex; }
          }

          /* Tablet card edge halo (light theme only via global .dark) */
          .tabletCard { position: relative; }
          html:not(.dark) .tabletCard::before {
            content: "";
            position: absolute;
            inset: -2px; /* tight to edges */
            border-radius: 18px;
            z-index: -1;
            /* four soft radial lights hugging edges */
            background:
              radial-gradient(140px 70px at 50% -10px, rgba(255,255,255,.85), rgba(255,255,255,0) 70%), /* top */
              radial-gradient(140px 70px at 50% 110%, rgba(255,255,255,.8), rgba(255,255,255,0) 70%),  /* bottom */
              radial-gradient(70px 140px at -10% 50%, rgba(255,255,255,.8), rgba(255,255,255,0) 70%),  /* left */
              radial-gradient(70px 140px at 110% 50%, rgba(255,255,255,.8), rgba(255,255,255,0) 70%);  /* right */
            filter: blur(12px);
            pointer-events: none;
          }
        `}</style>
      </section>
    </main>
    </ClientOnly>
  );
}
