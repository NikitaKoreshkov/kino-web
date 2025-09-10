import Link from "next/link";
import AdminSiteEditor from "./AdminSiteEditor.client";

export default function AdminSitePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Редактировать сайт</h1>
        <Link href="/admin" className="text-sm adminBackLink">← Назад в панель</Link>
      </div>
      <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(20,20,26,0.86)] backdrop-blur-sm p-6 text-white">
        <AdminSiteEditor />
      </div>
    </div>
  );
}
