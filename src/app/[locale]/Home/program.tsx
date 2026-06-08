"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Programs } from "@/utils/types";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { getSubscription } from "@/app/store/slices/subscriptionSlice";
import { getSystems } from "@/app/store/slices/systemsSlice";
import { AppDispatch } from "@/app/store/store";
import { Link } from "@/i18n/navigation";
import { Settings2, CheckCircle2 } from "lucide-react";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";
import { useState, useEffect } from "react";
import axios from "axios";
import { isValidImage } from "@/utils/imageUtils";

// Data is now fetched from the database

export const Program = () => {
    const t = useTranslations('programs');
    const locale = useLocale();
    const dispatch = useDispatch<AppDispatch>();
    const [systems, setSystems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { userInfo } = useSelector((state: any) => state.user);
    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const mySubscription = subscriptionInfo?.data?.find((s: any) => s.userId === userInfo?.id);

    useEffect(() => {
        dispatch(getSubscription());
        const fetchSystems = async () => {
            try {
                const response = await axios.get('/api/systems');
                setSystems(response.data.reverse());
            } catch (error) {
                console.error("Error fetching systems:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSystems();
    }, [dispatch]);

    const isSubscribed = (systemId: number) => {
        if (!mySubscription) return false;
        const isInPackage = mySubscription.package?.systems?.some((s: any) => s.id === systemId);
        const isAddon = mySubscription.systems?.some((s: any) => s.id === systemId);
        return isInPackage || isAddon;
    };

    const handleAddClick = () => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('backages_service')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (systems.length === 0) return null;

    const data = systems;
    const getName = (item: any) => locale === 'ar' ? item.name_ar : item.name_en;
    const getDesc = (item: any) => locale === 'ar' ? item.description_ar : item.description_en;

    return (
        <section className="py-16 lg:py-20 relative overflow-hidden bg-white z-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="mx-auto container px-4 lg:px-20 xl:px-20 2xl:px-0 relative z-10">
                <div className="flex flex-col items-center mb-12 text-center" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary font-bold mb-6 border border-primary/20">
                        <Settings2 className="w-5 h-5 drop-shadow-sm" />
                        <span>{t('systemsTag')}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-doto2 font-bold mb-6 text-gray-900 leading-tight">
                        {t.rich('programsHeading', {
                            highlight: (chunks) => <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">{chunks}</span>
                        })}
                    </h2>
                    
                    <p className="text-xl text-gray-500 mb-8 max-w-3xl leading-relaxed">
                        {t('programsSubHeading')}
                    </p>
                </div>

                {/* Grid of Systems */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {data.map((system, index) => (
                        <div 
                            key={system.id}
                            data-aos="fade-up"
                            data-aos-delay={50 + ((index % 4) * 50)}
                            className="h-full"
                        >
                            <div className="group h-full bg-white rounded-[1.8rem] p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.12)] hover:-translate-y-2 hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="flex flex-col items-center text-center mb-4">
                                        <div className="bg-gray-50/80 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-3 rounded-2xl mb-4 transition-all duration-300 w-16 h-16 flex items-center justify-center">
                                            {isValidImage(system.icon) ? (
                                                <Image
                                                    src={system.icon}
                                                    alt={getName(system)}
                                                    width={36}
                                                    height={36}
                                                    className="group-hover:scale-110 transition-transform duration-500 object-contain"
                                                />
                                            ) : (
                                                <Settings2 className="w-8 h-8 text-primary/50 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <h4 className="font-doto2 font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">
                                            {getName(system)}
                                        </h4>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                            {getDesc(system)}
                                        </p>
                                        
                                        {Number(system.price) > 0 && (
                                            <div className="flex flex-col items-center gap-1 mt-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="font-doto2 font-bold text-2xl text-gray-900">
                                                        {Number(system.price)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">{locale === 'ar' ? <SaudiRiyalIcon size={12} /> : (system.currency || 'SAR')}</span>
                                                </div>
                                                {system.renewalPrice !== undefined && system.renewalPrice !== null && Number(system.renewalPrice) > 0 && (
                                                    <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold">
                                                        <span>{locale === 'ar' ? 'التجديد السنوي:' : 'Annual Renewal:'}</span>
                                                        <span className="font-bold text-primary">{Number(system.renewalPrice)}</span>
                                                        <span>{locale === 'ar' ? <SaudiRiyalIcon size={10} /> : (system.currency || 'SAR')}</span>
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
                                    ) : isSubscribed(system.id) ? (
                                        <div className="w-full py-3 rounded-xl font-bold bg-green-50 text-green-600 flex items-center justify-center gap-2 border border-green-100">
                                            <CheckCircle2 className="w-5 h-5" />
                                            {locale === 'ar' ? 'مشترك بالفعل' : 'Already Subscribed'}
                                        </div>
                                    ) : (
                                        <Link 
                                            href={`/${locale}/backages_service?systemId=${system.id}`} 
                                            onClick={handleAddClick}
                                            className="w-full py-3 rounded-xl font-bold transition-all duration-300 bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center"
                                        >
                                            {locale === 'ar' ? 'إضافة النظام' : 'Add System'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
