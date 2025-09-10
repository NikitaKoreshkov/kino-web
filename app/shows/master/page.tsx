import Header from "@/app/(public)/_components/Header.ssr";
import Footer from "@/app/(public)/_components/Footer.ssr";
import MasterShow from "@/app/(public)/_components/MasterShow";

export default function MasterShowPage() {
  return (
    <main>
      <Header />
      <MasterShow />
      <Footer />
    </main>
  );
}
