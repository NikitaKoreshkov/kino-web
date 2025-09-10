import Header from "@/app/(public)/_components/Header.ssr";
import Footer from "@/app/(public)/_components/Footer.ssr";
import KinoShow from "@/app/(public)/_components/KinoShow";

export default function CinemaShowPage() {
  return (
    <main>
      <Header />
      <KinoShow />
      <Footer />
    </main>
  );
}
