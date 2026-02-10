import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import RenewalForm from './RenewalForm';
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utils/verifyToken";


export default async function RenewalPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get("jwtToken")?.value;
    const userPayload = jwtToken ? verifyTokenForPage(jwtToken) : null;

    if (!userPayload) {
        redirect(`/${locale}/login`);
    }

    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <section className="min-h-screen bg-background py-8 md:py-12">
                <RenewalForm />
            </section>
        </NextIntlClientProvider>
    );
}
