"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SettingsMap = Record<string, any>;

type UploadResponse = { ok: true; url: string } | { ok?: false; error: string };

function useSettings() {
  const [data, setData] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/settings", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || r.statusText);
      setData(j.settings || {});
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }

  async function save(changes: SettingsMap) {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || r.statusText);
      await load();
      return true;
    } catch (e: any) {
      setError(e.message || "Не удалось сохранить");
      return false;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { data, setData, loading, saving, error, reload: load, save };
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = (await r.json()) as UploadResponse;
  if (!r.ok || !(j as any).ok) throw new Error((j as any).error || "upload failed");
  return (j as any).url as string;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-white/60">{subtitle}</div>}
    </div>
  );
}

function ImageInput({ label, value, onChange }: { label: string; value?: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="space-y-2">
      <div className="text-sm text-white/80">{label}</div>
      {value && (
        <img src={value} alt="preview" className="w-full max-w-sm rounded-lg border border-white/15" />
      )}
      <div className="flex gap-2">
        <input
          type="url"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          placeholder="https://... или /uploads/..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const url = await uploadFile(f).catch((e) => {
              alert(e.message);
              return "";
            });
            if (url) onChange(url);
            // Сбрасываем значение через ref, чтобы не трогать e.currentTarget после await
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-sm"
          onClick={() => fileRef.current?.click()}
        >Загрузить</button>
      </div>
    </div>
  );
}

export default function AdminSiteEditor() {
  const { data, setData, loading, saving, error, save } = useSettings();
  const [tab, setTab] = useState<"home" | "about" | "booking" | "checkout">("home");

  function get<T>(key: string, fallback: T): T {
    return (data?.[key] as T) ?? fallback;
  }
  function set(key: string, value: any) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const home_panels_items = get<any[]>("home.panels.items", Array(6).fill(null).map(() => ({ image: "", title: "" })));
  const home_events = get<any[]>("home.events", Array(3).fill(null).map(() => ({ image: "", title: "", description: "" })));
  const home_carousel = get<any[]>("home.carousel", []);
  const home_map = get<any[]>("home.map", Array(3).fill(null).map(() => ({ image: "", showTitle: "", price: "", description: "" })));

  const about_intro = get<any>("about.intro", { image: "" });
  const about_blocks = get<any[]>("about.blocks", [
    { key: "upi", cover: "", title: "", description: "", prices: [{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""}], panels: Array(6).fill(null).map(()=>({ title: "", description: "" })) },
    { key: "cinema", cover: "", title: "", description: "", prices: [{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""}], panels: Array(6).fill(null).map(()=>({ title: "", description: "" })) },
    { key: "master", cover: "", title: "", description: "", prices: [{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""}], panels: Array(6).fill(null).map(()=>({ title: "", description: "" })) },
  ]);
  const about_addons = get<any>("about.addons", { title: "Доп продукты", lead: "Выберите дополнительные услуги и угощения, чтобы сделать вечер ещё ярче.", groups: { photos: "Фото", ice: "Мороженое", congrats: "Поздравления" }, items: { photos: [] as any[], ice: [] as any[], congrats: [] as any[] } });

  const booking_media = get<any>("booking.media", { images: {} });
  const checkout_media = get<any>("checkout.media", { images: {} });

  async function onSave() {
    const changes: SettingsMap = {
      // Hero video and main panel photo
      "home.hero.video": get("home.hero.video", { src: "" }),
      "home.panels.mainPhoto": get("home.panels.mainPhoto", { src: "" }),
      "home.panels.items": home_panels_items,
      "home.events": home_events,
      "home.carousel": home_carousel,
      "home.map": home_map,
      "about.intro": about_intro,
      "about.blocks": about_blocks,
      "about.addons": about_addons,
      "booking.media": booking_media,
      "checkout.media": checkout_media,
    };
    const ok = await save(changes);
    if (ok) alert("Сохранено");
  }

  if (loading) return <div className="text-white/70">Загрузка…</div>;
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-900/20 text-sm">{error}</div>
      )}

      <div className="flex gap-2 text-sm">
        {(["home","about","booking","checkout"] as const).map((t) => (
          <button key={t}
            className={`px-3 py-2 rounded-lg border ${tab===t?"bg-white/15 border-white/30":"bg-white/5 border-white/10"}`}
            onClick={() => setTab(t)}
          >{t === "home" ? "Главная" : t === "about" ? "About" : t === "booking" ? "Бронирование" : "Оплата"}</button>
        ))}
        <div className="flex-1" />
        <button
          className="px-4 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-100 text-sm disabled:opacity-50"
          onClick={onSave}
          disabled={saving}
        >{saving?"Сохранение…":"Сохранить"}</button>
      </div>

      {tab === "home" && (
        <div className="space-y-6">
          <SectionHeader title="Видео (главная страница)" />
          <ImageInput label="Видео/постер URL" value={get("home.hero.video", {src:""}).src} onChange={(url) => set("home.hero.video", { src: url })} />

          <SectionHeader title="Секция панелей" subtitle="Главная фотография и 6 карточек" />
          <ImageInput label="Фотография главной панели" value={get("home.panels.mainPhoto", {src:""}).src} onChange={(url) => set("home.panels.mainPhoto", { src: url })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {home_panels_items.map((it, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <div className="text-sm font-medium">Карточка {i+1}</div>
                <ImageInput label="Изображение" value={it.image} onChange={(u)=>{ const arr=[...home_panels_items]; arr[i]={...arr[i], image:u}; set("home.panels.items", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Заголовок" value={it.title} onChange={(e)=>{ const arr=[...home_panels_items]; arr[i]={...arr[i], title:e.target.value}; set("home.panels.items", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Заголовок (EN)" value={it.title_en||""} onChange={(e)=>{ const arr=[...home_panels_items]; arr[i]={...arr[i], title_en:e.target.value}; set("home.panels.items", arr); }} />
              </div>
            ))}
          </div>

          <SectionHeader title="Ближайшие события (3)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {home_events.map((it, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <ImageInput label="Изображение" value={it.image} onChange={(u)=>{ const arr=[...home_events]; arr[i]={...arr[i], image:u}; set("home.events", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Заголовок" value={it.title} onChange={(e)=>{ const arr=[...home_events]; arr[i]={...arr[i], title:e.target.value}; set("home.events", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Описание" value={it.description} onChange={(e)=>{ const arr=[...home_events]; arr[i]={...arr[i], description:e.target.value}; set("home.events", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Title (EN)" value={it.title_en||""} onChange={(e)=>{ const arr=[...home_events]; arr[i]={...arr[i], title_en:e.target.value}; set("home.events", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Description (EN)" value={it.description_en||""} onChange={(e)=>{ const arr=[...home_events]; arr[i]={...arr[i], description_en:e.target.value}; set("home.events", arr); }} />
              </div>
            ))}
          </div>

          <SectionHeader title="Карусель" />
          <div className="space-y-2">
            <button className="px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-sm" onClick={()=> set("home.carousel", [...home_carousel, { image: "" }])}>Добавить фото</button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {home_carousel.map((it, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                  <ImageInput label={`Фото ${i+1}`} value={it.image} onChange={(u)=>{ const arr=[...home_carousel]; arr[i]={...arr[i], image:u}; set("home.carousel", arr); }} />
                </div>
              ))}
            </div>
          </div>

          <SectionHeader title="Блок с картой (3 карточки)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {home_map.map((it, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <ImageInput label="Фото" value={it.image} onChange={(u)=>{ const arr=[...home_map]; arr[i]={...arr[i], image:u}; set("home.map", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Название шоу" value={it.showTitle} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], showTitle:e.target.value}; set("home.map", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Цена" value={it.price} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], price:e.target.value}; set("home.map", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Описание" value={it.description} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], description:e.target.value}; set("home.map", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Show title (EN)" value={it.showTitle_en||""} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], showTitle_en:e.target.value}; set("home.map", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Price (USD/$)" value={it.price_en||""} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], price_en:e.target.value}; set("home.map", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Description (EN)" value={it.description_en||""} onChange={(e)=>{ const arr=[...home_map]; arr[i]={...arr[i], description_en:e.target.value}; set("home.map", arr); }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-6">
          <SectionHeader title="Intro фото" />
          <ImageInput label="Фото" value={about_intro.image} onChange={(u)=> set("about.intro", { ...about_intro, image: u })} />

          <SectionHeader title="Три блока (UPI, Cinema, Master)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {about_blocks.map((blk, i) => (
              <div key={blk.key || i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <div className="text-sm opacity-70">{blk.key?.toUpperCase() || `Блок ${i+1}`}</div>
                <ImageInput label="Обложка" value={blk.cover} onChange={(u)=>{ const arr=[...about_blocks]; arr[i]={...arr[i], cover:u}; set("about.blocks", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Название" value={blk.title} onChange={(e)=>{ const arr=[...about_blocks]; arr[i]={...arr[i], title:e.target.value}; set("about.blocks", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Описание" value={blk.description} onChange={(e)=>{ const arr=[...about_blocks]; arr[i]={...arr[i], description:e.target.value}; set("about.blocks", arr); }} />
                <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Название (EN)" value={blk.title_en||""} onChange={(e)=>{ const arr=[...about_blocks]; arr[i]={...arr[i], title_en:e.target.value}; set("about.blocks", arr); }} />
                <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Описание (EN)" value={blk.description_en||""} onChange={(e)=>{ const arr=[...about_blocks]; arr[i]={...arr[i], description_en:e.target.value}; set("about.blocks", arr); }} />

                {/* Prices (3 buttons) */}
                <div className="space-y-2">
                  <div className="text-sm">Кнопки (3 шт.) — название и цена, опц. ticket id</div>
                  {(() => {
                    const prices = Array.isArray(blk.prices) ? blk.prices : [{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""},{label:"", price:"", note:"", ticket:""}];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {prices.map((p:any, pi:number) => (
                          <div key={pi} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder={`Название ${pi+1}`} value={p.label||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], label:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Цена (напр. 700 ₽)" value={p.price||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], price:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Подпись (мини‑текст)" value={p.note||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], note:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Ticket id (опц.)" value={p.ticket||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], ticket:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder={`Name (EN) ${pi+1}`} value={p.label_en||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], label_en:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Price (USD/$)" value={p.price_en||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], price_en:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                            <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Note (EN)" value={p.note_en||""} onChange={(e)=>{ const arr=[...about_blocks]; const pr = Array.isArray(arr[i].prices)?[...arr[i].prices]:[{},{},{}]; pr[pi]={...pr[pi], note_en:e.target.value}; arr[i]={...arr[i], prices:pr}; set("about.blocks", arr); }} />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <div className="text-sm">Панели (что входит) — 6 фиксированных</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, pi) => {
                      const p = (Array.isArray(blk.panels) ? blk.panels[pi] : undefined) || { title: "", description: "" };
                      return (
                        <div key={pi} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                          <div className="text-xs opacity-60">Панель {pi+1}</div>
                          <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder={`Заголовок`} value={p.title||""} onChange={(e)=>{ const arr=[...about_blocks]; const pn = Array.isArray(arr[i].panels)?[...arr[i].panels]:Array(6).fill(null).map(()=>({title:"",description:""})); pn[pi]={...pn[pi], title:e.target.value}; arr[i]={...arr[i], panels:pn}; set("about.blocks", arr); }} />
                          <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Описание" value={p.description||""} onChange={(e)=>{ const arr=[...about_blocks]; const pn = Array.isArray(arr[i].panels)?[...arr[i].panels]:Array(6).fill(null).map(()=>({title:"",description:""})); pn[pi]={...pn[pi], description:e.target.value}; arr[i]={...arr[i], panels:pn}; set("about.blocks", arr); }} />
                          <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder={`Title (EN)`} value={p.title_en||""} onChange={(e)=>{ const arr=[...about_blocks]; const pn = Array.isArray(arr[i].panels)?[...arr[i].panels]:Array(6).fill(null).map(()=>({title:"",description:""})); pn[pi]={...pn[pi], title_en:e.target.value}; arr[i]={...arr[i], panels:pn}; set("about.blocks", arr); }} />
                          <textarea className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Description (EN)" value={p.description_en||""} onChange={(e)=>{ const arr=[...about_blocks]; const pn = Array.isArray(arr[i].panels)?[...arr[i].panels]:Array(6).fill(null).map(()=>({title:"",description:""})); pn[pi]={...pn[pi], description_en:e.target.value}; arr[i]={...arr[i], panels:pn}; set("about.blocks", arr); }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="Доп продукты" />
          <div className="space-y-3">
            <input className="w-full max-w-md px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Заголовок секции" value={about_addons.title||""} onChange={(e)=> set("about.addons", { ...about_addons, title: e.target.value })} />
            <input className="w-full max-w-xl px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Подзаголовок (lead)" value={about_addons.lead||""} onChange={(e)=> set("about.addons", { ...about_addons, lead: e.target.value })} />
            <input className="w-full max-w-md px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Section title (EN)" value={about_addons.title_en||""} onChange={(e)=> set("about.addons", { ...about_addons, title_en: e.target.value })} />
            <input className="w-full max-w-xl px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Lead (EN)" value={about_addons.lead_en||""} onChange={(e)=> set("about.addons", { ...about_addons, lead_en: e.target.value })} />
          </div>

          {/* Названия групп */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="space-y-2">
              <div className="text-sm opacity-70">Название группы 1</div>
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Фото" value={about_addons?.groups?.photos||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), photos: e.target.value } })} />
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Photos (EN)" value={about_addons?.groups?.photos_en||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), photos_en: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm opacity-70">Название группы 2</div>
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Мороженое" value={about_addons?.groups?.ice||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), ice: e.target.value } })} />
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Ice cream (EN)" value={about_addons?.groups?.ice_en||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), ice_en: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm opacity-70">Название группы 3</div>
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Поздравления" value={about_addons?.groups?.congrats||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), congrats: e.target.value } })} />
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Congrats (EN)" value={about_addons?.groups?.congrats_en||""} onChange={(e)=> set("about.addons", { ...about_addons, groups: { ...(about_addons.groups||{}), congrats_en: e.target.value } })} />
            </div>
          </div>

          {/* Элементы групп */}
          <div className="mt-6 space-y-6">
            {[
              { key: 'photos', label: 'Фото' },
              { key: 'ice', label: 'Мороженое' },
              { key: 'congrats', label: 'Поздравления' },
            ].map((g:any) => {
              const list = (about_addons?.items?.[g.key] as any[]) || [];
              const addItem = () => {
                const items = { ...about_addons.items, [g.key]: [...list, { title: '', subtitle: '', price: '' }] };
                set("about.addons", { ...about_addons, items });
              };
              const updateItem = (idx:number, field:'title'|'subtitle'|'price', value:string) => {
                const next = [...list];
                next[idx] = { ...next[idx], [field]: value };
                const items = { ...about_addons.items, [g.key]: next };
                set("about.addons", { ...about_addons, items });
              };
              const removeItem = (idx:number) => {
                const next = list.filter((_,i)=>i!==idx);
                const items = { ...about_addons.items, [g.key]: next };
                set("about.addons", { ...about_addons, items });
              };
              return (
                <div key={g.key} className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium opacity-80">{about_addons?.groups?.[g.key] || g.label}</div>
                    <button type="button" onClick={addItem} className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 text-sm">Добавить карточку</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {list.map((it:any, idx:number) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Заголовок" value={it.title||""} onChange={(e)=>updateItem(idx,'title', e.target.value)} />
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Title (EN)" value={it.title_en||""} onChange={(e)=> updateItem(idx as any, 'title_en' as any, e.target.value)} />
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Подпись (опц.)" value={it.subtitle||""} onChange={(e)=>updateItem(idx,'subtitle', e.target.value)} />
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Subtitle (EN)" value={it.subtitle_en||""} onChange={(e)=> updateItem(idx as any, 'subtitle_en' as any, e.target.value)} />
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Цена (напр. 500 ₽ или $6)" value={it.price||""} onChange={(e)=>updateItem(idx,'price', e.target.value)} />
                        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" placeholder="Price (USD/$)" value={it.price_en||""} onChange={(e)=> updateItem(idx as any, 'price_en' as any, e.target.value)} />
                        <div className="flex justify-end">
                          <button type="button" onClick={()=>removeItem(idx)} className="px-3 py-1.5 rounded-md bg-white/8 border border-white/12 text-xs">Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "booking" && (
        <div className="space-y-6">
          <SectionHeader title="Фотографии / видео для страницы бронирования" />
          <ImageInput label="Обложка" value={booking_media.images?.cover} onChange={(u)=> set("booking.media", { ...booking_media, images: { ...(booking_media.images||{}), cover: u } })} />
        </div>
      )}

      {tab === "checkout" && (
        <div className="space-y-6">
          <SectionHeader title="Медиа для страницы оплаты" />
          <ImageInput label="Обложка" value={checkout_media.images?.cover} onChange={(u)=> set("checkout.media", { ...checkout_media, images: { ...(checkout_media.images||{}), cover: u } })} />
        </div>
      )}
    </div>
  );
}
