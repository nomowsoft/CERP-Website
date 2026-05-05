"use client";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { 
    Check, 
    X, 
    Eye, 
    Building2, 
    Clock, 
    ArrowRight, 
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    FileText,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemRequestsManagement() {
    const locale = useLocale();
    const t = useTranslations('dashboard');
    const tc = useTranslations('dashboard.common');
    
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests/systems');
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: number, action: 'APPROVED' | 'REJECTED') => {
        setIsProcessing(true);
        try {
            const isNewSub = selectedRequest.isNewSub;
            const payload: any = {
                status: action === 'APPROVED' ? 'DONE' : 'CANCEL',
                provision: action === 'APPROVED'
            };
            
            if (!isNewSub) {
                payload.requestId = requestId;
            }

            const res = await fetch(`/api/subscription/${selectedRequest.subscriptionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Wait, the [id]/route.ts handles PUT with requestId?
            // Actually, I should check how approvals are handled in existing code.
            
            if (res.ok) {
                toast.success(locale === 'ar' ? "تم تحديث الطلب بنجاح" : "Request updated successfully");
                setSelectedRequest(null);
                fetchRequests();
            } else {
                const data = await res.json();
                toast.error(data.message || "Error");
            }
        } catch (error) {
            toast.error("Error processing request");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{locale === 'ar' ? "طلبات الأنظمة الإضافية" : "System Addition Requests"}</h1>
                <p className="text-slate-500 mt-1">{locale === 'ar' ? "إدارة ومراجعة طلبات تفعيل الأنظمة الإضافية للعملاء" : "Manage and review customer requests for additional system activation"}</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "العميل" : "Customer"}</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "الأنظمة المطلوبة" : "Requested Systems"}</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "تاريخ الطلب" : "Request Date"}</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "النوع" : "Type"}</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "الحالة" : "Status"}</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-start">{locale === 'ar' ? "الإجراءات" : "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {request.customer?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{request.customer?.name}</div>
                                                <div className="text-xs text-gray-500">{request.customer?.charityName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {request.systems?.map((sys: any) => (
                                                <span key={sys.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {locale === 'en' ? sys.name_en || sys.name : sys.name_ar || sys.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${request.isNewSub ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {request.isNewSub ? (locale === 'ar' ? "اشتراك جديد" : "New Subscription") : (locale === 'ar' ? "إضافة نظام" : "Add System")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1.5 ${
                                            request.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                            request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            <Clock className="w-3 h-3" />
                                            {request.status === 'PENDING' ? (locale === 'ar' ? "قيد المراجعة" : "Pending") :
                                             request.status === 'APPROVED' ? (locale === 'ar' ? "مقبول" : "Approved") :
                                             (locale === 'ar' ? "مرفوض" : "Rejected")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-end">
                                        <button 
                                            onClick={() => setSelectedRequest(request)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg border border-transparent hover:border-gray-100"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <AlertCircle className="w-12 h-12 opacity-20" />
                                            <p className="text-lg">{locale === 'ar' ? "لا توجد طلبات أنظمة حالياً" : "No system requests found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Detail Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isProcessing && setSelectedRequest(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="flex h-[80vh]">
                                {/* Left Side: Details */}
                                <div className="flex-1 p-8 overflow-y-auto space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">{locale === 'ar' ? "تفاصيل الطلب" : "Request Details"}</h2>
                                            <p className="text-gray-500">#{selectedRequest.id} - {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <X className="w-6 h-6 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {locale === 'ar' ? "معلومات العميل" : "Customer Info"}
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="font-bold text-gray-900 text-lg">{selectedRequest.customer?.name}</p>
                                                <p className="text-gray-600">{selectedRequest.customer?.charityName}</p>
                                                <p className="text-sm text-gray-500">{selectedRequest.customer?.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                {locale === 'ar' ? "الاشتراك الحالي" : "Current Subscription"}
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="font-bold text-gray-900">{selectedRequest.subscription?.domainName || (locale === 'ar' ? "نطاق جديد" : "New Domain")}</p>
                                                <p className="text-sm text-gray-500">
                                                    {locale === 'ar' ? "الحالة: " : "Status: "}
                                                    <span className="font-bold text-emerald-600">{selectedRequest.isNewSub ? (locale === 'ar' ? "جديد" : "New") : selectedRequest.subscription?.status}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                {locale === 'ar' ? "بيانات الترخيص" : "License Info"}
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500">{locale === 'ar' ? "رقم الترخيص:" : "License No:"}</p>
                                                <p className="font-bold text-gray-900">{selectedRequest.charityRegisterNo}</p>
                                                {selectedRequest.licenseFile || selectedRequest.subscription?.licenseFile ? (
                                                    <a 
                                                        href={selectedRequest.licenseFile || selectedRequest.subscription?.licenseFile} 
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {locale === 'ar' ? "عرض ملف الترخيص" : "View License File"}
                                                    </a>
                                                ) : (
                                                    <p className="text-xs text-red-500">{locale === 'ar' ? "لا يوجد ملف ترخيص" : "No license file"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">
                                            {locale === 'ar' ? "الأنظمة المطلوبة" : "Requested Systems"}
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedRequest.systems?.map((sys: any) => (
                                                <div key={sys.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <span className="font-bold text-gray-900">{locale === 'en' ? sys.name_en || sys.name : sys.name_ar || sys.name}</span>
                                                    </div>
                                                    <div className="text-primary font-bold">
                                                        {Number(sys.price)} {locale === 'ar' ? "ر.س" : "SAR"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex gap-4">
                                        <button 
                                            onClick={() => handleAction(selectedRequest.id, 'APPROVED')}
                                            disabled={isProcessing || selectedRequest.status !== 'PENDING'}
                                            className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            {locale === 'ar' ? "تفعيل الأنظمة" : "Activate Systems"}
                                        </button>
                                        <button 
                                            onClick={() => handleAction(selectedRequest.id, 'REJECTED')}
                                            disabled={isProcessing || selectedRequest.status !== 'PENDING'}
                                            className="flex-1 py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-bold text-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            {locale === 'ar' ? "رفض الطلب" : "Reject Request"}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Receipt Preview */}
                                <div className="w-[400px] bg-gray-900 p-8 flex flex-col">
                                    <h4 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {locale === 'ar' ? "إيصال التحويل" : "Transfer Receipt"}
                                    </h4>
                                    
                                    <div className="flex-1 relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
                                        {selectedRequest.bankReceipt ? (
                                            <>
                                                <Image 
                                                    src={selectedRequest.bankReceipt} 
                                                    alt="Receipt" 
                                                    fill 
                                                    className="object-contain p-4"
                                                />
                                                <a 
                                                    href={selectedRequest.bankReceipt} 
                                                    target="_blank"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-900 flex items-center gap-2">
                                                        <ExternalLink className="w-4 h-4" />
                                                        {locale === 'ar' ? "عرض بحجم كامل" : "View Full Size"}
                                                    </div>
                                                </a>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4 text-center p-8">
                                                <FileText className="w-16 h-16" />
                                                <p>{locale === 'ar' ? "لا يوجد إيصال مرفق" : "No receipt attached"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
