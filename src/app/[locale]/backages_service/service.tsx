"use client";
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { SaudiRiyalIcon } from '@/components/ui/SaudiRiyalIcon';
import { getServices } from '@/app/store/slices/servicesSlice';
import { useEffect } from 'react';
import { ServiceDTO, ServiceTypeDto } from '@/utils/types';
import { ArrowLeft, ArrowRight, Settings, CheckCircle2, LockKeyhole, LogIn, UserPlus, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { isValidImage } from '@/utils/imageUtils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Service = () => {
    const locale = useLocale();
    const t = useTranslations("programs");
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { userInfo } = useSelector((state: any) => state.user);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
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
                                            {locale === 'en' ? service.name_en : service.name_ar}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed mb-4">
                                            {locale === 'en' ? service.description_en : service.description_ar}
                                        </p>
                                        <div className="flex flex-col items-center md:items-start pb-4 border-b border-gray-100">
                                            <div className="flex flex-nowrap items-baseline justify-center md:justify-start gap-1">
                                                <span className={`text-4xl font-bold font-doto2 ${Number(service.price) === 0 ? 'text-secondary' : 'text-primary'}`}>
                                                    {Number(service.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(service.price)}
                                                </span>
                                                {Number(service.price) > 0 && (
                                                    <span className="text-base text-gray-500 font-medium inline-flex items-center gap-1">
                                                        {locale === 'ar' ? <SaudiRiyalIcon size={14} /> : (service.currency || 'SAR')}
                                                    </span>
                                                )}
                                            </div>
                                            {service.renewalPrice !== undefined && service.renewalPrice !== null && Number(service.renewalPrice) > 0 && (
                                                <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold mt-1">
                                                    <span>{locale === 'ar' ? 'التجديد السنوي:' : 'Annual Renewal:'}</span>
                                                    <span className="font-bold text-primary">{Number(service.renewalPrice)}</span>
                                                    <span>{locale === 'ar' ? <SaudiRiyalIcon size={10} className="inline-block" /> : (service.currency || 'SAR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    {service.contents?.map((content: ServiceTypeDto) => (
                                        <div key={content.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 group-hover:border-primary/10 group-hover:bg-white p-3 rounded-xl transition-colors">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-gray-700 text-xs md:text-sm font-medium">
                                                {locale === 'en' ? content.name_en : content.name_ar}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full mt-auto">
                                <button 
                                    onClick={() => {
                                        if (!userInfo?.id) {
                                            setShowAuthModal(true);
                                        } else {
                                            router.push(`/${locale}/subscription`);
                                        }
                                    }}
                                    className="flex items-center justify-center w-full py-4 text-lg font-bold rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    <span>{t('subscribeNow')}</span>
                                    {locale === 'ar' ? (
                                        <ArrowLeft className="mx-2 w-5 h-5" />
                                    ) : (
                                        <ArrowRight className="mx-2 w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Beautiful, Premium Auth Prompt Modal for Services */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAuthModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-white border border-gray-100 rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] overflow-hidden z-10"
                        >
                            {/* Ambient Background Glows */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-[40px] pointer-events-none"></div>
                            
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 md:p-12 text-center relative z-10 flex flex-col items-center">
                                {/* Premium Lock Icon Container */}
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center mb-6 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <LockKeyhole className="w-9 h-9 text-primary animate-[pulse_2s_infinite]" />
                                </div>
                                
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 font-doto2 mb-4">
                                    {locale === 'ar' ? 'تأكيد الحساب والاشتراك' : 'Confirm Account & Subscription'}
                                </h3>
                                
                                <div className="w-12 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>
                                
                                <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 max-w-md">
                                    {locale === 'ar' 
                                        ? 'يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام طلبك والبدء في تهيئة الخدمات المخصصة لجمعيتكم.'
                                        : 'Please log in or register a new account to complete your order and start configuring the customized services for your organization.'}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <button 
                                        onClick={() => {
                                            setShowAuthModal(false);
                                            router.push(`/${locale}/login?redirect=backages_service`);
                                        }}
                                        className="flex-grow py-4 px-6 bg-gradient-to-l from-primary/95 to-primary text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-[0_12px_24px_rgba(var(--primary-rgb),0.25)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Log In'}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            setShowAuthModal(false);
                                            router.push(`/${locale}/register?redirect=backages_service`);
                                        }}
                                        className="flex-grow py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 hover:text-primary hover:border-primary/50 font-bold text-lg rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        <span>{locale === 'ar' ? 'تسجيل حساب جديد' : 'Register'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
