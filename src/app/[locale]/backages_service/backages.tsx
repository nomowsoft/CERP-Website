"use client";
import { Plus as PlusIcon, FileText, Settings2, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPackages } from '@/app/store/slices/packagesSlice';
import { getSystems } from '@/app/store/slices/systemsSlice';
import { useEffect, useState } from 'react';
import { PackageDTO, PackageFeturesDto } from '@/utils/types';
import { useTranslations, useLocale } from 'next-intl';

export const Backages = () => {
    const locale = useLocale();
    const t = useTranslations("programs");
    const tHeader = useTranslations("header");
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        dispatch(getPackages());
        dispatch(getSystems());
    }, [dispatch]);

    const Packeges = useSelector((state: any) => state.packages.packages);
    const allSystems = useSelector((state: any) => state.systems.systems);
    const { userInfo } = useSelector((state: any) => state.user);
    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const mySubscription = subscriptionInfo?.find((s: any) => s.userId === userInfo?.id);
    const [selectedSystem, setSelectedSystem] = useState<any>(null);

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
                                    {packege.image ? (
                                        <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl mb-6 transition-all duration-300">
                                            <Image src={packege.image} alt="" width={80} height={80} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl mb-6 transition-all duration-300 flex items-center justify-center w-[80px] h-[80px]">
                                            <ShieldCheck className="w-10 h-10 text-primary/50" />
                                        </div>
                                    )}
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

                                {/* Systems List */}
                                <div className="mb-10 text-start">
                                    <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                                        {locale === 'en' ? 'Included Systems' : 'الأنظمة المشمولة'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {packege.systems?.map((system: any) => (
                                            <div 
                                                key={system.id} 
                                                onMouseEnter={() => setSelectedSystem(system)}
                                                onMouseLeave={() => setSelectedSystem(null)}
                                                className="group/system relative flex items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                                            >
                                                {system.icon && typeof system.icon === 'string' && (system.icon.startsWith('http') || system.icon.startsWith('data:image')) ? (
                                                    <Image src={system.icon} alt={system.name} width={24} height={24} className="w-6 h-6 object-contain" />
                                                ) : (
                                                    <div className="w-6 h-6 flex items-center justify-center text-primary font-bold text-xs bg-white rounded-md shadow-sm border border-gray-100">
                                                        {(locale === 'en' ? system.name_en || system.name : system.name_ar || system.name).charAt(0)}
                                                    </div>
                                                )}
                                                
                                                <span className="ms-2 text-sm font-medium text-gray-700 group-hover/system:text-primary transition-colors">
                                                    {locale === 'en' ? system.name_en || system.name : system.name_ar || system.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

            {/* Technical Systems Section */}
            <div className="mt-24 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto px-4" data-aos="fade-up">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 font-doto2">
                        {locale === 'ar' ? 'أنظمة تقنية متخصصة' : 'Specialized Technical Systems'}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        {locale === 'ar' 
                            ? 'يمكنك إضافة أنظمة مستقلة لتوسيع قدرات منصتك حسب احتياجاتك الخاصة' 
                            : 'You can add independent systems to expand your platform capabilities according to your specific needs'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 lg:mx-0 mx-4">
                    {allSystems.map((system: any, index: number) => (
                        <div 
                            key={system.id} 
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            className="h-full"
                        >
                            <div className="group h-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-lg hover:shadow-[0_20px_40px_rgb(var(--primary-rgb),0.12)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between hover:-translate-y-2 hover:border-primary/30">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl mb-6 transition-all duration-300 w-24 h-24 flex items-center justify-center">
                                            {system.icon && typeof system.icon === 'string' && (system.icon.startsWith('http') || system.icon.startsWith('data:image')) ? (
                                                <Image src={system.icon} alt={system.name} width={64} height={64} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-sm object-contain" />
                                            ) : (
                                                <Settings2 className="w-12 h-12 text-primary/50" />
                                            )}
                                        </div>
                                        <h3 className="font-doto2 font-bold text-2xl text-gray-900 mb-2">
                                            {locale === 'en' ? system.name_en || system.name : system.name_ar || system.name}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed line-clamp-3">
                                            {locale === 'en' ? system.description_en || system.description : system.description_ar || system.description}
                                        </p>
                                    </div>

                                    <div className="flex justify-center items-end gap-1.5 mb-8 pb-8 border-b border-gray-100">
                                        <span className={`font-doto2 font-bold leading-none ${Number(system.price) === 0 ? 'text-4xl text-primary' : 'text-4xl text-gray-900'}`}>
                                            {Number(system.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(system.price)}
                                        </span>
                                        {Number(system.price) > 0 && (
                                            <span className="text-lg text-gray-500 font-medium mb-1">
                                                {locale === 'ar' ? 'ر.س' : 'SAR'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="relative z-10 w-full mt-auto pt-4">
                                    <a 
                                        href={mySubscription ? `/${locale}/subscription/add-system?systemId=${system.id}` : `/${locale}/subscription?systemId=${system.id}`} 
                                        className="flex items-center justify-center w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 bg-primary/10 text-primary hover:bg-primary hover:text-white"
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
            </div>
            
            {/* Premium Hover Modal */}
            <div 
                className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 pointer-events-none ${selectedSystem ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Glassmorphism Backdrop */}
                <div className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-500 ${selectedSystem ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {/* Modal Content */}
                <div 
                    className={`relative w-full max-w-lg transform transition-all duration-500 ease-out ${selectedSystem ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                    {/* Glowing effect behind modal */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[2.5rem] blur-xl opacity-40 transition-opacity duration-500"></div>
                    
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white/50 p-8 overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                        
                        {selectedSystem && (
                            <>
                                <div className="flex items-center gap-5 mb-6 relative z-10">
                                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 shrink-0 shadow-inner">
                                        {selectedSystem.icon && selectedSystem.icon.startsWith('http') ? (
                                            <Image src={selectedSystem.icon} alt={selectedSystem.name} width={36} height={36} className="object-contain drop-shadow-sm" />
                                        ) : (
                                            <span className="text-2xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                                                {(locale === 'en' ? selectedSystem.name_en || selectedSystem.name : selectedSystem.name_ar || selectedSystem.name).charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            {locale === 'en' ? selectedSystem.name_en || selectedSystem.name : selectedSystem.name_ar || selectedSystem.name}
                                        </h3>
                                        <div className="text-xs font-bold text-primary/80 mt-1.5 uppercase tracking-widest">
                                            {locale === 'en' ? 'System Details' : 'تفاصيل النظام'}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 p-5 rounded-2xl bg-gray-50/80 border border-gray-100/80 text-gray-600 leading-relaxed text-[15px] font-medium shadow-inner backdrop-blur-sm">
                                    <p>
                                        {locale === 'en' ? selectedSystem.description_en || selectedSystem.description : selectedSystem.description_ar || selectedSystem.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
