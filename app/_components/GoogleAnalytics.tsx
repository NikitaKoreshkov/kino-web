import Script from "next/script";

const GA_ID = "G-V3Q5KJ9SWF";

/** Google Analytics 4 — stream ShowSochi (G-V3Q5KJ9SWF) */
export default function GoogleAnalytics({ nonce }: { nonce?: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga4-gtag" strategy="afterInteractive" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
