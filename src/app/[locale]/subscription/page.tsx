import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import SubscriptionWizard from './SubscriptionWizard';


export default async function Contact() {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <section className="min-h-screen bg-background py-8 md:py-12 px-4">
                <SubscriptionWizard />
            </section>
        </NextIntlClientProvider>
    );
}