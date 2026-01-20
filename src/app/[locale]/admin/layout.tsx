import AdminSidebar from "./AdminSidebar";
import prisma from "@/utils/db";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect(`/${locale}/setup`);
  }
  return (
    <div className="flex bg-white min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 ms-64 transition-all bg-gray-400/10">
        {children}
      </main>
    </div>
  );
}
