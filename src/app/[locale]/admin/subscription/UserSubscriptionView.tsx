"use client";
import { useTranslations, useLocale } from 'next-intl';
import {
    CheckCircle2,
    Calendar,
    Globe,
    CreditCard,
    History,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const UserSubscriptionView = ({ subscription }: { subscription: any }) => {
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

    // Mock invoices
    const invoices = [
        { id: "INV-2024-001", date: "2024-01-15", amount: "150.00", status: "PAID" },
        { id: "INV-2024-002", date: "2024-02-15", amount: "150.00", status: "PAID" },
        { id: "INV-2024-003", date: "2024-03-15", amount: "150.00", status: "PAID" },
        { id: "INV-2024-004", date: "2024-04-15", amount: "150.00", status: "PAID" },
    ];

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
                <div className={`flex flex-col ${isAr ? 'items-start' : 'items-end'} space-y-1`}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white shadow-sm rounded-xl">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium px-2">{t('subtitle')}</p>
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
                            <p className="font-bold text-gray-700">{new Date(new Date(subscription.createdAt).setFullYear(new Date(subscription.createdAt).getFullYear() + 1)).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('monthlyAmount')}</p>
                            <p className="font-bold text-gray-700">150.00 ر.س.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('domain')}</p>
                            <p className="font-bold text-primary truncate">{subscription?.domainName || 'alamal.cerp.com'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Package Features Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Check className="w-5 h-5 text-primary" />
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
                        {t('totalPayments')}: <span className="text-primary text-lg">600.00 ر.س.</span>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map((invoice, idx) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
