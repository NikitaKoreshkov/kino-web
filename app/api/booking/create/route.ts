import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSettingsMap, read } from "@/lib/settings";

// Ticket price maps must match client IDs
const TICKETS_MAP: Record<string, { id: string; price: number }[]> = {
  upi: [
    { id: "upi_child_combo", price: 1850 },
    { id: "upi_adult", price: 700 },
  ],
  cinema: [
    { id: "cinema_child", price: 400 },
    { id: "cinema_adult", price: 500 },
  ],
  master: [
    { id: "master_combo", price: 900 },
    { id: "master_cotton", price: 700 },
    { id: "master_popcorn", price: 700 },
  ],
};

const USD_TICKET_PRICES: Record<string, number> = {
  upi_child_combo: 21,
  upi_adult: 8,
  cinema_child: 4,
  cinema_adult: 6,
  master_combo: 10,
  master_cotton: 8,
  master_popcorn: 8,
};

function parsePrice(text: string): number {
  const num = parseInt(String(text || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(num) ? num : 0;
}

async function calcTotal(show: string, tickets: Record<string, number>, lang: "ru" | "en") {
  let sum = 0;
  // 1) Default catalog tickets
  const defaults = TICKETS_MAP[show] || [];
  for (const def of defaults) {
    const q = tickets?.[def.id] || 0;
    const unit = lang === "en" ? (USD_TICKET_PRICES[def.id] ?? def.price) : def.price;
    sum += q * unit;
  }

  // 2) Admin-configured custom tickets from about.blocks.prices
  try {
    const settings = await getSettingsMap();
    const rawBlocks = read<any[]>(settings, "about.blocks", []);
    const blk = Array.isArray(rawBlocks) ? rawBlocks.find((b: any) => String(b?.key || "") === String(show)) : null;
    if (blk && Array.isArray(blk.prices)) {
      const list: Array<{ id: string; price: number }> = blk.prices.map((p: any, idx: number) => {
        const id = String(p?.ticket || `${show}_custom_${idx + 1}`);
        const priceText = lang === "en" ? (p?.price_en || p?.price) : p?.price;
        const price = parsePrice(String(priceText || ""));
        return { id, price };
      });
      for (const item of list) {
        const q = tickets?.[item.id] || 0;
        if (q > 0) sum += q * (item.price || 0);
      }
    }
  } catch {}

  return sum;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, phone, show, pay } = body || {};
    const tickets = (body?.tickets && typeof body.tickets === 'object') ? body.tickets : {};
    const extras = (body?.extras && typeof body.extras === 'object') ? body.extras : {};

    if (!firstName || !lastName || !phone || !show || !pay) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value === "en" ? "en" : "ru") as "ru" | "en";

    const total = await calcTotal(show, tickets || {}, lang);

    const saved = await prisma.booking.create({
      data: {
        firstName: String(firstName),
        lastName: String(lastName),
        phone: String(phone),
        show: String(show),
        pay: String(pay),
        tickets,
        extras,
        lang,
        total,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: saved.id, total }, { status: 201 });
  } catch (e: any) {
    const message = e?.message || String(e);
    console.error("/api/booking/create error", e);
    // Expose error message in dev to speed up debugging
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({ error: isDev ? message : 'Server error' }, { status: 500 });
  }
}
