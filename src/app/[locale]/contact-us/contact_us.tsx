"use client";
import { useTranslations } from "next-intl";
import ContactForm from "./contactform";
import ContactInfo from "./contactintro";
import { useLocale } from "next-intl";


const Contactus = () => {
  const t = useTranslations('contact');
  const locale = useLocale();
  return (
    <section className="bg-background px-4 md:px-8 pt-20" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info - Right side in RTL */}
          <div className="order-1 lg:order-2">
            <ContactForm />
          </div>

          {/* Contact Form - Left side in RTL */}
          <div className="order-2 lg:order-1">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contactus;