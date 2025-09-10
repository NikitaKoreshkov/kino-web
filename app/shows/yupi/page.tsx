import type { Metadata } from "next";
import Header from "@/app/(public)/_components/Header.ssr";
import Footer from "@/app/(public)/_components/Footer.ssr";
import YupiShow from "@/app/(public)/_components/YupiShow";

export const metadata: Metadata = {
  title: "ЮПИ ШОУ — праздник цвета и пены",
};

export default function YupiShowPage() {
  return (
    <main>
      <Header />
      <YupiShow />
      <Footer />
    </main>
  );
}
