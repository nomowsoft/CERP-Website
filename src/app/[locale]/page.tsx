"use client";
import 'aos/dist/aos.css';
import { useEffect } from "react";
import AOS from 'aos';
import Slider from './Home/slider/slider';
import Features from './Home/features/features';
import { Program } from './Home/program';
import System from './Home/system/system';
import CustomerPartner from './Home/customer_partner/customer_partner';
import { Hero } from './Home/hero';
import { News } from './Home/news';
import { Feature } from './Home/feature';
import { ContactUs } from './Home/contact_us';
import { FAQAccordion } from './Home/FAQAccordion';
import { useLocale } from 'next-intl';


export default function Home() {
  const locale = useLocale()
  useEffect(() => {
      AOS.init({
        duration: 1000,
        once: true,
      });
    }, []);
  return (
    <div dir={`${locale === "ar" ? 'rtl' : 'ltr'}`}>
      <Hero />
      <News />
      <Feature />
      <Program />
      <System />
      <CustomerPartner />
      <ContactUs />
      <FAQAccordion />
    </div>
  );
}
