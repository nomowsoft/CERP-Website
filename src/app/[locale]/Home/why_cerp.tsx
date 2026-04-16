"use client";
import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Server, ShieldCheck, LockKeyhole, Headset } from "lucide-react";

export const WhyCerp = () => {
    const t = useTranslations('whyCerp');
    const locale = useLocale();

    const features = [
        {
            id: 1,
            title: t('feature1Title'),
            desc: t('feature1Desc'),
            icon: Server,
            color: locale === 'ar' ? "from-secondary to-primary" : "from-primary to-secondary"
        },
        {
            id: 2,
            title: t('feature2Title'),
            desc: t('feature2Desc'),
            icon: ShieldCheck,
            color: locale === 'ar' ? "from-secondary to-primary" : "from-primary to-secondary"
        },
        {
            id: 3,
            title: t('feature3Title'),
            desc: t('feature3Desc'),
            icon: LockKeyhole,
            color: locale === 'ar' ? "from-secondary to-primary" : "from-primary to-secondary"
        },
        {
            id: 4,
            title: t('feature4Title'),
            desc: t('feature4Desc'),
            icon: Headset,
            color: locale === 'ar' ? "from-secondary to-primary" : "from-primary to-secondary"
        }
    ];

    return (
        <section className="py-24 bg-gray-50/50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    
                    {/* Text Section */}
                    <div className="w-full lg:w-5/12" data-aos={locale === 'ar' ? 'fade-left' : 'fade-right'}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-primary font-bold mb-6">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                            {t('title')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.3]">
                            {t('title')}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed text-justify md:text-start">
                            {t('description')}
                        </p>
                        
                        <div className="mt-10 hidden lg:block">
                            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-secondary to-primary opacity-80"></div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="w-full lg:w-7/12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div 
                                        key={feature.id}
                                        className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.08)] transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 100}
                                    >
                                        {/* Subtle pattern or gradient effect on hover */}
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

                                        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                            <Icon strokeWidth={2} className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed text-base">
                                            {feature.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
