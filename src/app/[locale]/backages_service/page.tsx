"use client";
import { Suspense } from 'react'
import { Backages } from './backages'
import { Service } from './service'
import { useLocale } from 'next-intl'
import Image from 'next/image';
import { HeartHandshake, ShieldCheck, CheckCircle2, Star } from 'lucide-react';

export default function BackagesService() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section dir={`${locale === "ar" ? "rtl" : "ltr"}`} className="bg-gray-50/20 min-h-screen">
      <section className="pt-32 pb-48 relative overflow-hidden bg-gradient-to-b from-gray-50 to-primary/5">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex justify-center relative z-10" data-aos="fade-down">
          <span className="flex items-center gap-2 mb-6 border border-primary/20 rounded-full px-5 py-2 bg-white shadow-sm">
            <Image src="/backage_service/Component.svg" height={24} width={24} alt="icon" />
            <span className="text-primary font-bold">
              {isAr ? "الخدمات والباقات والأنظمة" : "Services, Packages & Systems"}
            </span>
          </span>
        </div>

        {/* Floating Trust Badges for Charitable Orgs (Hidden on small screens) */}
        <div className="hidden lg:flex absolute top-32 right-10 xl:right-32 items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white z-10 animate-[bounce_6s_infinite]" data-aos="fade-left" data-aos-delay="200">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div dir="rtl">
            <p className="font-bold text-gray-900 leading-tight text-lg">القطاع غير الربحي</p>
            <p className="text-sm text-gray-500 font-medium">مصمم خصيصاً للجمعيات</p>
          </div>
        </div>

        <div className="hidden lg:flex absolute bottom-56 left-10 xl:left-32 items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white z-10 animate-[bounce_7s_infinite_0.5s]" data-aos="fade-right" data-aos-delay="400">
          <div className="bg-secondary/10 p-3 rounded-2xl text-secondary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div dir="rtl">
            <p className="font-bold text-gray-900 leading-tight text-lg">متوافق مع الحوكمة</p>
            <p className="text-sm text-gray-500 font-medium">معايير المركز الوطني</p>
          </div>
        </div>

        <div className="hidden lg:flex absolute top-64 left-24 xl:left-48 items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-white z-10 animate-[bounce_5s_infinite_1s]" data-aos="fade-down" data-aos-delay="600">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-[15px] font-bold text-gray-700">140+ جمعية مستفيدة</span>
        </div>

        <div className="hidden lg:flex absolute bottom-64 right-20 xl:right-40 items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-white z-10 animate-[bounce_8s_infinite_1.5s]" data-aos="fade-up" data-aos-delay="800">
          <Star className="w-5 h-5 text-secondary fill-secondary" />
          <span className="text-[15px] font-bold text-gray-700">دعم فني مستمر</span>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10" data-aos="fade-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-doto2 font-bold mb-6 text-gray-900 leading-tight">
             <span>{isAr ? "اختر " : "Choose "}</span>
             <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent font-bold px-2 inline-block pb-2">
               {isAr ? "الباقة المناسبة" : "the Suitable Package"}
             </span>
             <br className="hidden md:block" />
             <span> {isAr ? "لاحتياجاتك" : "for Your Needs"}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "نقدم لك منظومة متكاملة من الأنظمة والباقات والخدمات المصممة باحترافية لتلبية احتياجات مؤسستك"
              : "We offer you an integrated suite of systems, packages, and services professionally designed to meet your organization's needs"}
          </p>
        </div>
      </section>

      {/* 1. Packages & Systems Section */}
      <Suspense fallback={<div className="container mx-auto py-10 text-center">Loading...</div>}>
        <Backages />
      </Suspense>
      
      {/* 2. Additional Services Section */}
      <Service />
    </section>
  )
}
