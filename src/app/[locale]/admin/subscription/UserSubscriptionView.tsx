"use client";
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
    CheckCircle2,
    Calendar,
    Globe,
    CreditCard,
    History,
    Check,
    TrendingUp,
    Download,
    Inbox
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { generateInvoicePDF } from '@/utils/invoicePdf';
import { getModuleFriendlyName } from '@/utils/moduleMapper';

export const UserSubscriptionView = ({ subscription }: { subscription: any }) => {
    const [nearExpiryDays, setNearExpiryDays] = useState(30);
    const [showRenew, setShowRenew] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const resp = await axios.get('/api/settings');
                if (resp.data.nearExpiryDays) {
                    setNearExpiryDays(parseInt(resp.data.nearExpiryDays));
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const allSystems = useMemo(() => {
        if (!subscription) return [];
        const packageSystems = subscription.package?.systems || [];
        const extraSystems = subscription.systems || [];
        const combined = [...packageSystems, ...extraSystems];
        return combined.filter((sys: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === sys.id)
        );
    }, [subscription]);

    useEffect(() => {
        if (!subscription || !subscription.expiryDate || subscription.status !== 'DONE') {
            setShowRenew(false);
            return;
        }

        const expiry = new Date(subscription.expiryDate);
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + nearExpiryDays);

        setShowRenew(expiry <= threshold);
    }, [subscription, nearExpiryDays]);
    const t = useTranslations('dashboard.subscriptionDetails');
    const ti = useTranslations('dashboard.invoices');
    const tc = useTranslations('dashboard.common');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const packageName = useMemo(() => {
        if (!subscription || !subscription.package) return isAr ? "الباقة الأساسية" : "Basic Package";
        return isAr ?
            (subscription.package.name_ar || subscription.package.name) :
            (subscription.package.name_en || subscription.package.name);
    }, [subscription, isAr]);

    const features = useMemo(() => {
        if (!subscription || !subscription.package?.features) return [];
        return subscription.package.features.map((f: any) =>
            isAr ? (f.text_ar || f.text) : (f.text_en || f.text)
        );
    }, [subscription, isAr]);

    const handleDownloadPDF = async (invoice: any) => {
        if (!subscription) return;
        await generateInvoicePDF(invoice, subscription, locale);
    };

    // Use real payments from subscription
    const invoices = useMemo(() => {
        if (!subscription || !subscription.payments) return [];
        return subscription.payments.map((p: any) => ({
            id: `INV-${p.id.toString().padStart(4, '0')}`,
            date: new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
            amount: Number(p.amount).toFixed(2),
            status: p.status === 'SUCCESS' ? 'PAID' : p.status,
        }));
    }, [subscription, isAr]);

    const totalPaid = useMemo(() => {
        if (!subscription || !subscription.payments) return 0;
        return subscription.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    }, [subscription]);
    const getStatusText = (status: string) => {
        if (status === 'DONE') return t('activeStatus');
        if (status === 'PROGRES') return tc('inProgress');
        if (status === 'DRAFT') return tc('draft');
        if (status === 'CANCEL') return tc('rejected');
        return status;
    };

    const getStatusColor = (status: string) => {
        if (status === 'DONE') return 'bg-green-50 text-green-600 border-green-100';
        if (status === 'PROGRES') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        if (status === 'CANCEL') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-gray-50 text-gray-600 border-gray-100';
    };

    if (!subscription) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 px-4" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <Inbox className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{isAr ? 'لا يوجد اشتراك نشط' : 'No active subscription found'}</h3>
                <p className="text-gray-500 mt-2 max-w-md">{isAr ? 'يبدو أنك لم تشترك في أي باقة بعد، يمكنك استكشاف باقاتنا المتاحة والاشتراك في الأفضل لك.' : 'It seems you haven\'t subscribed to any package yet. You can explore our available packages and subscribe to the one that best fits your needs.'}</p>
                <Link 
                    href={`/${locale}/backages_service`}
                    className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    {isAr ? 'تصفح الباقات' : 'Browse Packages'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 lg:px-0" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex flex-col ${isAr ? 'md:flex-row' : 'md:flex-row'} items-center justify-between gap-6 mb-12`}>
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white shadow-sm rounded-xl">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B1464] to-[#FF4500] bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <p className="text-gray-500 font-medium">{t('subtitle')}</p>
                        {subscription.domainName && (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black dir-ltr">
                                {subscription.domainType === 'SUBDOMAIN' && !subscription.domainName.includes('.') ? `${subscription.domainName}.cerp.sa` : subscription.domainName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Package Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden relative"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="text-3xl font-black text-gray-800">{packageName || (isAr ? "الباقة الأساسية" : "Basic Package")}</h2>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${getStatusColor(subscription.status)}`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${subscription.status === 'DONE' ? 'bg-green-500' : 'bg-current'}`} />
                                {getStatusText(subscription.status)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-3xl">
                        <div className={`${subscription.status === 'DONE' ? 'bg-[#22C55E]' : 'bg-primary'} p-3 rounded-2xl shadow-lg shadow-primary/20`}>
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('startDate')}</p>
                            <p className="font-bold text-gray-700">{new Date(subscription.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('renewalDate')}</p>
                            <p className="font-bold text-gray-700">
                                {subscription.expiryDate
                                    ? new Date(subscription.expiryDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')
                                    : new Date(new Date(subscription.createdAt).setFullYear(new Date(subscription.createdAt).getFullYear() + 1)).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('monthlyAmount')}</p>
                            <p className="font-bold text-gray-700">{subscription.package?.price || '150.00'} ر.س.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('domain')}</p>
                            <p className="font-bold text-primary truncate">
                                {subscription?.domainName ? (subscription.domainType === 'SUBDOMAIN' && !subscription.domainName.includes('.') ? `${subscription.domainName}.cerp.sa` : subscription.domainName) : 'alamal.cerp.sa'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subscription Actions */}
                <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-50">
                    {subscription.status === 'DONE' && (
                        <>
                            {showRenew && (
                                <Link href={`/${locale}/subscription/renew`}>
                                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2">
                                        <History className="w-5 h-5" />
                                        {isAr ? "تجديد الاشتراك" : "Renew Subscription"}
                                    </button>
                                </Link>
                            )}
                            <Link href={`/${locale}/subscription/upgrade`}>
                                <button className="bg-white text-primary border-2 border-primary/20 px-8 py-3 rounded-2xl font-bold hover:bg-primary/5 transition-all flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    {isAr ? "ترقية العضوية" : "Upgrade Membership"}
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Active Services Section */}
            {subscription.services && subscription.services.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{isAr ? "الخدمات الإضافية النشطة" : "Active Additional Services"}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscription.services.map((service: any) => (
                            <div key={service.id} className="p-6 bg-purple-50/30 rounded-3xl border border-purple-100 flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-gray-800 text-lg">
                                        {isAr ? (service.name_ar || service.name) : (service.name_en || service.name)}
                                    </h4>
                                    <span className="bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                        {isAr ? "نشط" : "Active"}
                                    </span>
                                </div>

                                {service.contents && service.contents.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{isAr ? "المميزات المضمنة:" : "Included Features:"}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {service.contents.map((content: any, idx: number) => (
                                                <span key={idx} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-gray-600 border border-purple-100/50 flex items-center gap-1.5 shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3 text-purple-500" />
                                                    {isAr ? (content.name_ar || content.name) : (content.name_en || content.name)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Active Systems Section */}
            {allSystems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{isAr ? "الأنظمة والوحدات المفعلة" : "Active Systems & Modules"}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {allSystems.map((system: any) => (
                            <div key={system.id} className="group h-full bg-white rounded-[1.8rem] p-5 border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(var(--primary-rgb),0.1)] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="flex flex-col items-center text-center mb-4">
                                        <div className="w-16 h-16 flex items-center justify-center bg-gray-50 group-hover:bg-primary/5 rounded-2xl border border-gray-100 group-hover:border-primary/20 mb-4 transition-all duration-300 shadow-sm">
                                            {system.icon && typeof system.icon === 'string' && (system.icon.startsWith('http') || system.icon.startsWith('data:image')) ? (
                                                <Image src={system.icon} alt={system.name} width={36} height={36} className="object-contain group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Check className="w-8 h-8 text-primary/50 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                                {isAr ? (system.name_ar || system.name) : (system.name_en || system.name)}
                                            </h4>
                                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {isAr ? "نظام مفعل" : "Active System"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {system.modules && Array.isArray(system.modules) && system.modules.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-gray-50 mt-4">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {system.modules.map((mod: string, mIdx: number) => (
                                                <span 
                                                    key={mIdx}
                                                    className="bg-gray-50 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-500 border border-gray-100 flex items-center gap-1 group-hover:bg-white group-hover:border-primary/20 transition-colors"
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                    {getModuleFriendlyName(mod, locale)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Package Features Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{t('packageFeatures')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-primary/10">
                            <span className="font-bold text-gray-600 group-hover:text-gray-900">{feature}</span>
                            <div className="w-6 h-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Invoice History Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100"
            >
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <History className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{t('invoiceHistory')}</h3>
                    </div>
                    <div className="text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl">
                        {t('totalPayments')}: <span className="text-primary text-lg">{totalPaid.toFixed(2)} ر.س.</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-sm font-bold border-b border-gray-50">
                                <th className="py-4 text-start px-2 whitespace-nowrap">{ti('invoiceNumber')}</th>
                                <th className="py-4 text-start px-2 whitespace-nowrap">{ti('date')}</th>
                                <th className="py-4 text-start px-2 whitespace-nowrap">{ti('amount')}</th>
                                <th className="py-4 text-start px-2 whitespace-nowrap">{ti('status')}</th>
                                <th className="py-4 text-center px-2 whitespace-nowrap">{isAr ? "تحميل" : "Download"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map((invoice: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-gray-50/5 transition-colors">
                                    <td className="py-6 px-2 font-bold text-gray-700">{invoice.id}</td>
                                    <td className="py-6 px-2 font-medium text-gray-500">{invoice.date}</td>
                                    <td className="py-6 px-2 font-bold text-gray-700">{invoice.amount} ر.س.</td>
                                    <td className="py-6 px-2">
                                        <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold border border-green-100 flex items-center w-fit gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            {ti('paid')}
                                        </span>
                                    </td>
                                    <td className="py-6 px-2 text-center">
                                        <button
                                            onClick={() => handleDownloadPDF(invoice)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                            title={isAr ? "تحميل PDF" : "Download PDF"}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
