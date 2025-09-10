import { cookies } from "next/headers";
import TermsClient from "./terms.client";

export default async function TermsPage() {
  const c = await cookies();
  const initial = (c.get("lang")?.value === "en" ? "en" : "ru");
  return <TermsClient initialLang={initial} />;
}
