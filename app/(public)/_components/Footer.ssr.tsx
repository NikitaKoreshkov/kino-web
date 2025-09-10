import { cookies } from "next/headers";
import Footer from "./Footer";

export default async function FooterSSR() {
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const ssrLang = langVal === "ru" || langVal === "en" ? (langVal as "ru" | "en") : undefined;
  return <Footer lang={ssrLang} />;
}
