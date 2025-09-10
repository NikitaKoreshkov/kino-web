import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import AdminDashboardClient from "./AdminDashboard.client";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email || "";
  const isSuperAdmin = !!process.env.SUPERADMIN_EMAIL && email === process.env.SUPERADMIN_EMAIL;
  return <AdminDashboardClient email={email} isSuperAdmin={isSuperAdmin} />;
}
