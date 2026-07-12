import { cookies } from "next/headers";
import type { Metadata } from "next";
import PrivacyClient from "./privacy.client";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Политика конфиденциальности",
  description: "Политика обработки персональных данных ШоуСочи (шоусочи.рф).",
  path: "/legal/privacy",
  noIndex: true,
});

export default async function PrivacyPage() {
  const c = await cookies();
  const initial = (c.get("lang")?.value === "en" ? "en" : "ru");
  return <PrivacyClient initialLang={initial} />;
}
