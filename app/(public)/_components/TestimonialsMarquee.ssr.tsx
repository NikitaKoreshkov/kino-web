import { cookies } from "next/headers";
import TestimonialsMarquee from "./TestimonialsMarquee";
import type { Lang } from "../../lang";

export default async function TestimonialsMarqueeSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";
  return <TestimonialsMarquee initial={lang} />;
}
