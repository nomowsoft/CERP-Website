import "./globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Link from "next/link";
import Image from "next/image";
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import ReduxProvider from "@/app/store/ReduxProvider";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: `https://cerp.sa/${locale}`,
      siteName: 'CERP',
      images: [
        {
          url: '/header/CERP.svg',
          width: 800,
          height: 600,
          alt: 'CERP Logo',
        },
      ],
    },
    icons: {
      icon: '/header/CERP.svg',
      shortcut: '/header/CERP.svg',
      apple: '/header/CERP.svg',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/header/CERP.svg'],
    },
    alternates: {
      canonical: `https://cerp.sa/${locale}`,
      languages: {
        'ar-SA': '/ar',
        'en-US': '/en',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
type Locale = 'en' | 'ar';

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }>; }) {
  const { locale } = await params;
  const messages = await getMessages();
  if (!routing.locales.includes(locale as Locale) || !messages) {
    notFound();
  }
  return (
    <html lang={locale} dir={`${locale === "ar" ? "rtl" : "ltr"}`}>
      <head>
        <link rel="icon" href="/header/cerp_logo.svg" />
      </head>
      <body className="font-tajawalregular font-bold">
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            <Header />
            <main>
              {children}
              <ToastContainer />
            </main>
            <Footer />
          </ReduxProvider>
          <div className={`fixed bottom-20 ${locale === "ar" ? "left-8" : "right-8"} z-50`}>
            <Link href="https://wa.me/966510828040" target="_blank" className="block lg:hidden">
              <Image src="/footer/whatsapp.png" alt="..." width={60} height={20} />
            </Link>
            <Link href="https://web.whatsapp.com/send?phone=966510828040" target="_blank" className="hidden lg:block">
              <Image src="/footer/whatsapp.png" alt="..." width={60} height={20} />
            </Link>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
