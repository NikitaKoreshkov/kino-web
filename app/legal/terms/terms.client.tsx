"use client";

import { useLang, type Lang } from "@/app/lang";

type Props = { initialLang: Lang };

export default function TermsClient({ initialLang }: Props) {
  const { lang } = useLang(initialLang);
  const isRu = lang === "ru";
  return (
    <main>
      <section className="legalSolid min-h-[100vh] flex items-start justify-center px-6 py-20 relative overflow-hidden">
        {/* premium gradient background (themeable) */}
        <div className="absolute inset-0 -z-50 bg-layer" style={{ background: "var(--legal-bg)" }} />
        <div className="absolute inset-0 -z-30 mix-blend-overlay opacity-[0.04] grain" />

        <article className="w-full max-w-3xl text-slate-800 dark:text-white/90 bg-white/60 dark:bg-black/25 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <header className="text-center mb-8">
            <div className="mb-3 flex justify-center">
              <span className="tracking-[0.6em] text-sm md:text-base font-bold uppercase">Show Sochi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {isRu ? "Пользовательское соглашение" : "Terms of Use"}
            </h1>
            <p className="text-slate-700 dark:text-white/70 mt-2 text-sm">
              {isRu ? "Черновик. Будет дополнено реквизитами и политикой возвратов." : "Draft. Will be updated with legal details and refund policy."}
            </p>
          </header>

          <div className="max-w-none text-[15px] leading-7 md:leading-8 text-slate-800 dark:text-white/90 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:mt-2 [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
            {isRu ? (
              <>
                <h2>1. Термины и акцепт</h2>
                <p>
                  Используя сайт ШоуСочи.рф (далее — «Сайт»), вы подтверждаете согласие с настоящим Соглашением. При
                  несогласии с условиями — прекратите использование Сайта.
                </p>

                <h2>2. Услуги и бронирование</h2>
                <p>
                  Сайт предоставляет возможность забронировать участие в мероприятиях («Шоу»). Фактическое оказание услуг
                  осуществляется организатором мероприятия. Подтверждение бронирования и порядок оплаты указываются на Сайте.
                </p>

                <h3>2.1. Особенности форматов «ЮПИ ШОУ»</h3>
                <ul>
                  <li>Пенные активности, тропический ливень/танцы под дождём, тёплый душ по окончании.</li>
                  <li>Рекомендованная форма одежды: купальники. Обязательно иметь сухие полотенца для себя и ребёнка.</li>
                  <li>Возможны скользкие поверхности из‑за воды и пены; требуется аккуратность при передвижении.</li>
                  <li>Музыкальное сопровождение (в т.ч. хиты 90‑х); возможен повышенный уровень звука.</li>
                </ul>

                <h2>3. Оплата и возвраты</h2>
                <p>
                  Оплата производится через платёжных провайдеров. Условия возврата средств, обмена билетов и отмены участия
                  будут опубликованы после интеграции провайдеров и предоставления правил организатором.
                </p>

                <h2>4. Поведение и безопасность</h2>
                <p>
                  Посещение Шоу может включать эффекты света/звука, активные зоны, физическую активность и иные факторы риска.
                  Пользователь обязуется следовать инструкциям персонала и правилам безопасности площадки.
                </p>

                <h2>5. Отказ от ответственности</h2>
                <p>
                  Организатор и Оператор Сайта не несут ответственности за травмы, ущерб имуществу и иные последствия, возникшие
                  вследствие нарушения правил, состояния здоровья, действий третьих лиц или форс‑мажора. Ответственность ограничена
                  суммой, фактически уплаченной за услугу, в пределах, допустимых законодательством РФ.
                </p>

                <h2>6. Персональные данные</h2>
                <p>
                  Обработка ПДн регулируется Политикой конфиденциальности. Данные платёжных карт обрабатываются на стороне поставщиков и на Сайте не хранятся.
                </p>

                <h2>7. Прочие условия</h2>
                <p>Оператор вправе обновлять Соглашение; актуальная редакция публикуется на Сайте.</p>
              </>
            ) : (
              <>
                <h2>1. Terms and acceptance</h2>
                <p>
                  By using the ShowSochi website (the "Site"), you agree to these Terms. If you do not agree, please stop using the Site.
                </p>

                <h2>2. Services and booking</h2>
                <p>
                  The Site allows you to book participation in events (the "Shows"). Services are provided by the Event Organizer. Booking confirmation and payment
                  flow are specified on the Site.
                </p>

                <h2>3. Payment and refunds</h2>
                <p>
                  Payments are processed by providers. Detailed refund/exchange/cancellation terms will be published after provider integration and Organizer confirmation.
                </p>

                <h2>4. Conduct and safety</h2>
                <p>
                  Visiting the Shows may involve light/sound effects, active zones and physical activity. You must follow staff instructions and venue safety rules.
                </p>

                <h2>5. Disclaimer</h2>
                <p>
                  The Organizer and the Site Operator are not liable for injuries, property damage or other consequences resulting from rule violations, health
                  conditions, actions of third parties or force majeure. Liability is limited to the amount actually paid, to the extent permitted by Russian law.
                </p>

                <h2>6. Personal data</h2>
                <p>
                  Personal data processing is governed by the Privacy Policy. Card details are processed by payment providers and are not stored on the Site.
                </p>

                <h2>7. Miscellaneous</h2>
                <p>The Operator may update these Terms; the current version is published on the Site.</p>
              </>
            )}
          </div>
        </article>

        <style jsx>{`
          /* Theme variables for legal background */
          :root:not(.dark) .legalSolid { --legal-bg: 
            radial-gradient(120% 80% at 20% 10%, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 55%),
            radial-gradient(120% 90% at 80% 0%, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0) 60%),
            linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
          }
          .dark .legalSolid { --legal-bg: 
            radial-gradient(120% 80% at 20% 10%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 55%),
            radial-gradient(120% 90% at 80% 0%, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 60%),
            linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(2,6,23,1) 100%);
          }
        `}</style>
      </section>
    </main>
  );
}
