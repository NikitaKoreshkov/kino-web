"use client";

import React from "react";
import { useLang } from "../../lang";

export default function Footer({ lang: initialLang }: { lang?: "ru" | "en" }) {
  const { lang } = useLang(initialLang);
  return (
    <footer className="footerSection" aria-label="Footer">
      <div className="footerWrap">
        <div className="footerBrand">
          <div className="fMark" aria-hidden>
            {/* Simple monogram logo (stylized S curve) */}
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Outer subtle inset ring to match panel rim-light style */}
              <rect x="1.5" y="1.5" width="21" height="21" rx="6" ry="6" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
              {/* S-shaped path */}
              <path
                d="M16.5 6.75c0-2.1-9-2.1-9 0 0 2.1 9 2.1 9 4.2s-9 2.1-9 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="fName">SHOWSOCHI</div>
          <div className="fTag">{lang === 'ru' ? 'Место для ваших эмоций' : 'Premium event space'}</div>
        </div>

        <nav className="footerNav" aria-label={lang === 'ru' ? 'Навигация по сайту' : 'Site navigation'}>
          <div className="fCol">
            <h4>{lang === 'ru' ? 'Разделы' : 'Sections'}</h4>
            <ul>
              <li><a href="#events">{lang === 'ru' ? 'События' : 'Events'}</a></li>
            </ul>
          </div>
          <div className="fCol">
            <h4>{lang === 'ru' ? 'Контакты' : 'Contacts'}</h4>
            <ul>
              <li>
                <a href="https://yandex.kz/maps/239/sochi/?from=mapframe&ll=39.912714%2C43.428581&mode=routes&rtext=~43.428499%2C39.912944&rtt=auto&ruri=~ymapsbm1%3A%2F%2Forg%3Foid%3D131805703222&z=17" target="_blank" rel="noopener noreferrer">
                  {lang === 'ru' ? 'Как добраться' : 'How to get there'}
                </a>
              </li>
              <li><a href="/booking">{lang === 'ru' ? 'Бронирование' : 'Booking'}</a></li>
            </ul>
          </div>
          <div className="fCol">
            <h4>{lang === 'ru' ? 'Соцсети' : 'Socials'}</h4>
            <ul className="fSocials">
              <li>
                <a href="https://api.whatsapp.com/send/?phone=79631630066&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9F%D0%B8%D1%88%D1%83+%D1%81+%D1%81%D0%B0%D0%B9%D1%82%D0%B0%2C+%D0%BD%D1%83%D0%B6%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C.&type=phone_number&app_absent=0" aria-label="WhatsApp" className="soc wa" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false" preserveAspectRatio="xMidYMid meet">
                    <path fill="currentColor" stroke="none" fillRule="evenodd" clipRule="evenodd" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.768.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.884-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.298-.496.099-.198.05-.372-.025-.521-.075-.149-.672-1.611-.922-2.206-.242-.579-.487-.5-.672-.51l-.572-.01c-.198 0-.521.074-.793.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.213-3.741.982.999-3.648-.236-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.86 11.86 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.892a11.821 11.821 0 0 0-3.465-8.413Z"/>
                  </svg>
                  <span className="socLabel">WhatsApp</span>
                </a>
              </li>
              <li><a href="tel:+79631630066" className="soc phone">+7 (963) 163-00-66</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footerBottom">
        <div className="footerWrap">
          <div className="copy">
            <span className="copyBrand">© {new Date().getFullYear()} SHOWSOCHI.</span>
            <span className="copyRights">{lang === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</span>
          </div>
          <div className="policies">
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
            </a>
            <span className="dot" aria-hidden />
            <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
              {lang === 'ru' ? 'Пользовательское соглашение' : 'Terms of Use'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
