"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { PackageOpen, FileCheck, Rocket } from "lucide-react";

export const OperatingSteps = () => {
    const t = useTranslations('steps');
    const locale = useLocale();
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
        }, 4000); // Transitions every 4 seconds
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: 1,
            title: t('step1Title'),
            desc: t('step1Desc'),
            icon: PackageOpen,
        },
        {
            id: 2,
            title: t('step2Title'),
            desc: t('step2Desc'),
            icon: FileCheck,
        },
        {
            id: 3,
            title: t('step3Title'),
            desc: t('step3Desc'),
            icon: Rocket,
        }
    ];

    return (
        <section className="pt-12 pb-10 bg-white relative overflow-hidden">
            {/* Background elements for UI enrichment */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0 relative z-10">
                <div className="text-center mb-20" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold font-doto text-gray-800 mb-4 inline-block relative">
                        <span className="relative z-10">{t('title')}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                    {/* Connecting line for desktop */}
                    <div className={`hidden md:block absolute top-[48px] w-[66.66%] h-[2px] bg-gray-100 z-0 ${locale === 'ar' ? 'right-[16.66%]' : 'left-[16.66%]'}`}>
                        <div 
                            className={`absolute top-0 h-full ${locale === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-secondary to-primary transition-all duration-1000 ease-in-out`}
                            style={{
                                width: `${((activeStep - 1) / 2) * 100}%`,
                                [locale === 'ar' ? 'right' : 'left']: 0,
                            }}
                        />
                    </div>

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = activeStep === step.id;
                        const isPast = activeStep > step.id;

                        return (
                            <div 
                                key={step.id} 
                                className="relative z-10 flex flex-col items-center group cursor-pointer"
                                onClick={() => setActiveStep(step.id)}
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                {/* Icon Box */}
                                <div className={`w-24 h-24 mb-8 rounded-[2rem] border-2 transition-all duration-500 relative flex items-center justify-center
                                    ${isActive 
                                        ? 'bg-white border-primary/30 shadow-[0_8px_30px_rgb(var(--primary-rgb),0.15)] -translate-y-2' 
                                        : 'bg-white border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
                                    }`}
                                >
                                    <div className={`absolute inset-0 rounded-[2rem] transition-opacity duration-500 
                                        ${isActive ? 'bg-primary opacity-5' : 'bg-primary opacity-0 group-hover:opacity-[0.03]'}`}
                                    ></div>
                                    <Icon className={`w-10 h-10 transition-all duration-500 
                                        ${isActive ? 'text-primary scale-110 drop-shadow-md' : 'text-gray-400 group-hover:text-primary group-hover:scale-110'}`} 
                                        strokeWidth={1.5} 
                                    />
                                    
                                    {/* Number Badge */}
                                    <div className={`absolute -top-3 ${locale === 'ar' ? '-right-3' : '-left-3'} w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white transition-all duration-500
                                        ${isActive || isPast
                                            ? (locale === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r') + ' from-secondary to-primary text-white ' + (isActive ? 'scale-110' : '')
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {step.id}
                                    </div>
                                </div>
                                
                                {/* Content Box */}
                                <div className={`text-center backdrop-blur-sm rounded-3xl p-6 transition-all duration-500 w-full relative border
                                    ${isActive 
                                        ? 'bg-white/80 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.05)]' 
                                        : 'bg-white/40 border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:bg-white/60 hover:border-gray-100'
                                    }`}
                                >
                                    <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${isActive ? 'text-primary' : 'text-gray-800'}`}>{step.title}</h3>
                                    <p className={`text-lg leading-relaxed max-w-sm mx-auto transition-colors duration-500 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
