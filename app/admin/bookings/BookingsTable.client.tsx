"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  createdAt: string | Date;
  firstName: string;
  lastName: string;
  phone: string;
  show: string;
  pay: string;
  tickets: Record<string, number> | null;
  extras?: Record<string, any> | null;
  lang?: string | null;
  total?: number | null;
  status?: string | null;
};

const TICKET_LABELS: Record<string, Record<string, string>> = {
  upi: {
    upi_child_combo: "Детский (1 ребенок + 1 родитель)",
    upi_adult: "Взрослый",
  },
  cinema: {
    cinema_child: "Детский",
    cinema_adult: "Взрослый",
  },
  master: {
    master_combo: "2 МК: вата + попкорн",
    master_cotton: "МК по вате",
    master_popcorn: "МК по попкорну",
  },
};

export default function BookingsTableClient({ data }: { data: Booking[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allIds = useMemo(() => data.map((b) => b.id), [data]);
  const selectedIds = useMemo(() => allIds.filter((id) => selected[id]), [allIds, selected]);
  const allChecked = selectedIds.length > 0 && selectedIds.length === allIds.length;

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Удалить ${selectedIds.length} брон(ь/и)? Это действие необратимо.`)) return;
    const res = await fetch("/api/admin/bookings/batch-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`Ошибка: ${text}`);
      return;
    }
    setSelected({});
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white/70">
          Выбрано: {selectedIds.length}
        </div>
        <button
          className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/15 bg-white/10 text-white text-sm hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed`}
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
        >
          Удалить выбранные
        </button>
      </div>

      <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.86)] backdrop-blur-sm p-0 text-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const next: Record<string, boolean> = {};
                      if (checked) allIds.forEach((id) => (next[id] = true));
                      setSelected(next);
                    }}
                  />
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Время</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Имя</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Телефон</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Шоу</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Билеты</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Оплата</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Сумма</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Статус</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Язык</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => {
                const dt = new Date(b.createdAt);
                const when = dt.toLocaleString("ru-RU", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const total = b.total ?? 0;
                const status = b.status || "NEW";
                const show = b.show;
                const tickets = (b.tickets || {}) as Record<string, number>;
                const labels = TICKET_LABELS[show] || {};
                const ticketLines = Object.entries(tickets)
                  .filter(([, q]) => (q as number) > 0)
                  .map(([id, q]) => `${labels[id] || id} × ${q}`);
                const ticketsSummary = ticketLines.length > 0 ? ticketLines.join(", ") : "—";
                const checked = !!selected[b.id];

                return (
                  <tr key={b.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 align-top whitespace-nowrap text-white/90">
                      <input
                        type="checkbox"
                        aria-label={`select ${b.id}`}
                        checked={checked}
                        onChange={(e) => setSelected((s) => ({ ...s, [b.id]: e.target.checked }))}
                      />
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-white/90">{when}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{b.lastName} {b.firstName}</div>
                      <div className="text-white/50 text-xs">ID: {b.id}</div>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">{b.phone}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">{show}</td>
                    <td className="px-4 py-3 align-top">{ticketsSummary}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">{b.pay}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">{new Intl.NumberFormat("ru-RU").format(total)} ₽</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span className="inline-flex items-center h-6 px-2 rounded-full border border-white/15 bg-white/10 text-[12px]">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">{b.lang || "ru"}</td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-white/60">Пока нет бронирований</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 text-xs text-white/50">Показано: {data.length} (последние)</div>
    </div>
  );
}
