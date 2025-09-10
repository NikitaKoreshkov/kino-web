"use client";

import { useLang, type Lang } from "@/app/lang";

type Props = { initialLang: Lang };

export default function PrivacyClient({ initialLang }: Props) {
  const { lang } = useLang(initialLang);
  const isRu = lang === "ru";
  return (
    <main>
      <section className="legalSolid min-h-[100vh] flex items-start justify-center px-6 py-20 relative overflow-hidden">
        {/* premium gradient background (themeable) */}
        <div className="absolute inset-0 -z-50" style={{ background: "var(--legal-bg)" }} />
        <div className="absolute inset-0 -z-30 mix-blend-overlay opacity-[0.04] grain" />

        <article className="w-full max-w-3xl text-slate-800 dark:text-white/90 bg-white/60 dark:bg-black/25 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <header className="text-center mb-8">
            <div className="mb-3 flex justify-center">
              <span className="tracking-[0.6em] text-sm md:text-base font-bold uppercase">Show Sochi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold">{isRu ? "Политика конфиденциальности" : "Privacy Policy"}</h1>
            <p className="text-slate-700 dark:text-white/70 mt-2 text-sm">{isRu ? "Черновик. Текст будет дополнен после согласования реквизитов." : "Draft. Will be updated after legal details are confirmed."}</p>
          </header>

          <div className="max-w-none text-[15px] leading-7 md:leading-8 text-slate-800 dark:text-white/90 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:mt-2 [&_p]:text-slate-700 dark:[&_p]:text-white/80 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
            {isRu ? (
              <>
                <h2>1. Общие положения</h2>
                <p>
                  Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта ШоуСочи.рф
                  ("Сайт"). Обработка осуществляется в соответствии с 152‑ФЗ, а при необходимости — с учётом требований GDPR.
                </p>

                <h2>2. Какие данные обрабатываем</h2>
                <ul>
                  <li>Идентификационные сведения, указанные при бронировании (имя, фамилия, телефон).</li>
                  <li>Данные, необходимые для оплаты (через платёжных провайдеров; номера карт на Сайте не хранятся).</li>
                  <li>Технические данные (cookie, IP, сведения о браузере) — для обеспечения работы Сайта и аналитики.</li>
                </ul>

                <h3>2.1. Файлы cookie, SDK и аналитика</h3>
                <p>
                  Мы можем использовать функциональные и аналитические cookie/SDK для стабильной работы Сайта, безопасности,
                  измерения посещаемости и улучшения интерфейса. Вы можете ограничить использование cookie в настройках браузера,
                  однако часть функций может стать недоступной.
                </p>

                <h2>3. Цели обработки</h2>
                <ul>
                  <li>Заключение и исполнение договоров оказания услуг по посещению шоу.</li>
                  <li>Обработка платежей, обратная связь и поддержка пользователей.</li>
                  <li>Соблюдение требований законодательства и обеспечение безопасности.</li>
                </ul>

                <h3>3.1. Маркетинговые коммуникации</h3>
                <p>
                  СМС/мессенджер‑уведомления и иные сообщения направляются только при наличии вашего согласия либо в рамках
                  исполнения договора (сервисные уведомления о бронировании). Вы можете в любой момент отказаться от
                  коммуникаций, следуя инструкциям в сообщении.
                </p>

                <h2>4. Правовые основания</h2>
                <ul>
                  <li>Согласие субъекта персональных данных.</li>
                  <li>Исполнение договора/оферты и преддоговорные меры по запросу пользователя.</li>
                  <li>Законный интерес оператора (обеспечение безопасности, пресечение злоупотреблений, аналитика в минимальном объёме).</li>
                  <li>Исполнение обязанностей, возложенных законом РФ.</li>
                </ul>

                <h2>5. Передача третьим лицам</h2>
                <p>
                  Данные могут передаваться платёжным провайдерам, хостинг‑провайдерам, сервисам аналитики и иным обработчикам
                  исключительно в объёме, необходимом для оказания услуг. Перечень и ссылки на провайдеров будут указаны после
                  интеграции.
                </p>
                <p>
                  Обработчики обязуются обеспечивать конфиденциальность и безопасность данных на уровне не ниже требований
                  законодательства РФ и заключаемых с ними соглашений об обработке данных.
                </p>

                <h2>6. Срок хранения</h2>
                <p>
                  Данные хранятся не дольше, чем это необходимо для целей обработки либо установлено законом. Отдельные категории
                  (например, документы по бухгалтерскому учёту) могут храниться в сроки, предусмотренные обязательными нормами.
                </p>

                <h2>7. Права пользователя</h2>
                <ul>
                  <li>Право на доступ к персональным данным и получение копий.</li>
                  <li>Право на исправление неточных данных и дополнение неполных.</li>
                  <li>Право на отзыв согласия и удаление данных в случаях, предусмотренных законом.</li>
                  <li>Право на ограничение обработки и возражение против обработки для определённых целей.</li>
                  <li>Право на обжалование действий оператора в уполномоченный орган.</li>
                </ul>
                <p>
                  Для реализации прав направьте запрос через контакты ниже. Мы ответим в сроки, установленные законодательством РФ.
                </p>

                <h2>8. Безопасность</h2>
                <p>
                  Применяются организационные и технические меры: шифрование каналов связи, разграничение доступа, журналирование
                  событий, минимизация доступа сотрудников, регулярные обновления. Платёжные данные обрабатываются на стороне
                  провайдеров, соответствующих отраслевым стандартам (например, PCI DSS).
                </p>

                <h2>9. Трансграничная передача</h2>
                <p>
                  При использовании зарубежных сервисов (например, облачного хостинга/аналитики) возможна трансграничная передача
                  персональных данных. В таких случаях мы обеспечиваем соблюдение требований законодательства РФ, включая оценку
                  адекватности защиты и заключение необходимых соглашений.
                </p>

                <h2>10. Детские данные</h2>
                <p>
                  Обработка данных несовершеннолетних осуществляется только с согласия законного представителя и в объёме,
                  необходимом для участия ребёнка в мероприятиях. Сопровождающий подтверждает свои полномочия.
                </p>

                <h2>11. Автоматизированные решения и профилирование</h2>
                <p>
                  Мы не осуществляем принятие решений, порождающих юридические последствия для пользователя, исключительно на
                  основе автоматизированной обработки, а также не ведём профилирование вне целей обеспечения безопасности и
                  аналитики в минимальном объёме.
                </p>

                <h2>12. Порядок обращений и жалоб</h2>
                <p>
                  Запросы и обращения по вопросам ПДн направляйте на контакт оператора. При несогласии с ответом вы вправе
                  обратиться в уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор).
                </p>

                <h2>13. Контакты оператора</h2>
                <p>
                  Оператор: ШоуСочи.рф (г. Сочи, РФ). Актуальные реквизиты и контакт для обращений по ПДн будут указаны после
                  предоставления заказчиком. Временно используйте контактный телефон, указанный на Сайте.
                </p>

                <h2>14. Изменения Политики</h2>
                <p>
                  Мы можем обновлять настоящую Политику. Актуальная версия публикуется на Сайте с указанием даты. При существенных
                  изменениях мы предпримем разумные меры уведомления пользователей.
                </p>
              </>
            ) : (
              <>
                <h2>1. General provisions</h2>
                <p>
                  This Policy defines the procedure for processing and protecting personal data of users of the ShowSochi website (the "Site").
                  Processing is carried out in accordance with Russian law, and where applicable, with GDPR requirements.
                </p>

                <h2>2. What data we process</h2>
                <ul>
                  <li>Identification data provided during booking (first name, last name, phone).</li>
                  <li>Data necessary for payment (via providers; card numbers are not stored on the Site).</li>
                  <li>Technical data (cookies, IP, browser info) to ensure Site operation and analytics.</li>
                </ul>

                <h3>2.1. Cookies, SDKs and analytics</h3>
                <p>
                  We may use functional and analytics cookies/SDKs for stable operation, security, audience measurement and UX improvements. You can limit
                  cookies in your browser settings; some features may become unavailable.
                </p>

                <h2>3. Purposes of processing</h2>
                <ul>
                  <li>Conclusion and performance of service agreements for attending shows.</li>
                  <li>Payment processing, feedback and user support.</li>
                  <li>Compliance with legal requirements and ensuring security.</li>
                </ul>

                <h3>3.1. Marketing communications</h3>
                <p>
                  SMS/messenger notifications and other messages are sent only with your consent or within contract performance (service notifications about bookings).
                  You can opt out at any time by following the instructions in the message.
                </p>

                <h2>4. Legal bases</h2>
                <ul>
                  <li>Consent of the data subject.</li>
                  <li>Performance of a contract/offer and pre‑contract measures at the user's request.</li>
                  <li>Legitimate interests of the operator (security, abuse prevention, minimal analytics).</li>
                  <li>Fulfillment of obligations imposed by Russian law.</li>
                </ul>

                <h2>5. Sharing with third parties</h2>
                <p>
                  Data may be shared with payment providers, hosting providers, analytics services and other processors strictly to the extent necessary to provide services.
                  The list and links to providers will be specified after integration.
                </p>
                <p>
                  Processors must ensure confidentiality and security at a level not lower than required by law and by data processing agreements with them.
                </p>

                <h2>6. Storage period</h2>
                <p>
                  Data is stored no longer than necessary for the purposes of processing or as required by law. Certain categories (e.g., accounting documents)
                  may be stored for periods established by mandatory rules.
                </p>

                <h2>7. User rights</h2>
                <ul>
                  <li>Right of access to personal data and to receive copies.</li>
                  <li>Right to rectify inaccurate data and supplement incomplete data.</li>
                  <li>Right to withdraw consent and delete data in cases provided by law.</li>
                  <li>Right to restrict processing and to object to processing for certain purposes.</li>
                  <li>Right to appeal operator actions to the competent authority.</li>
                </ul>
                <p>
                  To exercise your rights, please send a request via the contacts below. We will respond within the time limits established by Russian law.
                </p>

                <h2>8. Security</h2>
                <p>
                  Organizational and technical measures are applied: encrypted channels, access control, logging of events, minimization of staff access, regular updates.
                  Payment data is processed by providers complying with industry standards (e.g., PCI DSS).
                </p>

                <h2>9. Cross‑border transfer</h2>
                <p>
                  When using foreign services (e.g., cloud hosting/analytics), cross‑border data transfers may occur. In such cases, we ensure compliance with Russian
                  law, including adequacy assessments and necessary agreements.
                </p>

                <h2>10. Children's data</h2>
                <p>
                  Processing of minors' data is carried out only with the consent of a legal representative and to the extent necessary for the child's participation.
                  The accompanying person confirms their authority.
                </p>

                <h2>11. Automated decisions and profiling</h2>
                <p>
                  We do not make decisions producing legal effects solely on the basis of automated processing, nor do we conduct profiling beyond security purposes and
                  minimal analytics.
                </p>

                <h2>12. Requests and complaints</h2>
                <p>
                  Send requests regarding personal data to the operator's contact. If you disagree with the response, you have the right to contact the competent data protection authority.
                </p>

                <h2>13. Operator contacts</h2>
                <p>
                  Operator: ShowSochi.ru (Sochi, Russia). Up‑to‑date details and contact for PD requests will be provided after they are supplied by the customer. For now, use the phone on the Site.
                </p>

                <h2>14. Changes to this Policy</h2>
                <p>
                  We may update this Policy. The current version is published on the Site with the date indicated. For significant changes, we will take reasonable steps to notify users.
                </p>
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
