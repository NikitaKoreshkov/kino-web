"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/app/lang";

const SHOWS = [
  { id: "master", ru: "Мастер-класс", en: "Master class" },
  { id: "upi", ru: "Фестиваль ЮПИ шоу", en: "UPI Festival show" },
  { id: "cinema", ru: "Кино и Шоу", en: "Cinema & Show" },
];

type TicketDef = { id: string; ru: string; en: string; price: number };
// Time slots (universal)
const TIME_SLOTS = [
  { id: "10-12", ru: "10:00 – 12:00", en: "10:00 – 12:00" },
  { id: "17-19", ru: "17:00 – 19:00", en: "17:00 – 19:00" },
  { id: "20-02", ru: "20:00 – 02:00", en: "20:00 – 02:00" },
] as const;
// Mapping show -> allowed time slot id
const TIME_BY_SHOW = {
  master: "10-12",
  upi: "17-19",
  cinema: "20-02",
} as const;

// (Day-of-week selection removed)

// USD prices for tickets (used when lang === 'en')
const USD_TICKET_PRICES: Record<string, number> = {
  // UPI
  upi_child_combo: 21,
  upi_adult: 8,
  // Cinema
  cinema_child: 4,
  cinema_adult: 6,
  // Master
  master_combo: 10,
  master_cotton: 8,
  master_popcorn: 8,
};
type ExtraDef = { id: string; ru: string; en: string; price: number };

// Pricing per show
const TICKETS_MAP: Record<string, TicketDef[]> = {
  upi: [
    { id: "upi_child_combo", ru: "Детский (1 ребенок + 1 родитель)", en: "Child (1 kid + 1 parent)", price: 1850 },
    { id: "upi_adult", ru: "Взрослый", en: "Adult", price: 700 },
  ],
  cinema: [
    { id: "cinema_child", ru: "Детский", en: "Child", price: 400 },
    { id: "cinema_adult", ru: "Взрослый", en: "Adult", price: 500 },
  ],
  master: [
    { id: "master_combo", ru: "Два мастер‑класса: вата + попкорн", en: "Two master‑classes: cotton + popcorn", price: 900 },
    { id: "master_cotton", ru: "По сладкой вате", en: "Cotton candy", price: 700 },
    { id: "master_popcorn", ru: "По попкорну", en: "Popcorn", price: 700 },
  ],
};

// Extras (common) and per‑show
const EXTRAS_COMMON: ExtraDef[] = [
  { id: "photo_10x15", ru: "Фото 10×15 в рамке", en: "Photo 10×15 in frame", price: 500 },
  { id: "photo_pack10", ru: "Фото набор из 10", en: "Photo pack of 10", price: 1500 },
  { id: "photosession_big", ru: "Большая фотосессия", en: "Big photosession", price: 2500 },
  { id: "icecream_mix", ru: "Мороженое в ассортименте", en: "Ice cream assorted", price: 40 },
  { id: "icecream_cup", ru: "Мороженое стаканчик", en: "Ice cream cup", price: 75 },
  { id: "congrats_mic", ru: "Поздравления в микрофон", en: "Congrats on mic", price: 300 },
  { id: "congrats_stage", ru: "Поздравления на сцене", en: "Congrats on stage", price: 900 },
];
const EXTRAS_UPI_ONLY: ExtraDef[] = [
  { id: "upi_photo_artists", ru: "Фото с артистами", en: "Photo with artists", price: 700 },
];

export default function BookingForm({ variant = "dark", initialLang, showTitles, customTickets }: { variant?: "dark" | "porsche"; initialLang?: "ru" | "en"; showTitles?: { master?: string; upi?: string; cinema?: string }; customTickets?: Record<string, Array<{ id: string; label: string; note?: string; priceText: string; price: number }>> }) {
  const { lang, setLang } = useLang(initialLang);
  // Helper: label for show option, with optional override from admin (home.events titles)
  const getShowLabel = useCallback((id: string) => {
    const override = (showTitles && (showTitles as any)[id]) as string | undefined;
    if (override && override.trim()) return override.trim();
    const def = SHOWS.find(s => s.id === id);
    if (!def) return id;
    return lang === 'ru' ? def.ru : def.en;
  }, [showTitles, lang]);
  const sp = useSearchParams();
  const router = useRouter();
  const initialShow = sp.get("show");
  const initialTicket = sp.get("ticket");
  const isPorsche = variant === "porsche";
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [show, setShow] = useState<string>("");
  const [pay, setPay] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [showTouched, setShowTouched] = useState<boolean>(false);
  const [payTouched, setPayTouched] = useState<boolean>(false);
  const [agreed, setAgreed] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Tickets and extras selections (id -> quantity)
  const [tickets, setTickets] = useState<Record<string, number>>({});
  const [extras, setExtras] = useState<Record<string, number>>({});

  // Snapshot of saved data to set initial 'filled' state for floating labels before init completes
  const savedSnapshot = useMemo(() => {
    if (typeof window === 'undefined') return {} as any;
    try {
      return JSON.parse(localStorage.getItem("bookingData") || '{}');
    } catch {
      return {} as any;
    }
  }, []);

  // Build custom ticket map from admin (if provided) — keep this BEFORE effects that use it
  const CUSTOM_TICKETS_MAP: Record<string, TicketDef[]> = useMemo(() => {
    const map: Record<string, TicketDef[]> = {};
    if (!customTickets) return map;
    for (const [key, arr] of Object.entries(customTickets)) {
      map[key] = (arr || []).map((it, idx) => ({
        id: (it.id && it.id.trim()) || `${key}_custom_${idx+1}`,
        ru: it.label,
        en: it.label,
        price: it.price || 0,
      }));
    }
    return map;
  }, [customTickets]);

  // Helper to save booking data to localStorage
  const saveBookingData = useCallback((updates: Record<string, any>) => {
    try {
      const currentData = JSON.parse(localStorage.getItem("bookingData") || '{}');
      const newData = { ...currentData, ...updates };
      localStorage.setItem("bookingData", JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save booking data:", e);
    }
  }, []);

  // Increment ticket or extra count
  const inc = useCallback((type: 'tickets' | 'extras', id: string) => {
    if (type === 'tickets') {
      setTickets(prevTickets => {
        const newTickets = { ...prevTickets, [id]: (prevTickets[id] || 0) + 1 };
        // persist tickets together with current show
        saveBookingData({ tickets: newTickets, show });
        return newTickets;
      });
    } else {
      setExtras(prevExtras => {
        const newExtras = { ...prevExtras, [id]: (prevExtras[id] || 0) + 1 };
        saveBookingData({ extras: newExtras, show });
        return newExtras;
      });
    }
  }, [saveBookingData, show]);

  // Decrement ticket or extra count
  const dec = useCallback((type: 'tickets' | 'extras', id: string) => {
    if (type === 'tickets') {
      setTickets(prevTickets => {
        const newQuantity = Math.max(0, (prevTickets[id] || 0) - 1);
        const newTickets = { ...prevTickets };
        if (newQuantity === 0) {
          delete newTickets[id];
        } else {
          newTickets[id] = newQuantity;
        }
        saveBookingData({ tickets: newTickets, show });
        return newTickets;
      });
    } else {
      setExtras(prevExtras => {
        const newQuantity = Math.max(0, (prevExtras[id] || 0) - 1);
        const newExtras = { ...prevExtras };
        if (newQuantity === 0) {
          delete newExtras[id];
        } else {
          newExtras[id] = newQuantity;
        }
        saveBookingData({ extras: newExtras, show });
        return newExtras;
      });
    }
  }, [saveBookingData, show]);

  // Initialize state from localStorage or default values
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Set default values first
    let initialShow = isPorsche ? "" : SHOWS[0].id;
    let initialPay = isPorsche ? "" : "card";
    let initialTickets = {};
    let initialExtras = {};
    let initialFirstName = "";
    let initialLastName = "";
    let initialPhone = "";
    let initialTimeSlot = "";
    
    // Try to load from localStorage
    try {
      const savedData = localStorage.getItem("bookingData");
      if (savedData) {
        const saved = JSON.parse(savedData);
        hadSavedTicketsRef.current = Object.prototype.hasOwnProperty.call(saved, 'tickets');
        
        // Determine show: prefer valid saved.show, otherwise infer from saved tickets
        const isValidSavedShow = saved.show && SHOWS.some(s => s.id === saved.show);
        if (isValidSavedShow) {
          initialShow = saved.show;
        } else if (saved.tickets && typeof saved.tickets === 'object') {
          const savedTicketIds = Object.keys(saved.tickets);
          if (savedTicketIds.length > 0) {
            // Find a show that contains the first ticket id
            const firstId = savedTicketIds[0];
            const inferred = Object.keys(TICKETS_MAP).find(showId => (TICKETS_MAP[showId] || []).some(t => t.id === firstId));
            if (inferred) initialShow = inferred;
          }
        }

        // Load tickets but keep only those valid for initialShow
        if (initialShow && saved.tickets && typeof saved.tickets === 'object') {
          const showTickets = TICKETS_MAP[initialShow] || [];
          const showTicketIds = new Set(showTickets.map(t => t.id));
          const savedTickets = saved.tickets as Record<string, number>;
          for (const [ticketId, quantity] of Object.entries(savedTickets)) {
            if (showTicketIds.has(ticketId) && quantity > 0) {
              initialTickets = { ...initialTickets, [ticketId]: quantity };
            }
          }
        }
        
        // Only use saved pay if it's valid
        if (saved.pay && (saved.pay === 'card' || saved.pay === 'cash')) {
          initialPay = saved.pay;
        }
        
        // Always use saved personal info if available
        if (saved.firstName) initialFirstName = saved.firstName;
        if (saved.lastName) initialLastName = saved.lastName;
        if (saved.phone) initialPhone = saved.phone;
        if (saved.timeSlot && TIME_SLOTS.some(s => s.id === saved.timeSlot)) initialTimeSlot = saved.timeSlot;
      }
      
      // If no tickets were loaded and we have a show, select the first ticket
      // BUT only when there was no tickets key saved (to respect manual clear)
      if (initialShow && Object.keys(initialTickets).length === 0 && !hadSavedTicketsRef.current) {
        const showTickets = TICKETS_MAP[initialShow] || [];
        if (showTickets.length > 0) {
          initialTickets = { [showTickets[0].id]: 1 };
        }
      }
    } catch (e) {
      console.error("Failed to load booking data:", e);
    }
    
    // Apply initial state
    setShow(initialShow);
    setPay(initialPay);
    setTickets(initialTickets);
    setExtras(initialExtras);
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setPhone(initialPhone);
    setTimeSlot(initialTimeSlot);
    
    // Mark as initialized after a small delay to avoid race conditions
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [isPorsche]);

  // Persist on change  // Update localStorage when form data changes (except tickets and extras which are handled separately)
  useEffect(() => {
    if (!isInitialized) return;
    
    const updateData = async () => {
      try {
        const currentData = JSON.parse(localStorage.getItem("bookingData") || '{}');
        const newData = {
          ...currentData,
          firstName,
          lastName,
          phone,
          show,
          pay,
          timeSlot,
          // Don't overwrite tickets and extras here as they're handled separately
          tickets: currentData.tickets || {},
          extras: currentData.extras || {}
        };
        localStorage.setItem("bookingData", JSON.stringify(newData));
      } catch (e) {
        console.error("Failed to save booking data:", e);
      }
    };
    
    updateData();
  }, [firstName, lastName, phone, pay, timeSlot, isInitialized]);

  // Persist on show change and optionally auto-select first ticket if needed
  useEffect(() => {
    if (!isInitialized) return;

    // Always persist current show
    saveBookingData({ show });

    // Only react when the show actually changed
    const prevShow = prevShowRef.current;
    if (prevShow !== show) {
      // Reset extras on real show change
      setExtras({});

      if (show) {
        const showTickets = TICKETS_MAP[show] || [];
        const hasSelectedTickets = showTickets.some(t => tickets[t.id] > 0);
        // Do not auto-select first ticket for Porsche variant to keep label animation UX
        if (!isPorsche && !hasSelectedTickets && showTickets.length > 0) {
          // Skip auto-select on the very first run after init if saved tickets key existed
          const isFirstRun = prevShow === null;
          if (!(isFirstRun && hadSavedTicketsRef.current)) {
            const newTickets = { [showTickets[0].id]: 1 };
            setTickets(newTickets);
            saveBookingData({ tickets: newTickets });
          }
        }
        // Ensure timeSlot matches the selected show
        const required = (TIME_BY_SHOW as any)[show];
        if (required && timeSlot !== required) {
          setTimeSlot(required);
          saveBookingData({ timeSlot: required });
        }
      }
    }

    // Update ref
    prevShowRef.current = show;
  }, [show, isInitialized, saveBookingData]);

  // Handle initial show from URL
  useEffect(() => {
    if (!isInitialized) return;
    // 1) Handle show param
    if (initialShow) {
      const valid = SHOWS.find((s) => s.id === initialShow);
      if (valid) setShow(valid.id);
    }
    // 2) Handle ticket param: detect its show, preselect show and that ticket
    if (initialTicket) {
      // Find which show contains this ticket id (check admin-custom first, then defaults)
      let foundShow = Object.keys(CUSTOM_TICKETS_MAP).find((sid) => (CUSTOM_TICKETS_MAP[sid] || []).some((t) => t.id === initialTicket));
      if (!foundShow) {
        foundShow = Object.keys(TICKETS_MAP).find((sid) => (TICKETS_MAP[sid] || []).some((t) => t.id === initialTicket));
      }
      if (foundShow) {
        if (show !== foundShow) {
          pendingTicketRef.current = initialTicket;
          setShow(foundShow);
        } else {
          // preselect exactly this ticket with qty 1
          setTickets({ [initialTicket]: 1 });
          saveBookingData({ show: foundShow, tickets: { [initialTicket]: 1 } });
        }
      }
    }
  }, [initialShow, initialTicket, isInitialized]);

  // Apply pending ticket after show state updates and currentTickets are ready
  useEffect(() => {
    if (!isInitialized) return;
    const tid = pendingTicketRef.current;
    if (!tid) return;
    if (!show) return;
    const all = (CUSTOM_TICKETS_MAP[show] || TICKETS_MAP[show] || []);
    const exists = all.some(t => t.id === tid);
    if (exists) {
      setTickets({ [tid]: 1 });
      saveBookingData({ show, tickets: { [tid]: 1 } });
      pendingTicketRef.current = null;
    }
  }, [show, isInitialized, CUSTOM_TICKETS_MAP]);

  const t = (ru: string, en: string) => (lang === "ru" ? ru : en);

  const validateName = useCallback((v: string) => {
    // рус/лат буквы, пробел, дефис, апостроф; 2-40 символов
    const re = /^[A-Za-zА-Яа-яЁё'\-\s]{2,40}$/;
    return re.test(v.trim());
  }, []);

  // simple RU/INTL phone mask: keeps digits, formats as +7 (XXX) XXX-XX-XX if starts with 7/8/9
  const formatPhone = useCallback((raw: string) => {
    const digits = raw.replace(/\D+/g, "");
    if (!digits) return "";
    let d = digits;
    // normalize to Russia style when starts with 7/8/9
    if (d[0] === "8") d = "7" + d.slice(1);
    if (d[0] === "9") d = "7" + d; // assume mobile
    if (d[0] !== "7") {
      // fallback international: just prefix + and group
      return "+" + d;
    }
    const p = ["+7", d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    if (d.length <= 1) return p[0];
    if (d.length <= 4) return `+7 (${p[1]}`;
    if (d.length <= 7) return `+7 (${p[1]}) ${p[2]}`;
    if (d.length <= 9) return `+7 (${p[1]}) ${p[2]}-${p[3]}`;
    return `+7 (${p[1]}) ${p[2]}-${p[3]}-${p[4]}`.replace(/-$/, "");
  }, []);

  const onPhoneChange = useCallback((v: string) => {
    const masked = formatPhone(v);
    setPhone(masked);
    // validate: require at least +7 (XXX) XXX-XX-XX length
    const ok = /^\+?\d[\d\s()\-]{10,}$/.test(masked) && masked.length >= 18;
    setPhoneError(ok ? "" : t("Введите корректный телефон", "Enter a valid phone"));
  }, [formatPhone, t]);

  // icon per show (simple, abstract)
  const ShowIcon = ({ id }: { id: string }) => {
    if (id === "master") {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 17l8-12 8 12H4z" fill="url(#g1)" opacity=".9"/>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/>
            </linearGradient>
          </defs>
        </svg>
      );
    }
    if (id === "upi") {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="url(#g2)"/>
          <defs>
            <radialGradient id="g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9 8) rotate(45) scale(16)">
              <stop stopColor="#7c3aed"/><stop offset="1" stopColor="#22d3ee"/>
            </radialGradient>
          </defs>
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="6" width="16" height="12" rx="3" fill="url(#g3)"/>
        <defs>
          <linearGradient id="g3" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/>
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // simple custom dropdown (for Porsche) to avoid native select UI
  const [showOpen, setShowOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  // (timeOpen used for removed weekday dropdown)

  // Track previous show to detect actual show changes
  const prevShowRef = useRef<string | null>(null);
  const pendingTicketRef = useRef<string | null>(null);
  // Track whether saved data had a tickets key (even if empty)
  const hadSavedTicketsRef = useRef<boolean>(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // close when clicking outside any of our dropdowns
      if (!target.closest('.p-field')) {
        setShowOpen(false);
        setPayOpen(false);
        setTicketsOpen(false);
        setExtrasOpen(false);
        // (removed: timeOpen toggle for weekday dropdown)
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Валидация имён
    const fOk = validateName(firstName);
    const lOk = validateName(lastName);
    setFirstNameError(fOk ? "" : t("Укажите корректное имя (2–40 букв)", "Enter a valid first name (2–40 letters)"));
    setLastNameError(lOk ? "" : t("Укажите корректную фамилию (2–40 букв)", "Enter a valid last name (2–40 letters)"));
    // Телефон уже валидируем в onChange, но проверим ещё раз
    const phoneOk = phoneError === "" && phone.trim().length > 0;
    // Выборы
    const showOk = !!show;
    const payOk = !!pay;
    const timeOk = !!timeSlot;

    if (!fOk || !lOk || !phoneOk || !showOk || !payOk || !timeOk) {
      return; // не уходим дальше
    }

    // Кладём данные в localStorage (для чек-аута) и отправляем на сервер
    const payload = { firstName, lastName, phone, show, pay, timeSlot, tickets, extras };
    try {
      if (typeof window !== 'undefined') localStorage.setItem("bookingData", JSON.stringify(payload));
    } catch {}

    setSubmitting(true);
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save booking');
      const data = await res.json();
      try {
        const current = JSON.parse(localStorage.getItem('bookingData') || '{}');
        localStorage.setItem('bookingData', JSON.stringify({ ...current, bookingId: data.id, total: data.total }));
      } catch {}
      router.push(`/booking/checkout?id=${encodeURIComponent(data.id)}`);
    } catch (err) {
      console.error(err);
      // Если API недоступен, продолжим без id
      router.push('/booking/checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = isPorsche
    ? "w-full h-12 px-4 rounded-md placeholder-transparent border-2 focus:outline-none focus:ring-0 transition-colors p-input"
    : "w-full h-12 px-4 rounded-xl bg-white/10 dark:bg-white/5 text-white/90 placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]";
  const labelText = isPorsche ? "hidden" : "mb-2 block text-sm font-medium text-white/80";
  const sectionTitle = isPorsche ? "hidden" : "mb-2 block text-sm font-medium text-white/80";
  const radioButtonWrap = isPorsche
    ? (active: boolean) => `group relative rounded-md border px-4 py-3 text-left transition-all ${active ? "border-black" : "border-gray-300 hover:border-black"}`
    : (active: boolean) => `group relative rounded-2xl border px-4 py-3 text-left transition-all backdrop-blur-md ${active ? "border-indigo-400/60 bg-indigo-400/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_8px_30px_rgba(80,90,255,0.25)]" : "border-white/12 bg-white/6 hover:border-white/25"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`;
  const payOptionWrap = isPorsche
    ? (active: boolean) => `flex items-center gap-3 rounded-md border px-4 py-3 cursor-pointer transition-all ${active ? "border-black" : "border-gray-300 hover:border-black"}`
    : (active: boolean) => `flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all backdrop-blur-md ${active ? "border-indigo-400/60 bg-indigo-400/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_8px_30px_rgba(80,90,255,0.25)]" : "border-white/12 bg-white/6 hover:border-white/25"} focus-within:ring-2 focus-within:ring-indigo-400/70 focus-within:ring-offset-2`;
  const textMain = isPorsche ? "text-black dark:text-white" : "text-white/90";
  const textSub = isPorsche ? "text-[12px] text-black/60" : "text-[12px] text-white/60";
  const submitBtn = isPorsche
    ? "relative inline-flex items-center justify-center h-12 w-full px-6 rounded-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none p-submit"
    : "relative inline-flex items-center justify-center h-12 px-8 rounded-2xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none ctaPremium focus-visible:ring-2 focus-visible:ring-indigo-300/80 focus-visible:ring-offset-2";

  // (duplicate broken saveBookingData block removed)
  

  const currentTickets: TicketDef[] = useMemo(() => {
    if (!show) return [];
    return (CUSTOM_TICKETS_MAP[show] || TICKETS_MAP[show] || []);
  }, [show, CUSTOM_TICKETS_MAP]);
  const currentExtras: ExtraDef[] = useMemo(() => {
    const base = EXTRAS_COMMON;
    return show === 'upi' ? base.concat(EXTRAS_UPI_ONLY) : base;
  }, [show]);
  const availableTimeSlots = useMemo((): Array<(typeof TIME_SLOTS)[number]> => {
    if (!show) return [];
    const id = (TIME_BY_SHOW as any)[show];
    return TIME_SLOTS.filter(s => s.id === id);
  }, [show]);

  const getTicketPrice = useCallback((ti: TicketDef) => {
    // If admin provided custom tickets for this show, use their numeric price as-is for both locales
    if (show && CUSTOM_TICKETS_MAP[show]) return ti.price;
    if (lang === 'en') return USD_TICKET_PRICES[ti.id] ?? ti.price;
    return ti.price;
  }, [lang, show, CUSTOM_TICKETS_MAP]);

  const total = useMemo<number>(() => {
    let sum = 0;
    currentTickets.forEach((ti: TicketDef) => {
      const q = tickets[ti.id] || 0;
      const unit = getTicketPrice(ti);
      sum += q * unit;
    });
    // Extras are not purchasable online; keep RUB prices, but quantities are zero
    currentExtras.forEach((ex: ExtraDef) => { const q = extras[ex.id] || 0; sum += q * ex.price; });
    return sum;
  }, [currentTickets, currentExtras, tickets, extras, getTicketPrice]);

  const fmt = useCallback((n: number) => {
    if (lang === 'en') {
      return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
    }
    return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  }, [lang]);

  // (день недели больше не используется)

  // When show changes, prune selections that don't belong to current lists
  useEffect(() => {
    if (!isInitialized || !show) return;
    setTickets((m) => {
      const ids = new Set(currentTickets.map((x) => x.id));
      const n: Record<string, number> = {};
      Object.keys(m).forEach((k) => { if (ids.has(k)) n[k] = m[k]; });
      return n;
    });
    setExtras((m) => {
      const ids = new Set(currentExtras.map((x) => x.id));
      const n: Record<string, number> = {};
      Object.keys(m).forEach((k) => { if (ids.has(k)) n[k] = m[k]; });
      return n;
    });
  }, [show, currentTickets, currentExtras, isInitialized]);

  // Extras are not purchasable online — keep quantities zero
  useEffect(() => {
    setExtras({});
  }, []);

  // Summaries for Porsche dropdown buttons
  const ticketsSummary = useMemo(() => {
    const q = Object.values(tickets).reduce((a, b) => a + b, 0);
    if (q === 0) return "";
    return t(`Выбрано: ${q}`, `Selected: ${q}`);
  }, [tickets, t]);
  const timeSummary = useMemo(() => {
    if (!timeSlot) return "";
    const opt = TIME_SLOTS.find(x => x.id === timeSlot);
    return opt ? (lang === 'ru' ? opt.ru : opt.en) : "";
  }, [timeSlot, lang]);
  const extrasSummary = useMemo(() => {
    const q = Object.values(extras).reduce((a, b) => a + b, 0);
    if (q === 0) return "";
    return t(`Выбрано: ${q}`, `Selected: ${q}`);
  }, [extras, t]);

  return (
    <div className={isPorsche ? "p-theme relative mx-auto w-full max-w-[420px]" : "relative mx-auto w-full max-w-xl"}>
      {!isPorsche && (
        <h1 className="text-3xl sm:text-4xl md:text-[40px] leading-tight font-semibold tracking-tight mb-8 text-white/95 text-left" style={{ fontFamily: `'Playfair Display','Clash Display', ui-serif, Georgia, serif` }}>
          {t("Бронирование билетов", "Ticket booking")}
        </h1>
      )}

      <form onSubmit={onSubmit} className="space-y-6" style={{ fontFamily: `Inter, Manrope, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial` }}>
              <div className="space-y-4">
                {isPorsche ? (
                  <div className={`p-field ${(firstName || savedSnapshot.firstName) ? 'filled' : ''}`}>
                    <div className="p-wrap">
                      <span className="p-label">{t("Имя", "First name")}</span>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => { const v=e.target.value; setFirstName(v); setFirstNameError(validateName(v)?"":t("Укажите корректное имя (2–40 букв)","Enter a valid first name (2–40 letters)")); }}
                        aria-invalid={!!firstNameError}
                        aria-describedby={firstNameError?"firstName-error":undefined}
                        className={`${inputBase} p-input`}
                      />
                    </div>
                    {firstNameError && (
                      <p id="firstName-error" className="mt-1 text-[12px] text-red-600/90">{firstNameError}</p>
                    )}
                  </div>
                ) : (
                  <label className="block">
                    <span className={labelText}>{t("Имя", "First name")}</span>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => { const v=e.target.value; setFirstName(v); setFirstNameError(validateName(v)?"":t("Укажите корректное имя (2–40 букв)","Enter a valid first name (2–40 letters)")); }}
                      aria-invalid={!!firstNameError}
                      aria-describedby={firstNameError?"firstName-error":undefined}
                      className={inputBase}
                      placeholder={undefined}
                    />
                    {firstNameError && (
                      <p id="firstName-error" className="mt-1 text-[12px] text-red-500/90">{firstNameError}</p>
                    )}
                  </label>
                )}

                {isPorsche ? (
                  <div className={`p-field ${(lastName || savedSnapshot.lastName) ? 'filled' : ''}`}>
                    <div className="p-wrap">
                      <span className="p-label">{t("Фамилия", "Last name")}</span>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => { const v=e.target.value; setLastName(v); setLastNameError(validateName(v)?"":t("Укажите корректную фамилию (2–40 букв)","Enter a valid last name (2–40 letters)")); }}
                        aria-invalid={!!lastNameError}
                        aria-describedby={lastNameError?"lastName-error":undefined}
                        className={`${inputBase} p-input`}
                      />
                    </div>
                    {lastNameError && (
                      <p id="lastName-error" className="mt-1 text-[12px] text-red-600/90">{lastNameError}</p>
                    )}
                  </div>
                ) : (
                  <label className="block">
                    <span className={labelText}>{t("Фамилия", "Last name")}</span>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => { const v=e.target.value; setLastName(v); setLastNameError(validateName(v)?"":t("Укажите корректную фамилию (2–40 букв)","Enter a valid last name (2–40 letters)")); }}
                      aria-invalid={!!lastNameError}
                      aria-describedby={lastNameError?"lastName-error":undefined}
                      className={inputBase}
                      placeholder={undefined}
                    />
                    {lastNameError && (
                      <p id="lastName-error" className="mt-1 text-[12px] text-red-500/90">{lastNameError}</p>
                    )}
                  </label>
                )}
              </div>

              {isPorsche ? (
                <div className={`p-field ${(phone || savedSnapshot.phone) ? 'filled' : ''}`}>
                  <div className="p-wrap">
                    <span className="p-label">{t("Телефон", "Phone")}</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      className={`${inputBase} p-input`}
                      placeholder=""
                      autoComplete="tel"
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                    />
                  </div>
                  {phoneError && (
                    <p id="phone-error" className="mt-1 text-[12px] text-red-600/90">{phoneError}</p>
                  )}
                </div>
              ) : (
                <label className="block">
                  <span className={labelText}>{t("Телефон", "Phone")}</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    className={inputBase}
                    placeholder={t("+7 (900) 000-00-00", "+1 (555) 000-0000")}
                    autoComplete="tel"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                  {phoneError && (
                    <p id="phone-error" className="mt-1 text-[12px] text-red-600/90">{phoneError}</p>
                  )}
                </label>
              )}

          {isPorsche ? (
            <div className={`p-field ${(showOpen || show || savedSnapshot.show) ? 'filled' : ''}`}>
              <div className="p-wrap">
                <span className="p-label">{t("Выбор шоу", "Select a show")}</span>
                <button
                  type="button"
                  className={`${inputBase} p-input flex items-center justify-between`}
                  aria-haspopup="listbox"
                  aria-expanded={showOpen}
                  onClick={() => { setShowTouched(true); setShowOpen((v) => !v); setPayOpen(false); }}
                >
                  <span className="truncate text-left">{show ? getShowLabel(show) : ''}</span>
                  <span aria-hidden className="ml-2 inline-block rotate-0 transition-transform peer-data-[open=true]:rotate-180">▾</span>
                </button>
              </div>
              {showOpen && (
                <ul role="listbox" className="p-dropdown absolute z-30 top-full left-0 right-0 mt-2 w-full rounded-md border shadow-lg overflow-hidden">
                  {SHOWS.map((s) => (
                    <li
                      key={s.id}
                      role="option"
                      aria-selected={show === s.id}
                      onClick={() => { setShow(s.id); setShowTouched(true); setShowOpen(false); }}
                      className={`px-3 py-2 cursor-pointer p-dropdown-item ${show===s.id ? 'selected' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <ShowIcon id={s.id} />
                        <span>{getShowLabel(s.id)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="block" role="radiogroup" aria-label={t("Выбор шоу", "Select a show")}>
              <span className={sectionTitle}>{t("Выбор шоу", "Select a show")}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SHOWS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShow(s.id)}
                    role="radio"
                    aria-checked={show === s.id}
                    tabIndex={show === s.id ? 0 : -1}
                    className={radioButtonWrap(show === s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-white/8 p-2 ring-1 ring-white/10">
                        <ShowIcon id={s.id} />
                      </div>
                      <div className="leading-tight">
                        <div className="text-white/95 font-medium">{lang === "ru" ? s.ru : s.en}</div>
                        <div className="text-[12px] text-white/60">{t("Лучшее место", "Best seats")}</div>
                      </div>
                    </div>
                    {show === s.id && (
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/12 via-indigo-500/10 to-sky-500/12 blur-[2px]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tickets selection (depends on show) */}
          {isPorsche ? (
              <div className={`p-field ${(ticketsOpen || !!ticketsSummary) ? 'filled' : ''}`}>
                <div className="p-wrap">
                  <span className="p-label">{t("Билеты", "Tickets")}</span>
                  <button
                    type="button"
                    className={`${inputBase} p-input flex items-center justify-between ${!show ? 'opacity-60 cursor-not-allowed' : ''}`}
                    aria-haspopup="listbox"
                    aria-expanded={ticketsOpen}
                    aria-disabled={!show}
                    disabled={!show}
                    onClick={() => { if (show) { setTicketsOpen(v=>!v); setExtrasOpen(false); setShowOpen(false); setPayOpen(false); } }}
                  >
                    <span className="truncate text-left">{ticketsSummary}</span>
                    <span aria-hidden className="ml-2 inline-block">▾</span>
                  </button>
                </div>
                {ticketsOpen && show && (
                  <ul role="listbox" className="p-dropdown absolute z-30 top-full left-0 right-0 mt-2 w-full rounded-md border shadow-lg overflow-hidden">
                    {currentTickets.map((ti: TicketDef) => (
                      <li key={ti.id} className={`px-3 py-2 p-dropdown-item`}
                        role="option" aria-selected={(tickets[ti.id]||0)>0}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{lang==='ru'?ti.ru:ti.en}</div>
                            <div className="text-[12px] opacity-70 tabular-nums">{fmt(getTicketPrice(ti))}</div>
                          </div>
                          <div className="p-counter">
                            <button type="button" aria-label="decrement" onClick={() => dec('tickets', ti.id)} className="p-cbtn">−</button>
                            <span className="w-6 text-center select-none">{tickets[ti.id] || 0}</span>
                            <button type="button" aria-label="increment" onClick={() => inc('tickets', ti.id)} className="p-cbtn">+</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
          ) : (
            show && (
              <div className="block">
                <span className={sectionTitle}>{t("Билеты", "Tickets")}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTickets.map((ti: TicketDef) => (
                    <div key={ti.id} className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/6 p-3">
                      <div className="min-w-0">
                        <div className={`${textMain} font-medium truncate`}>{lang === 'ru' ? ti.ru : ti.en}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`${textMain} font-semibold tabular-nums`}>{fmt(getTicketPrice(ti))}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label="decrement" onClick={() => dec('tickets', ti.id)} className="px-2 py-1 rounded-md border border-white/20">−</button>
                          <span className={`${textMain} w-6 text-center select-none`}>{tickets[ti.id] || 0}</span>
                          <button type="button" aria-label="increment" onClick={() => inc('tickets', ti.id)} className="px-2 py-1 rounded-md border border-white/20">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Weekday selection removed */}

          

          {/* Extras section intentionally removed from online booking UI */}

          {/* Итог */}
          <div className="flex items-center justify-between pt-1">
            <span className={isPorsche ? "text-sm p-muted" : "text-sm text-white/70"}>{t("Итого", "Total")}</span>
            <span className={"bookingTotal font-semibold text-lg tabular-nums"}>{fmt(total)}</span>
          </div>

          {/* Payment selection */}
          {isPorsche ? (
            <div className={`p-field ${(payOpen || pay || savedSnapshot.pay) ? 'filled' : ''}`}>
              <div className="p-wrap">
                <span className="p-label">{t("Способ оплаты", "Payment method")}</span>
                <button
                  type="button"
                  className={`${inputBase} p-input flex items-center justify-between`}
                  aria-haspopup="listbox"
                  aria-expanded={payOpen}
                  onClick={() => { setPayTouched(true); setPayOpen((v) => !v); setShowOpen(false); }}
                >
                  <span className="truncate text-left">
                    {pay === 'card' ? t('Банковской картой','Card') : pay === 'other' ? t('Другие способы','Other methods') : ''}
                  </span>
                  <span aria-hidden className="ml-2 inline-block">▾</span>
                </button>
              </div>
              {payOpen && (
                <ul role="listbox" className="p-dropdown absolute z-30 top-full left-0 right-0 mt-2 w-full rounded-md border shadow-lg overflow-hidden">
                  {[
                    { id: 'card', label: t('Банковской картой','Card') },
                    { id: 'other', label: t('Другие способы','Other methods') },
                  ].map((opt) => (
                    <li
                      key={opt.id}
                      role="option"
                      aria-selected={pay === opt.id}
                      onClick={() => { setPay(opt.id); setPayTouched(true); setPayOpen(false); }}
                      className={`px-3 py-2 cursor-pointer p-dropdown-item ${pay===opt.id ? 'selected' : ''}`}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="block" aria-label={t("Способ оплаты", "Payment method")}>
              <span className={sectionTitle}>{t("Способ оплаты", "Payment method")}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "card", label: t("Банковская карта", "Card") },
                  { id: "apple", label: t("Apple Pay", "Apple Pay") },
                  { id: "google", label: t("Google Pay", "Google Pay") },
                ].map((m) => (
                  <label key={m.id} className={payOptionWrap(pay === m.id)}>
                    <input
                      className="accent-indigo-500"
                      type="radio"
                      name="pay"
                      value={m.id}
                      checked={pay === m.id}
                      onChange={() => setPay(m.id)}
                    />
                    <span className={`inline-flex items-center gap-2 ${textMain}`}>
                      <span className="font-medium">{m.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-start gap-3">
            <input className={`${isPorsche ? "p-accent" : ""} mt-[4px]`} type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className={isPorsche ? "text-sm" : "text-sm text-white/70"} style={isPorsche ? { color: "var(--p-muted)" } : undefined}>
              {t("Я соглашаюсь с", "I agree to the")} {" "}
              <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className={isPorsche ? "p-link" : "underline text-white/80 hover:text-white"}>
                {t("условиями пользования", "Terms of Use")}
              </Link>{" "}
              {t("и", "and")}{" "}
              <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className={isPorsche ? "p-link" : "underline text-white/80 hover:text-white"}>
                {t("политикой обработки персональных данных", "Privacy Policy")}
              </Link>
            </span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!agreed || !!phoneError || !!firstNameError || !!lastNameError || !firstName || !lastName || !show || !pay || !timeSlot || total === 0}
              className={submitBtn}
            >
              <span className="relative z-10">{t("Перейти к оплате", "Proceed to payment")}</span>
              {!isPorsche && <span aria-hidden className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-500/25 via-indigo-500/25 to-sky-400/25 blur-2xl" />}
              {!isPorsche && <span aria-hidden className="shine" />}
            </button>
          </div>
        </form>

      {!isPorsche && (
        <style>{`
          .ctaPremium { position: relative; overflow: hidden; }
          .ctaPremium .shine { position: absolute; top: 0; bottom: 0; width: 40%; left: -40%; transform: skewX(-18deg); background: linear-gradient(90deg, rgba(255,255,255,0.00), rgba(255,255,255,0.22), rgba(255,255,255,0.00)); filter: blur(6px); }
          .ctaPremium:hover .shine { animation: shine-move 1.4s cubic-bezier(.2,.65,.2,1); }
          @keyframes shine-move { 0% { left: -40%; } 100% { left: 120%; } }
        `}</style>
      )}
      {isPorsche && (
        <style>{`
          /* Theme tokens for Porsche form */
          .p-theme { --p-input-bg: #ffffff; --p-input-fg: #111827; --p-border: #cbd5e1; --p-border-hover: #94a3b8; --p-border-focus: #6366f1; --p-label: #6b7280; --p-muted: color-mix(in oklab, var(--p-input-fg) 70%, transparent); --p-accent: #6366f1; --p-submit-bg: #111111; --p-submit-bg-hover: #0b0b0c; --p-submit-fg: #ffffff; --p-dropdown-bg: #ffffff; --p-dropdown-border: #cbd5e1; --p-dropdown-hover: rgba(0,0,0,0.06); }
          /* Dark: inputs same as panel bg, white text, white border */
          html.dark .p-theme { --p-input-bg: var(--panel-bg); --p-input-fg: #ffffff; --p-border: rgba(255,255,255,0.5); --p-border-hover: rgba(255,255,255,0.7); --p-border-focus: #ffffff; --p-label: rgba(255,255,255,0.65); --p-muted: rgba(255,255,255,0.7); --p-accent: #ffffff; --p-submit-bg: #1f2937; --p-submit-bg-hover: #111827; --p-submit-fg: #ffffff; --p-dropdown-bg: var(--panel-bg); --p-dropdown-border: rgba(255,255,255,0.5); --p-dropdown-hover: rgba(255,255,255,0.06); }

          .p-field { position: relative; display: grid; grid-template-rows: 48px auto; }
          .p-wrap { position: relative; }
          .p-field .p-input { background: var(--p-input-bg); color: var(--p-input-fg); border-color: var(--p-border); border-radius: 8px; height: 48px; border-width: 3px; transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease; position: relative; z-index: 1; }
          .p-field .p-input::placeholder { color: transparent; }
          .p-wrap .p-label { position: absolute; top: 50%; left: 12px; padding: 0 8px; background: var(--p-input-bg); box-shadow: 0 0 0 6px var(--p-input-bg); color: var(--p-label); font-size: 12px; line-height: 1; transform-origin: left center; transform: translateY(-50%); transition: top .2s ease, transform .2s ease, color .2s ease, font-weight .2s ease; pointer-events: none; z-index: 2; }
          .p-field:focus-within .p-wrap .p-label,
          .p-field.filled .p-wrap .p-label { top: 1.5px; transform: translateY(-50%) scale(1); font-weight: 700; color: var(--p-input-fg); }
          .p-field:focus-within .p-input { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,.08); border-color: var(--p-border-focus); }
          .p-field .p-input:hover { border-color: var(--p-border-hover); }

          /* Dropdown */
          .p-dropdown { background: var(--p-dropdown-bg); border-color: var(--p-dropdown-border); color: var(--p-input-fg); }
          .p-dropdown-item { color: var(--p-input-fg); }
          .p-dropdown-item:hover, .p-dropdown-item.selected { background: var(--p-dropdown-hover); }

          /* Submit button & checkbox */
          .p-submit { background: var(--p-submit-bg); color: var(--p-submit-fg); }
          .p-submit:hover { background: var(--p-submit-bg-hover); }
          .p-accent { accent-color: var(--p-accent); }

          /* Muted text */
          .p-muted { color: var(--p-muted); }
          /* Links in muted text */
          .p-link { color: var(--p-input-fg); text-decoration: underline; text-underline-offset: 2px; opacity: .9; }
          .p-link:hover { opacity: 1; }
          /* Counter */
          .p-counter { display:flex; align-items:center; gap:6px; }
          .p-cbtn { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:6px; border:2px solid var(--p-border); color: var(--p-input-fg); }
          .p-cbtn:hover { border-color: var(--p-border-hover); }
        `}</style>
      )}
    </div>
  );
}
