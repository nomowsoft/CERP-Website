
import DashboardWrapper from "./DashboardWrapper";
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
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}
