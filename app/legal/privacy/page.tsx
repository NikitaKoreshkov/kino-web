import { cookies } from "next/headers";
import PrivacyClient from "./privacy.client";

export default async function PrivacyPage() {
  const c = await cookies();
  const initial = (c.get("lang")?.value === "en" ? "en" : "ru");
  return <PrivacyClient initialLang={initial} />;
}
