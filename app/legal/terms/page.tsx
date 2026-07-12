import { cookies } from "next/headers";
import type { Metadata } from "next";
import TermsClient from "./terms.client";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Пользовательское соглашение",
  description: "Условия использования сайта ШоуСочи (шоусочи.рф).",
  path: "/legal/terms",
  noIndex: true,
});

export default async function TermsPage() {
  const c = await cookies();
  const initial = (c.get("lang")?.value === "en" ? "en" : "ru");
  return <TermsClient initialLang={initial} />;
}
