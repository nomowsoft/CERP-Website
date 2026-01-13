import Contactus from './contact_us';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function Contact() {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <Contactus />
    </NextIntlClientProvider>
  );
}
