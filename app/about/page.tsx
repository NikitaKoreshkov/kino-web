import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { Lang } from "@/app/lang";
import AboutClient from "./about.client";
import JsonLd from "@/app/_components/JsonLd";
import {
  getAboutExtras,
  getAboutIntroImage,
  getAboutShowBlocks,
} from "@/lib/aboutContent";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "О ШоуСочи — амфитеатр на Южном взморье",
  description:
    "Узнайте о ШоуСочи: три ежедневные программы, атмосфера амфитеатра на Южном взморье, удобная парковка. Сочи, ул. Калинина, 1/1.",
  path: "/about",
  keywords: ["о ШоуСочи", "амфитеатр Сочи", "Южное взморье развлечения"],
});

export default async function Page() {
  const cookieStore = await cookies();
  const lang = ((cookieStore.get("lang")?.value as Lang) || "ru") as Lang;
  const introImage = await getAboutIntroImage();
  const blocks = await getAboutShowBlocks(lang);
  const extras = await getAboutExtras(lang);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "О нас", path: "/about" },
        ])}
      />
      <AboutClient
        initialLang={lang}
        introImage={introImage}
        blocks={blocks}
        extras={extras}
      />
    </>
  );
}
