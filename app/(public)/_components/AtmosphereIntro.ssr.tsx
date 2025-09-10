import { cookies } from "next/headers";
import AtmosphereIntro from "./AtmosphereIntro";
import type { Lang } from "../../lang";

export default async function AtmosphereIntroSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";
  return <AtmosphereIntro initial={lang} />;
}
