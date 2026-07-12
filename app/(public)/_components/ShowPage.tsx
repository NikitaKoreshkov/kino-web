"use client";

import React, { useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import YupiShow from "./YupiShow";
import KinoShow from "./KinoShow";
import MasterShow from "./MasterShow";
import Extras from "./Extras";
import type { AboutShowData } from "./AboutShowSection";
import type { AboutExtrasData } from "@/lib/aboutContent";
import { useAboutReveal } from "../_hooks/useAboutReveal";

export type ShowPageKey = "yupi" | "cinema" | "master";

export default function ShowPage({
  show,
  initialLang,
  data,
  extras,
}: {
  show: ShowPageKey;
  initialLang: "ru" | "en";
  data?: AboutShowData;
  extras?: AboutExtrasData;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  useAboutReveal(bodyRef, [show, data?.title]);

  return (
    <>
      <Header ssrLang={initialLang} />
      <main className="aboutPage showPage relative">
        <div className="aboutBg" aria-hidden />
        <div ref={bodyRef} className="showPage__body">
          {show === "yupi" ? <YupiShow data={data} /> : null}
          {show === "cinema" ? <KinoShow data={data} /> : null}
          {show === "master" ? <MasterShow data={data} /> : null}
          <Extras data={extras} />
        </div>
        <Footer />
      </main>
    </>
  );
}
