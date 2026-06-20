"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { getSubscription } from '@/app/store/slices/subscriptionSlice';
import { generateInvoicePDF } from '@/utils/invoicePdf';
import { SaudiRiyalIcon } from '@/components/ui/SaudiRiyalIcon';
import { Skeleton } from '@/components/ui/Skeleton';

export const Invoicing = () => {
    const dispatch = useDispatch<any>();
    const { subscriptionInfo, loading } = useSelector((state: any) => state.subscription);
    const subscriptions = subscriptionInfo?.data || [];

    const params = useParams();
    const isAr = params.locale === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    useEffect(() => {
        dispatch(getSubscription());
    }, [dispatch]);

    // Flatten payments into invoices
    const allInvoices = (subscriptions || []).flatMap((sub: any) =>
        (sub.payments || []).map((p: any) => ({
            ...p,
            subscription: sub,
            invoiceId: `INV-${p.id.toString().padStart(4, '0')}`,
            formattedDate: new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')
        }))
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Show the latest 5 invoices
    const latestInvoices = allInvoices.slice(0, 5);

    const handleDownload = async (invoice: any) => {
        await generateInvoicePDF(
            { id: invoice.invoiceId, date: invoice.formattedDate, amount: invoice.amount },
            invoice.subscription,
            params.locale as string
        );
    };

    return (
        <section className="container mx-auto p-4" dir={dir}>
            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Image
                                src="/admin/SVG1.svg"
                                alt="Invoice Icon"
                                width={32}
                                height={32}
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isAr ? "الفواتير الأخيرة" : "Latest Invoices"}
                        </h2>
                    </div>
                    <div>
                        <Link 
                            href={`/${params.locale}/admin/invoice`}
                            className="hover:bg-primary border border-primary text-primary hover:text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm"
                        >
                            {isAr ? "عرض جميع الفواتير" : "View All"}
                        </Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "رقم الفاتورة" : "Invoice #"}</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "العميل" : "Client"}</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "التاريخ" : "Date"}</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "المبلغ" : "Amount"}</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "الحالة" : "Status"}</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "تحميل" : "Download"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={`skeleton-${index}`} className="animate-pulse">
                                        <td className="py-4 px-6 text-center">
                                            <Skeleton className="h-5 w-20 bg-gray-100 mx-auto rounded-lg" />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Skeleton className="h-5 w-32 bg-gray-100 rounded-lg" />
                                                <Skeleton className="h-3 w-40 bg-gray-100 rounded-lg" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Skeleton className="h-4 w-24 bg-gray-100 mx-auto rounded-lg" />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Skeleton className="h-5 w-16 bg-gray-100 mx-auto rounded-lg" />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Skeleton className="h-6 w-16 bg-gray-100 mx-auto rounded-full" />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Skeleton className="h-8 w-8 bg-gray-100 mx-auto rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <>
                                    {latestInvoices.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="py-4 px-6 text-gray-700 font-medium text-center">{inv.invoiceId}</td>
                                            <td className="py-4 px-6 text-gray-700 text-center">
                                                <div className="font-medium text-gray-900">{inv.subscription.fullName}</div>
                                                <div className="text-xs text-gray-500">{inv.subscription.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 text-center">{inv.formattedDate}</td>
                                            <td className="py-4 px-6 text-gray-700 font-mono text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{Number(inv.amount).toFixed(2)}</span>
                                                    {isAr ? <SaudiRiyalIcon size={12} /> : <span className="text-xs font-bold text-gray-500">SAR</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                                                    ${inv.status === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                                        inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-red-100 text-red-600'
                                                    }`}>
                                                    {inv.status === 'SUCCESS' ? (isAr ? 'مدفوعة' : 'Paid') :
                                                        inv.status === 'PENDING' ? (isAr ? 'انتظار' : 'Pending') : (isAr ? 'ملغاة' : 'Cancelled')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleDownload(inv)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title={isAr ? "تحميل PDF" : "Download PDF"}
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {latestInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                                {isAr ? "لا توجد فواتير" : "No invoices found"}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};
