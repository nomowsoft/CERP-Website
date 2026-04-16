"use client";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPackages } from '@/app/store/slices/packagesSlice';
import { useEffect } from 'react';
import { PackageDTO, PackageFeturesDto } from '@/utils/types';
import { useTranslations, useLocale } from 'next-intl';

export const Backages = () => {
    const locale = useLocale();
    const t = useTranslations("programs");
    const tHeader = useTranslations("header");
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        dispatch(getPackages());
    }, [dispatch]);

    const Packeges = useSelector((state: any) => state.packages.packages);

    return (
        <section className="container md:mx-auto relative z-20 pb-16 lg:pb-24 -mt-32" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 lg:mx-0 mx-4">
                {Packeges.map((packege: PackageDTO, index: number) => (
                    <div 
                        key={packege.id} 
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className="h-full"
                    >
                        <div className={`group h-full bg-white rounded-[2.5rem] p-8 md:p-10 border shadow-lg hover:shadow-[0_20px_40px_rgb(var(--primary-rgb),0.12)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${index === 1 ? 'border-primary/50 shadow-[0_10px_40px_rgb(var(--primary-rgb),0.15)] md:-translate-y-4 hover:-translate-y-6' : 'border-gray-100 hover:-translate-y-2 hover:border-primary/30'}`}>
                            {/* Highlight Popular Package Ribbon */}
                            {index === 1 && (
                                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-secondary to-primary"></div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex-1">
                                {/* Icon & Title */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl mb-6 transition-all duration-300">
                                        <Image src={packege.image} alt="" width={80} height={80} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                    </div>
                                    <span className={`inline-block px-3 py-1 text-sm font-bold rounded-lg mb-4 ${index === 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                                        {packege.type}
                                    </span>
                                    <h3 className="font-doto2 font-bold text-3xl text-gray-900 mb-2">
                                        {locale === 'en' ? packege.name_en || packege.name : packege.name_ar || packege.name}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed min-h-[3rem]">
                                        {locale === 'en' ? packege.description_en || packege.description : packege.description_ar || packege.description}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="flex justify-center items-end gap-1.5 mb-8 pb-8 border-b border-gray-100">
                                    <span className={`font-doto2 font-bold leading-none ${Number(packege.price) === 0 ? 'text-5xl text-primary' : 'text-5xl text-gray-900'}`}>
                                        {Number(packege.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(packege.price)}
                                    </span>
                                    {Number(packege.price) > 0 && (
                                        <span className="text-lg text-gray-500 font-medium mb-1">
                                            {packege.currency || (locale === 'ar' ? 'ر.س' : 'SAR')}
                                        </span>
                                    )}
                                </div>

                                {/* Features List */}
                                <ul className="space-y-4 mb-10 text-start">
                                    {packege.features?.map((feature: PackageFeturesDto) => (
                                        <li key={feature.id} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-gray-600 leading-relaxed text-[15px]">
                                                {locale === 'en' ? feature.text_en || feature.text : feature.text_ar || feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Call to Actions */}
                            <div className="relative z-10 w-full mt-auto space-y-3 pt-4">
                                <a 
                                    href={`/${locale}/subscription?packageId=${packege.id}`} 
                                    className={`flex items-center justify-center w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${index === 1 ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-[0_8px_30px_rgb(var(--primary-rgb),0.3)] hover:scale-[1.02]' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                >
                                    <span>{t('subscribeNow')}</span>
                                    {locale === 'ar' ? (
                                        <ArrowLeft className="mx-2 w-5 h-5" />
                                    ) : (
                                        <ArrowRight className="mx-2 w-5 h-5" />
                                    )}
                                </a>
                                <a 
                                    href={`/${locale}/contact-us`} 
                                    className="flex items-center justify-center w-full py-3 text-gray-500 hover:text-primary font-medium transition-colors"
                                >
                                    {tHeader('contact')}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
