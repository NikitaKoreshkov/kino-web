import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingsTableClient from "./BookingsTable.client";

export default async function AdminBookingsPage() {
  let bookings: any[] = [];
  let loadError: string | null = null;
  try {
    bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch (e: any) {
    loadError = e?.message || "Prisma client is not up to date";
  }
  type BookingRow = typeof bookings[number];
  const data = bookings.map((b) => ({
    id: b.id,
    createdAt: b.createdAt.toISOString(),
    firstName: (b as any).firstName,
    lastName: (b as any).lastName,
    phone: (b as any).phone,
    show: (b as any).show,
    pay: (b as any).pay,
    tickets: (b as any).tickets as any,
    extras: (b as any).extras as any,
    lang: (b as any).lang,
    total: (b as any).total,
    status: (b as any).status,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Бронирования</h1>
        <Link href="/admin" className="text-sm adminBackLink">← Назад в панель</Link>
      </div>

      {loadError && (
        <div className="mb-3 p-4 text-[13px] text-yellow-200 bg-yellow-900/20 border border-white/10 rounded-xl">
          Не удалось загрузить брони: {loadError}. Скорее всего, не сгенерирован Prisma Client для модели Booking.
          Сгенерируйте клиента и примените миграции.
        </div>
      )}

      {/* Client table with selection and batch delete */}
      <BookingsTableClient data={data as any} />
    </div>
  );
}
