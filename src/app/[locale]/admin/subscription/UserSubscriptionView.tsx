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
    Download
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { generateInvoicePDF } from '@/utils/invoicePdf';

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
    if (!subscription) {
        return (
            <div className="max-w-4xl mx-auto p-20 text-center bg-white rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center gap-6" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <CreditCard className="w-12 h-12" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{isAr ? "لا يوجد اشتراك نشط" : "No Active Subscription"}</h3>
                    <p className="text-gray-500">{isAr ? "يبدو أنك لم تشترك في أي باقة بعد." : "It looks like you haven't subscribed to any package yet."}</p>
                </div>
                <Link href={`/${locale}/backages_service`}>
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                        {isAr ? "استكشاف الباقات" : "Explore Packages"}
                    </button>
                </Link>
            </div>
        );
    }

    const packageName = isAr ?
        (subscription.package?.name_ar || subscription.package?.name) :
        (subscription.package?.name_en || subscription.package?.name);

    const features = subscription.package?.features?.map((f: any) =>
        isAr ? (f.text_ar || f.text) : (f.text_en || f.text)
    ) || [];

    const handleDownloadPDF = async (invoice: any) => {
        await generateInvoicePDF(invoice, subscription, locale);
    };

    // Use real payments from subscription
    const invoices = subscription.payments?.map((p: any) => ({
        id: `INV-${p.id.toString().padStart(4, '0')}`,
        date: new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
        amount: Number(p.amount).toFixed(2),
        status: p.status === 'SUCCESS' ? 'PAID' : p.status,
    })) || [];

    const totalPaid = (subscription.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

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

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 lg:px-0" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex flex-col ${isAr ? 'md:flex-row' : 'md:flex-row'} items-center justify-between gap-6 mb-12`}>
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white shadow-sm rounded-xl">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
            {subscription.systems && subscription.systems.length > 0 && (
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
                        <h3 className="text-xl font-bold text-gray-800">{isAr ? "الأنظمة التقنية النشطة" : "Active Technical Systems"}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscription.systems.map((system: any) => (
                            <div key={system.id} className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-blue-100 shadow-sm shrink-0">
                                    {system.icon && typeof system.icon === 'string' && (system.icon.startsWith('http') || system.icon.startsWith('data:image')) ? (
                                        <Image src={system.icon} alt={system.name} width={32} height={32} className="object-contain" />
                                    ) : (
                                        <Check className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">
                                        {isAr ? (system.name_ar || system.name) : (system.name_en || system.name)}
                                    </h4>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        {isAr ? "نشط" : "Active"}
                                    </span>
                                </div>
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
