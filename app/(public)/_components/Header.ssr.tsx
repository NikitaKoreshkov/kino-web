import { cookies } from "next/headers";
import Header from "./Header";

export default async function HeaderSSR() {
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const ssrLang = langVal === "ru" || langVal === "en" ? (langVal as "ru" | "en") : undefined;
  const themeVal = cookieStore.get("theme")?.value;
  const ssrTheme = themeVal === "dark" ? "dark" : themeVal === "light" ? "light" : undefined;
  return <Header ssrLang={ssrLang} ssrTheme={ssrTheme} />;
}
