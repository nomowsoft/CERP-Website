"use client";
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getServices } from '@/app/store/slices/servicesSlice';
import { useEffect } from 'react';
import { ServiceDTO, ServiceTypeDto } from '@/utils/types';
import { ArrowLeft, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { isValidImage } from '@/utils/imageUtils';

export const Service = () => {
    const locale = useLocale();
    const t = useTranslations("programs");
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        dispatch(getServices());
    }, [dispatch]);

    const Services = useSelector((state: any) => state.services.services);
    
    return (
        <section className="container mx-auto py-16 lg:py-20 relative z-10" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col items-center mb-12 text-center" data-aos="fade-up">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 text-secondary font-bold mb-6 border border-secondary/20">
                    <Settings className="w-5 h-5 drop-shadow-sm" />
                    <span>{t('additionalServices')}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 font-doto2 leading-tight mb-4">
                    {locale === 'ar' ? (
                        <>خدمات <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">سرب</span> الإضافية</>
                    ) : (
                        <>Additional <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">Sarb</span> Services</>
                    )}
                </h2>
                
                <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    {t('additionalServicesSubtitle')}
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 grid-cols-1 gap-8 lg:gap-10 lg:mx-0 mx-4">
                {Services.map((service: ServiceDTO, index: number) => (
                    <div 
                        key={service.id} 
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className="h-full"
                    >
                        <div className="group h-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(var(--primary-rgb),0.12)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between hover:-translate-y-2 hover:border-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            
                            <div className="relative z-10 mb-8">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-start mb-6">
                                    <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-[1.5rem] flex-shrink-0 transition-all duration-300 flex items-center justify-center w-[112px] h-[112px]">
                                        {isValidImage(service.image) ? (
                                            <Image src={service.image} alt={service.name} width={72} height={72} className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 object-contain" />
                                        ) : (
                                            <Settings className="w-14 h-14 text-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl md:text-3xl font-doto2 font-bold text-gray-900 mb-2">
                                            {locale === 'en' ? service.name_en || service.name : service.name_ar || service.name}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed mb-4">
                                            {locale === 'en' ? service.description_en || service.description : service.description_ar || service.description}
                                        </p>
                                        <div className="flex items-baseline justify-center md:justify-start gap-1 pb-4 border-b border-gray-100">
                                            <span className={`text-4xl font-bold font-doto2 ${Number(service.price) === 0 ? 'text-secondary' : 'text-primary'}`}>
                                                {Number(service.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(service.price)}
                                            </span>
                                            {Number(service.price) > 0 && (
                                                <span className="text-base text-gray-500 font-medium">
                                                    {service.currency || (locale === 'ar' ? 'ر.س' : 'SAR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    {service.contents?.map((content: ServiceTypeDto) => (
                                        <div key={content.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 group-hover:border-primary/10 group-hover:bg-white p-3 rounded-xl transition-colors">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-gray-700 text-xs md:text-sm font-medium">
                                                {locale === 'en' ? content.name_en || content.name : content.name_ar || content.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full mt-auto">
                                <a 
                                    href={`/${locale}/subscription`} 
                                    className="flex items-center justify-center w-full py-4 text-lg font-bold rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    <span>{t('subscribeNow')}</span>
                                    {locale === 'ar' ? (
                                        <ArrowLeft className="mx-2 w-5 h-5" />
                                    ) : (
                                        <ArrowRight className="mx-2 w-5 h-5" />
                                    )}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
