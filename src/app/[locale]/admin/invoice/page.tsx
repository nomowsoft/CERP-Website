"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getSubscription } from "@/app/store/slices/subscriptionSlice";
import { useParams } from "next/navigation";
import { generateInvoicePDF } from "@/utils/invoicePdf";

export default function Invoice() {
    const dispatch = useDispatch<any>();
    const { subscriptionInfo: subscriptions, loading } = useSelector((state: any) => state.subscription);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

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

    const filteredInvoices = allInvoices.filter((inv: any) => {
        const matchesSearch =
            inv.subscription.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'DONE' && inv.status === 'SUCCESS') ||
            (statusFilter === 'PROGRES' && inv.status === 'PENDING') ||
            (statusFilter === 'CANCEL' && inv.status === 'FAILED');

        return matchesSearch && matchesStatus;
    });

    const handleDownload = async (invoice: any) => {
        await generateInvoicePDF(
            { id: invoice.invoiceId, date: invoice.formattedDate, amount: invoice.amount },
            invoice.subscription,
            params.locale as string
        );
    };

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={dir}>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Image
                            src="/admin/SVG1.svg"
                            alt="Invoice Icon"
                            width={40}
                            height={40}
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                            {isAr ? "الفواتير" : "Invoices"}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {isAr ? "عرض وإدارة جميع فواتيرك" : "View and manage all your invoices"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="relative md:col-span-6 lg:col-span-7">
                        <Input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 py-6 rounded-2xl ps-12 focus:ring-primary focus:border-primary transition-all"
                            placeholder={isAr ? "البحث برقم الفاتورة، الاسم..." : "Search by invoice #, name..."}
                        />
                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                    </div>
                    <div className="flex gap-2 md:col-span-6 lg:col-span-5 overflow-x-auto pb-2 md:pb-0">
                        <Button
                            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('ALL')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-primary text-white' : ''}`}
                        >
                            {isAr ? "الكل" : "All"}
                        </Button>
                        <Button
                            variant={statusFilter === 'DONE' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('DONE')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'DONE' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 border-green-100'}`}
                        >
                            {isAr ? "مدفوعة" : "Paid"}
                        </Button>
                        <Button
                            variant={statusFilter === 'PROGRES' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('PROGRES')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'PROGRES' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}
                        >
                            {isAr ? "قيد الانتظار" : "Pending"}
                        </Button>
                        <Button
                            variant={statusFilter === 'CANCEL' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('CANCEL')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'CANCEL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border-red-100'}`}
                        >
                            {isAr ? "ملغاة" : "Cancelled"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "رقم الفاتورة" : "Invoice #"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "العميل" : "Client"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "التاريخ" : "Date"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "المبلغ" : "Amount"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "الحالة" : "Status"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "تحميل" : "Download"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="py-5 px-6 text-gray-700 font-medium text-center">{inv.invoiceId}</td>
                                    <td className="py-5 px-6 text-gray-700 text-center">
                                        <div className="font-medium text-gray-900">{inv.subscription.fullName}</div>
                                        <div className="text-sm text-gray-500">{inv.subscription.email}</div>
                                    </td>
                                    <td className="py-5 px-6 text-gray-500 text-center">{inv.formattedDate}</td>
                                    <td className="py-5 px-6 text-gray-700 font-mono text-center">
                                        {Number(inv.amount).toFixed(2)} ر.س.
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                                            ${inv.status === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                                inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-red-100 text-red-600'
                                            }`}>
                                            {inv.status === 'SUCCESS' ? (isAr ? 'مدفوعة' : 'Paid') :
                                                inv.status === 'PENDING' ? (isAr ? 'قيد الانتظار' : 'Pending') : (isAr ? 'ملغاة' : 'Cancelled')}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        {/* <button
                                            onClick={() => handleDownload(inv)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                            title={isAr ? "تحميل PDF" : "Download PDF"}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button> */}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">
                                        {isAr ? "لا توجد فواتير" : "No invoices found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
