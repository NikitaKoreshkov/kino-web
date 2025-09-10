"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        window.location.href = next;
      } else {
        setError("Неверный логин или пароль");
      }
    });
  };

  return (
    <div className="adminLogin min-h-[100svh] relative overflow-hidden flex items-center justify-center bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(120,120,255,0.20),transparent_60%),radial-gradient(800px_400px_at_0%_100%,rgba(255,120,200,0.12),transparent_60%),#0b0b10]">
      {/* subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />

      <div className="relative w-full max-w-md mx-4">
        <div className="loginCard rounded-2xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-white">Вход в админку</h1>
            <p className="mt-2 text-sm text-white/70">Введите учётные данные, чтобы продолжить</p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-5" autoComplete="off">
              <label className="grid gap-2">
                <span className="text-xs tracking-wide text-white/70">Логин</span>
                <input
                  type="text"
                  className="px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/5 text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Логин"
                  autoComplete="off"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs tracking-wide text-white/70">Пароль</span>
                <input
                  type="password"
                  className="px-3.5 py-2.5 rounded-lg border border-white/15 bg-white/5 text-white placeholder-white/50 outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  required
                />
              </label>

              {error && (
                <div className="text-sm text-red-300/90 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[linear-gradient(180deg,rgba(130,156,255,0.95)_0%,rgba(96,122,246,0.95)_100%)] text-white font-medium shadow-[0_10px_30px_rgba(100,120,250,0.35)] hover:shadow-[0_14px_36px_rgba(100,120,250,0.45)] active:translate-y-[1px] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Входим…" : "Войти"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
