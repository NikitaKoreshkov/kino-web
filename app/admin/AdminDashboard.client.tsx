"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminDashboardClient({
  email,
  isSuperAdmin,
}: {
  email: string;
  isSuperAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(120,120,255,0.12),transparent_60%),radial-gradient(800px_400px_at_0%_100%,rgba(255,120,200,0.08),transparent_60%),#0b0b10]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.86)] backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-white/70">Добро пожаловать в админ панель</div>
          <div className="relative" ref={menuRef}>
            <button
              className="inline-flex items-center gap-3 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] text-white hover:border-white/40"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-sm font-semibold">
                {email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="text-left">
                <div className="text-xs leading-4 text-white/60">Аккаунт</div>
                <div className="text-sm leading-4">{email}</div>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.92)] backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-2">
                <div className="px-2 py-1 text-[10px] tracking-wide uppercase text-white/50">Профиль</div>
                <button
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  Выйти
                </button>
                <div className="px-2 py-1 text-[10px] tracking-wide uppercase text-white/50">Администрирование</div>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isSuperAdmin}
                  onClick={() => {
                    const email = prompt("Email нового админа:");
                    const password = email ? prompt("Пароль для нового админа:") : null;
                    if (!email || !password) return;
                    fetch("/api/admin/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
                      .then(async (r) => {
                        if (!r.ok) throw new Error(await r.text());
                        alert("Админ добавлен");
                      })
                      .catch((e) => alert(e.message));
                  }}
                >
                  Добавить админа
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isSuperAdmin}
                  onClick={() => {
                    const email = prompt("Email админа для удаления:");
                    if (!email) return;
                    fetch("/api/admin/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
                      .then(async (r) => {
                        if (!r.ok) throw new Error(await r.text());
                        alert("Админ удалён");
                      })
                      .catch((e) => alert(e.message));
                  }}
                >
                  Удалить админа
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white"
                  onClick={() => {
                    const password = prompt("Новый пароль для вашего аккаунта:");
                    if (!password) return;
                    fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
                      .then(async (r) => {
                        if (!r.ok) throw new Error(await r.text());
                        alert("Пароль обновлён");
                      })
                      .catch((e) => alert(e.message));
                  }}
                >
                  Сменить пароль
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/bookings"
            className="group rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.86)] backdrop-blur-sm p-6 text-white hover:border-white/40 transition shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="text-lg font-semibold">Посмотреть брони</div>
            <div className="mt-1 text-sm text-white/70">Список и управление бронированиями</div>
            <div className="mt-4 inline-flex items-center gap-2 text-[13px] opacity-90 group-hover:opacity-100">Открыть →</div>
          </Link>

          <Link
            href="/admin/site"
            className="group rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.86)] backdrop-blur-sm p-6 text-white hover:border-white/40 transition shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="text-lg font-semibold">Редактировать сайт</div>
            <div className="mt-1 text-sm text-white/70">Контент и настройки</div>
            <div className="mt-4 inline-flex items-center gap-2 text-[13px] opacity-90 group-hover:opacity-100">Открыть →</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
