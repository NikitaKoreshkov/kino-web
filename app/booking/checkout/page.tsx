import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import CheckoutPanel from "@/app/(public)/_components/CheckoutPanel";
import { getSettingsMap, read } from "@/lib/settings";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Подтверждение бронирования",
  description: "Завершите бронирование билета в ШоуСочи через WhatsApp.",
  path: "/booking/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const initialLang = cookieLang === "en" ? "en" : "ru";
  const t = (ru: string, en: string) => (initialLang === "ru" ? ru : en);
  // Cover only from DB settings
  let coverSrc: string | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const media = read<any>(settings, "checkout.media", { images: {} });
    const c = typeof media === 'string' ? media : (media?.images?.cover || media?.cover || "");
    if (typeof c === 'string' && c.trim()) coverSrc = c.trim();
  } catch {}

  return (
    <main className="min-h-screen w-full">
      <section className="relative min-h-[100vh] w-full overflow-hidden bookingSolid" aria-label="Checkout" suppressHydrationWarning>
        {/* Split layout (desktop). До 1023px показываем единственную центральную карточку-оверлей */}
        <div className="relative w-full min-h-[100vh] min-[500px]:flex">
          {/* Left image (hidden on <500, full-bleed from 500–1023, split at lg+) */}
          <div className="hidden min-[500px]:block relative flex-1 min-h-[40vh] lg:min-h-[100vh] min-[500px]:min-h-[100vh]">
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt="Визуал шоу"
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                unoptimized={coverSrc.startsWith("/uploads/")}
              />
            ) : null}
          </div>

          {/* Overlay wrapper (absolute) on <=1023; static right column on lg+ */}
          <div className="hidden lg:flex w-full max-w-[520px] ml-auto" style={{ color: 'var(--foreground)' }}>
            <div className="min-h-[100vh] w-full px-6 sm:px-8 vpad flex" style={{ background: 'var(--panel-bg)' }}>
              <div className="my-auto">
                {/* wordmark */}
                <div className="mb-8 flex justify-center">
                  <Link href="/" aria-label="Go to home" className="tracking-[0.6em] text-base md:text-lg font-bold uppercase" style={{ color: 'color-mix(in oklab, var(--foreground) 80%, transparent)' }}>
                    Show Sochi
                  </Link>
                </div>
                <p className="text-base md:text-lg font-medium pl-1 mb-6" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>
                  {t("Бронирование в WhatsApp", "Book via WhatsApp")}
                </p>

                <CheckoutPanel initialLang={initialLang} />
              </div>
            </div>
          </div>

          {/* Absolute overlay for <=1023 (exact center via translate). Это единственная карточка на мобильных и планшетах */}
          <div className="block lg:hidden absolute z-10 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 top-1/2 min-[500px]:top-1/2" aria-hidden={false}>
            <div className="w-[min(92vw,520px)]" style={{ background: 'var(--panel-bg)', color: 'var(--foreground)' }}>
              <div className="w-full px-6 sm:px-8 py-8 rounded-2xl shadow-[0_18px_70px_rgba(0,0,0,0.18)] border" style={{ borderColor: 'var(--panel-border)' }}>
                {/* wordmark */}
                <div className="mb-8 flex justify-center">
                  <Link href="/" aria-label="Go to home" className="tracking-[0.6em] text-base md:text-lg font-bold uppercase" style={{ color: 'color-mix(in oklab, var(--foreground) 80%, transparent)' }}>
                    Show Sochi
                  </Link>
                </div>
                <p className="text-base md:text-lg font-medium pl-1 mb-6" style={{ color: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }}>
                  {t("Бронирование в WhatsApp", "Book via WhatsApp")}
                </p>

                <CheckoutPanel initialLang={initialLang} />
              </div>
            </div>
          </div>
        </div>

        {/* Themed via global CSS: see globals.css (.bookingSolid) */}
        <style>{`
          /* Symmetric vertical padding for desktop right panel, with header compensation for fixed header */
          .bookingSolid { --booking-vpad: clamp(72px, 10vh, 120px); --header-comp: 84px; }
          .bookingSolid .vpad { padding-top: calc(var(--booking-vpad) + var(--header-comp)); padding-bottom: calc(var(--booking-vpad) + var(--header-comp)); }
        `}</style>
      </section>
    </main>
  );
}
