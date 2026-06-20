"use client";
import { 
    Settings2, 
    ShieldCheck, 
    ArrowRight, 
    X,
    ShoppingCart,
    Check,
    Info,
    LockKeyhole,
    LogIn,
    UserPlus,
    ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { SaudiRiyalIcon } from '@/components/ui/SaudiRiyalIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getPackages } from '@/app/store/slices/packagesSlice';
import { getSystems } from '@/app/store/slices/systemsSlice';
import { getSubscription } from '@/app/store/slices/subscriptionSlice';
import { useEffect, useState } from 'react';
import { PackageDTO } from '@/utils/types';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidImage } from '@/utils/imageUtils';
import { Skeleton } from '@/components/ui/Skeleton';

export const Backages = () => {
    const locale = useLocale();
    const t = useTranslations("programs");
    const tHeader = useTranslations("header");
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    useEffect(() => {
        const systemId = searchParams.get('systemId');
        if (systemId) {
            setSelectedSystems(prev => {
                const id = Number(systemId);
                return prev.includes(id) ? prev : [...prev, id];
            });
        }
    }, [searchParams]);
    
    useEffect(() => {
        dispatch(getPackages());
        dispatch(getSystems());
        dispatch(getSubscription());
    }, [dispatch]);

    const Packeges = useSelector((state: any) => state.packages.packages);
    const loadingPackages = useSelector((state: any) => state.packages.loading);
    const allSystems = useSelector((state: any) => state.systems.systems);
    const loadingSystems = useSelector((state: any) => state.systems.loading);
    const { userInfo } = useSelector((state: any) => state.user);
    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const mySubscription = subscriptionInfo?.data?.find((s: any) => s.userId === userInfo?.id);
    const [selectedSystem, setSelectedSystem] = useState<any>(null);
    const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
    const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
    const [selectedSystems, setSelectedSystems] = useState<number[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const showPackagesSkeleton = !mounted || loadingPackages;
    const showSystemsSkeleton = !mounted || loadingSystems;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('pending_subscription_selection');
            if (saved && userInfo?.id) {
                try {
                    const { selectedPkg: savedPkg, selectedSystems: savedSystems } = JSON.parse(saved);
                    if (savedPkg) setSelectedPkg(savedPkg);
                    if (savedSystems && savedSystems.length > 0) setSelectedSystems(savedSystems);
                    sessionStorage.removeItem('pending_subscription_selection');
                } catch (e) {
                    console.error("Failed to restore pending subscription selection", e);
                }
            }
        }
    }, [userInfo]);

    const toggleSystem = (id: number) => {
        if (!userInfo?.id) {
            if (typeof window !== 'undefined') {
                const selection = {
                    selectedPkg,
                    selectedSystems: selectedSystems.includes(id)
                        ? selectedSystems.filter(sId => sId !== id)
                        : [...selectedSystems, id]
                };
                sessionStorage.setItem('pending_subscription_selection', JSON.stringify(selection));
            }
            setShowAuthModal(true);
            return;
        }
        setSelectedSystems(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleSelectPkg = (packageId: number) => {
        if (!userInfo?.id) {
            if (typeof window !== 'undefined') {
                const selection = {
                    selectedPkg: packageId,
                    selectedSystems
                };
                sessionStorage.setItem('pending_subscription_selection', JSON.stringify(selection));
            }
            setShowAuthModal(true);
            return;
        }
        setSelectedPkg(packageId);
    };

    const handleCheckout = () => {
        if (!userInfo?.id) {
            if (typeof window !== 'undefined') {
                const selection = {
                    selectedPkg,
                    selectedSystems
                };
                sessionStorage.setItem('pending_subscription_selection', JSON.stringify(selection));
            }
            setShowAuthModal(true);
            return;
        }
        const params = new URLSearchParams();
        if (selectedPkg) params.append('packageId', selectedPkg.toString());
        selectedSystems.forEach(id => params.append('systemId', id.toString()));
        if (mySubscription?.id) params.append('subscriptionId', mySubscription.id.toString());
        router.push(`/${locale}/subscription?${params.toString()}`);
    };

    // Get the systems included in the newly selected package
    const selectedPkgData = selectedPkg ? Packeges.find((p: any) => p.id === selectedPkg) : null;
    const selectedPkgSystemsIds = selectedPkgData?.systems?.map((s: any) => s.id) || [];

    // Filter systems to show only those NOT in the current package OR selected package
    const filteredSystems = allSystems.filter((system: any) => {
        // Hide if in current subscription (package or add-ons)
        if (mySubscription) {
            const isInCurrentPackage = mySubscription.package?.systems?.some((s: any) => s.id === system.id);
            const isActivatedAsAddon = mySubscription.systems?.some((s: any) => s.id === system.id);
            if (isInCurrentPackage || isActivatedAsAddon) return false;
        }
        
        // Hide if in the newly selected package
        if (selectedPkgSystemsIds.includes(system.id)) return false;

        return true;
    });

    // Automatically remove systems from selection if they are now in the selected package
    useEffect(() => {
        if (selectedPkgSystemsIds.length > 0) {
            setSelectedSystems(prev => prev.filter(id => !selectedPkgSystemsIds.includes(id)));
        }
    }, [selectedPkg]);

    const totalSystemsPrice = allSystems
        .filter((s: any) => selectedSystems.includes(s.id))
        .reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);

    const totalPrice = (selectedPkgData ? Number(selectedPkgData.price || 0) : 0) + totalSystemsPrice;

    return (
        <section className="container md:mx-auto relative z-20 pb-16 lg:pb-24 -mt-32" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 lg:mx-0 mx-4">
                {showPackagesSkeleton ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div 
                            key={index} 
                            className="h-full w-full md:w-[340px] lg:w-[360px] animate-pulse"
                        >
                            <div className="h-full bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-lg flex flex-col justify-between min-h-[500px]">
                                <div className="space-y-6 flex-1">
                                    <div className="flex flex-col items-center">
                                        <Skeleton variant="rectangular" className="w-16 h-16 rounded-2xl mb-4 bg-gray-200" />
                                        <Skeleton variant="text" className="w-24 h-6 mb-3 bg-gray-200" />
                                        <Skeleton variant="text" className="w-40 h-8 mb-2 bg-gray-200" />
                                        <Skeleton variant="text" className="w-full h-4 mb-1 bg-gray-200" />
                                        <Skeleton variant="text" className="w-5/6 h-4 bg-gray-200" />
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <Skeleton variant="text" className="w-24 h-4 bg-gray-200" />
                                        <Skeleton variant="rectangular" className="w-full h-10 rounded-xl bg-gray-200" />
                                        <Skeleton variant="rectangular" className="w-full h-10 rounded-xl bg-gray-200" />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                                    <Skeleton variant="text" className="w-20 h-8 mb-4 bg-gray-200" />
                                    <Skeleton variant="rectangular" className="w-full h-12 rounded-xl bg-gray-200" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    Packeges.map((packege: PackageDTO, index: number) => (
                        <div 
                            key={packege.id} 
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            className="h-full w-full md:w-[340px] lg:w-[360px]"
                        >
                            <div className={`group h-full bg-white rounded-[2rem] p-6 md:p-8 border shadow-lg hover:shadow-[0_20px_40px_rgb(var(--primary-rgb),0.12)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${index === 1 ? 'border-primary/50 shadow-[0_10px_40px_rgb(var(--primary-rgb),0.15)] md:-translate-y-4 hover:-translate-y-6' : 'border-gray-100 hover:-translate-y-2 hover:border-primary/30'}`}>
                                {index === 1 && <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-secondary to-primary"></div>}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="flex flex-col items-center text-center mb-4">
                                        {isValidImage(packege.image) ? (
                                            <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-4 rounded-2xl mb-4 transition-all duration-300">
                                                <Image src={packege.image} alt="" width={64} height={64} className="group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-4 rounded-2xl mb-4 transition-all duration-300 flex items-center justify-center w-[64px] h-[64px]">
                                                <ShieldCheck className="w-8 h-8 text-primary/50" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-lg ${index === 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                                                {packege.type}
                                            </span>
                                            {mySubscription?.packageId === packege.id && (
                                                <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-600 animate-pulse">
                                                    {locale === 'ar' ? "باقتك الحالية" : "Current Package"}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-doto2 font-bold text-2xl text-gray-900 mb-1">
                                            {locale === 'en' ? packege.name_en : packege.name_ar}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed min-h-[2.5rem] line-clamp-2">
                                            {locale === 'en' ? packege.description_en : packege.description_ar}
                                        </p>

                                        {packege.systems && packege.systems.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-gray-100/60 w-full">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-start px-1">
                                                    {locale === 'ar' ? 'الأنظمة المشمولة:' : 'Included Systems:'}
                                                </p>
                                                <div className="max-h-[178px] overflow-y-auto custom-scrollbar flex flex-col gap-2 px-1 py-0.5">
                                                    {packege.systems.map((system: any) => {
                                                        const fullSystem = allSystems?.find((s: any) => s.id === system.id) || system;
                                                        const systemKey = `${packege.id}-${system.id}`;
                                                        const isExpanded = expandedSystemId === systemKey;
                                                        return (
                                                            <div 
                                                                key={system.id} 
                                                                className={`group/system flex flex-col border border-gray-100 hover:border-primary/20 bg-gray-50/50 hover:bg-primary/[0.01] rounded-xl transition-all duration-300 p-2.5 cursor-pointer ${isExpanded ? 'border-primary/20 bg-primary/[0.01]' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedSystemId(isExpanded ? null : systemKey);
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 group-hover/system:border-primary/20 flex items-center justify-center p-1.5 transition-all duration-300 shrink-0">
                                                                            {isValidImage(system.icon) ? (
                                                                                <Image src={system.icon} alt="" width={20} height={20} className="object-contain transition-transform group-hover/system:scale-110" />
                                                                            ) : (
                                                                                <Settings2 className="w-4 h-4 text-gray-300 group-hover/system:text-primary/40" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs font-bold text-gray-700 group-hover/system:text-primary transition-colors text-start">
                                                                            {locale === 'ar' ? system.name_ar : system.name_en}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronDown className={`w-4 h-4 text-gray-400 group-hover/system:text-primary transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                                                                </div>
                                                                <AnimatePresence initial={false}>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <p className="text-[10px] md:text-[11px] text-gray-500 mt-2 text-justify leading-relaxed border-t border-gray-100/60 pt-2 px-1">
                                                                                {locale === 'ar' ? (fullSystem.description_ar || system.description_ar) : (fullSystem.description_en || system.description_en)}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-center mb-6 pb-6 border-b border-gray-100 flex flex-col items-center justify-center">
                                        <div className="whitespace-nowrap">
                                            <span className={`font-doto2 font-bold align-middle ${Number(packege.price) === 0 ? 'text-4xl text-primary' : 'text-4xl text-gray-900'}`}>
                                                {Number(packege.price) === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : Number(packege.price)}
                                            </span>
                                            {Number(packege.price) > 0 && (
                                                <span className="text-sm text-gray-500 font-medium align-middle inline-block mx-1">
                                                    {locale === 'ar' ? <SaudiRiyalIcon size={16} className="inline-block" /> : (packege.currency || 'SAR')}
                                                </span>
                                            )}
                                        </div>
                                        {packege.renewalPrice !== undefined && packege.renewalPrice !== null && Number(packege.renewalPrice) > 0 && (
                                            <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold mt-1">
                                                <span>{locale === 'ar' ? 'التجديد السنوي:' : 'Annual Renewal:'}</span>
                                                <span className="font-bold text-primary">{Number(packege.renewalPrice)}</span>
                                                <span>{locale === 'ar' ? <SaudiRiyalIcon size={10} className="inline-block" /> : (packege.currency || 'SAR')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="relative z-10 w-full mt-auto space-y-2 pt-2">
                                    <button 
                                        onClick={() => handleSelectPkg(packege.id)}
                                        className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${selectedPkg === packege.id ? 'bg-secondary text-white shadow-lg' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                    >
                                        {selectedPkg === packege.id ? (
                                            <><Check className="w-4 h-4" /> {locale === 'ar' ? "تم الاختيار" : "Selected"}</>
                                        ) : (
                                            <>{locale === 'ar' ? "اختيار الباقة" : "Select Package"}</>
                                        )}
                                    </button>
                                    <a href={`/${locale}/contact-us`} className="flex items-center justify-center w-full py-2 text-sm text-gray-500 hover:text-primary font-medium transition-colors">
                                        {tHeader('contact')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {(showSystemsSkeleton || filteredSystems.length > 0) && (
                <div className="mt-24 space-y-12">
                    <div className="flex flex-col items-center mb-12 text-center" data-aos="fade-up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary font-bold mb-6 border border-primary/20">
                            <Settings2 className="w-5 h-5 drop-shadow-sm" />
                            <span>{locale === 'ar' ? 'الأنظمة' : 'Systems'}</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 font-doto2 leading-tight mb-4">
                            {locale === 'ar' ? (
                                <>يحتوي نظام <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">سرب</span> على الأنظمة التالية</>
                            ) : (
                                <>The <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">Sarb</span> System includes the following systems</>
                            )}
                        </h2>
                        
                        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            {locale === 'ar' 
                                ? 'منظومة متكاملة من الأنظمة لتغطية جميع احتياجات المؤسسة' 
                                : 'An integrated ecosystem of systems to cover all organization needs'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 lg:mx-0 mx-4">
                        {showSystemsSkeleton ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-full animate-pulse">
                                    <div className="h-full bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg flex flex-col justify-between min-h-[280px]">
                                        <div className="flex flex-col items-center text-center mb-4 space-y-4">
                                            <Skeleton variant="rectangular" className="w-20 h-20 rounded-2xl bg-gray-100" />
                                            <Skeleton variant="text" className="w-32 h-6 bg-gray-100" />
                                            <Skeleton variant="text" className="w-full h-4 bg-gray-100" />
                                            <Skeleton variant="text" className="w-4/5 h-4 bg-gray-100" />
                                        </div>
                                        <div className="w-full mt-auto pt-2">
                                            <Skeleton variant="rectangular" className="w-full h-11 rounded-xl bg-gray-100" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredSystems.map((system: any, index: number) => (
                                <div key={system.id} data-aos="fade-up" data-aos-delay={index * 100} className="h-full">
                                    <div className={`group h-full bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${selectedSystems.includes(system.id) ? 'border-secondary' : 'hover:border-primary/30'}`}>
                                        <button 
                                            onClick={() => setSelectedSystem(system)}
                                            className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all duration-300 z-20"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                        <div className="relative z-10 flex-1">
                                            <div className="flex flex-col items-center text-center mb-4">
                                                <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-4 rounded-2xl mb-4 transition-all duration-300 w-20 h-20 flex items-center justify-center">
                                                    {isValidImage(system.icon) ? (
                                                        <Image src={system.icon} alt="" width={40} height={40} className="group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Settings2 className="w-10 h-10 text-primary/50" />
                                                    )}
                                                </div>
                                                <h3 className="font-doto2 font-bold text-xl text-gray-900 mb-1">{locale === 'en' ? system.name_en : system.name_ar}</h3>
                                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{locale === 'en' ? system.description_en : system.description_ar}</p>
                                                
                                                {Number(system.price) > 0 && (
                                                    <div className="text-center mt-4 flex flex-col items-center justify-center">
                                                        <div className="whitespace-nowrap">
                                                            <span className="font-doto2 font-bold text-2xl text-gray-900 align-middle">
                                                                {Number(system.price)}
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-medium align-middle inline-block mx-1">
                                                                {locale === 'ar' ? <SaudiRiyalIcon size={14} className="inline-block" /> : (system.currency || 'SAR')}
                                                            </span>
                                                        </div>
                                                        {system.renewalPrice !== undefined && system.renewalPrice !== null && Number(system.renewalPrice) > 0 && (
                                                            <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold mt-1">
                                                                <span>{locale === 'ar' ? 'التجديد السنوي:' : 'Annual Renewal:'}</span>
                                                                <span className="font-bold text-primary">{Number(system.renewalPrice)}</span>
                                                                <span>{locale === 'ar' ? <SaudiRiyalIcon size={10} className="inline-block" /> : (system.currency || 'SAR')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="relative z-10 w-full mt-auto pt-2">
                                            {Number(system.price) === 0 ? (
                                                <a 
                                                    href={`/${locale}/contact-us`}
                                                    className="w-full py-3 rounded-xl font-bold transition-all duration-300 bg-primary text-white hover:bg-primary/95 flex items-center justify-center"
                                                >
                                                    {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={() => toggleSystem(system.id)}
                                                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${selectedSystems.includes(system.id) ? 'bg-secondary text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                                >
                                                    {selectedSystems.includes(system.id) ? (locale === 'ar' ? 'تمت الإضافة' : 'Added') : (locale === 'ar' ? 'إضافة النظام' : 'Add System')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
                                    <p className="text-white/60 text-sm">{locale === 'ar' ? "الإجمالي:" : "Total:"} <span className="text-secondary font-bold mx-1 inline-flex items-center gap-1">{totalPrice} {locale === 'ar' ? <SaudiRiyalIcon size={12} /> : "SAR"}</span></p>
                                </div>
                            </div>
                            <button onClick={handleCheckout} className="w-full md:w-auto px-8 py-4 bg-secondary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                                {locale === 'ar' ? "إتمام الطلب" : "Checkout Now"}
                                <ArrowRight className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* System Description Modal */}
            <AnimatePresence>
                {selectedSystem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSystem(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <button 
                                onClick={() => setSelectedSystem(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="p-8 md:p-12">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                                        {isValidImage(selectedSystem.icon) ? (
                                            <Image src={selectedSystem.icon} alt="" width={60} height={60} className="object-contain" />
                                        ) : (
                                            <Settings2 className="w-12 h-12 text-primary/40" />
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 font-doto2 mb-4">
                                        {locale === 'ar' ? selectedSystem.name_ar : selectedSystem.name_en}
                                    </h3>
                                    <div className="w-12 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full mb-8"></div>
                                    <p className="text-lg text-gray-600 leading-relaxed text-justify" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                        {locale === 'ar' ? selectedSystem.description_ar : selectedSystem.description_en}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="px-8 py-6 bg-gray-50 flex justify-center">
                                <button 
                                    onClick={() => setSelectedSystem(null)}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    {locale === 'ar' ? 'إغلاق' : 'Close'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Beautiful, Premium Auth Prompt Modal */}
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
                                        ? 'يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام طلبك والبدء في تهيئة الأنظمة المخصصة لجمعيتكم.'
                                        : 'Please log in or register a new account to complete your order and start configuring the customized systems for your organization.'}
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
