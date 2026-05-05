"use client";
import { Plus as PlusIcon, FileText, Settings2, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPackages } from '@/app/store/slices/packagesSlice';
import { getSystems } from '@/app/store/slices/systemsSlice';
import { useEffect, useState } from 'react';
import { PackageDTO, PackageFeturesDto, SystemDTO } from '@/utils/types';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, ArrowRight, ArrowLeft, Settings2, FileText } from 'lucide-react';

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
    const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
    const [selectedSystems, setSelectedSystems] = useState<number[]>([]);

    const toggleSystem = (id: number) => {
        setSelectedSystems(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleCheckout = () => {
        const params = new URLSearchParams();
        if (selectedPkg) params.append('packageId', selectedPkg.toString());
        selectedSystems.forEach(id => params.append('systemId', id.toString()));
        router.push(`/${locale}/subscription?${params.toString()}`);
    };

    // Filter systems to show only those NOT in the current package or already activated
    const filteredSystems = allSystems.filter((system: any) => {
        if (!mySubscription) return true;
        const isInPackage = mySubscription.package?.systems?.some((s: any) => s.id === system.id);
        const isActivated = mySubscription.systems?.some((s: any) => s.id === system.id);
        return !isInPackage && !isActivated;
    });

    const totalSystemsPrice = allSystems
        .filter((s: any) => selectedSystems.includes(s.id))
        .reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);

    const totalPrice = (selectedPkg ? Number(Packeges.find((p: any) => p.id === selectedPkg)?.price || 0) : 0) + totalSystemsPrice;

    return (
        <section className="container md:mx-auto relative z-20 pb-16 lg:pb-24 -mt-32" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-10 lg:mx-0 mx-4">
                {Packeges.map((packege: PackageDTO, index: number) => (
                    <div 
                        key={packege.id} 
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className="h-full"
                    >
                        <div className={`group h-full bg-white rounded-[2.5rem] p-8 md:p-10 border shadow-lg hover:shadow-[0_20px_40px_rgb(var(--primary-rgb),0.12)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${index === 1 ? 'border-primary/50 shadow-[0_10px_40px_rgb(var(--primary-rgb),0.15)] md:-translate-y-4 hover:-translate-y-6' : 'border-gray-100 hover:-translate-y-2 hover:border-primary/30'}`}>
                            {index === 1 && <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-secondary to-primary"></div>}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex-1">
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

                                <div className="flex justify-center items-end gap-1.5 mb-8 pb-8 border-b border-gray-100">
                                    <span className={`font-doto2 font-bold leading-none ${Number(packege.price) === 0 ? 'text-5xl text-primary' : 'text-5xl text-gray-900'}`}>
                                        {Number(packege.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(packege.price)}
                                    </span>
                                    {Number(packege.price) > 0 && <span className="text-lg text-gray-500 font-medium mb-1">{packege.currency || (locale === 'ar' ? 'ر.س' : 'SAR')}</span>}
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full mt-auto space-y-3 pt-4">
                                <button 
                                    onClick={() => setSelectedPkg(packege.id)}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${selectedPkg === packege.id ? 'bg-secondary text-white shadow-lg' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                >
                                    {selectedPkg === packege.id ? (
                                        <><Check className="w-5 h-5" /> {locale === 'ar' ? "تم الاختيار" : "Selected"}</>
                                    ) : (
                                        <>{locale === 'ar' ? "اختيار الباقة" : "Select Package"}</>
                                    )}
                                </button>
                                <a href={`/${locale}/contact-us`} className="flex items-center justify-center w-full py-3 text-gray-500 hover:text-primary font-medium transition-colors">
                                    {tHeader('contact')}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSystems.length > 0 && (
                <div className="mt-24 space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto px-4" data-aos="fade-up">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 font-doto2">
                            {locale === 'ar' ? 'أنظمة تقنية متخصصة' : 'Specialized Technical Systems'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 lg:mx-0 mx-4">
                        {filteredSystems.map((system: any, index: number) => (
                            <div key={system.id} data-aos="fade-up" data-aos-delay={index * 100} className="h-full">
                                <div className={`group h-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-lg transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${selectedSystems.includes(system.id) ? 'border-secondary' : 'hover:border-primary/30'}`}>
                                    <div className="relative z-10 flex-1">
                                        <div className="flex flex-col items-center text-center mb-6">
                                            <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl mb-6 transition-all duration-300 w-24 h-24 flex items-center justify-center">
                                                {system.icon ? (
                                                    <Image src={system.icon} alt="" width={48} height={48} className="group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <Settings2 className="w-12 h-12 text-primary/50" />
                                                )}
                                            </div>
                                            <h3 className="font-doto2 font-bold text-2xl text-gray-900 mb-2">{locale === 'en' ? system.name_en || system.name : system.name_ar || system.name}</h3>
                                            <p className="text-gray-500 leading-relaxed line-clamp-3">{locale === 'en' ? system.description_en || system.description : system.description_ar || system.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 w-full mt-auto pt-4">
                                        <button 
                                            onClick={() => toggleSystem(system.id)}
                                            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${selectedSystems.includes(system.id) ? 'bg-secondary text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                        >
                                            {selectedSystems.includes(system.id) ? (locale === 'ar' ? 'تمت الإضافة' : 'Added') : (locale === 'ar' ? 'إضافة النظام' : 'Add System')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <AnimatePresence>
                {(selectedPkg || selectedSystems.length > 0) && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><ShoppingCart className="w-6 h-6" /></div>
                                <div className="text-start">
                                    <h4 className="text-white font-bold">{selectedPkg ? (locale === 'ar' ? "باقة + " : "Package + ") : ""}{selectedSystems.length} {locale === 'ar' ? "أنظمة" : "Systems"}</h4>
                                    <p className="text-white/60 text-sm">{locale === 'ar' ? "الإجمالي:" : "Total:"} <span className="text-secondary font-bold mx-1">{totalPrice} {locale === 'ar' ? "ر.س" : "SAR"}</span></p>
                                </div>
                            </div>
                            <button onClick={handleCheckout} className="w-full md:w-auto px-8 py-4 bg-secondary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                                {locale === 'ar' ? "إتمام الطلب" : "Checkout Now"}
                                <ArrowRight className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
