
import AdminSidebar from "./AdminSidebar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utils/verifyToken";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;
  const userPayload = jwtToken ? verifyTokenForPage(jwtToken) : null;

  if (!userPayload) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex bg-white min-h-screen" dir={`${locale === "ar" ? "rtl" : "ltr"}`}>
      <AdminSidebar />
      <main className={`flex-1 p-8 ${locale === "ar" ? "ms-64" : "me-64"} transition-all bg-gray-400/10`}>
        {children}
      </main>
    </div>
  );
}
