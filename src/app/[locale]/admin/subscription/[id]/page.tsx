"use client";
import { useEffect, useState, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getSubscription, updateSubscription, deleteSubscription } from "@/app/store/slices/subscriptionSlice";
import { useTranslations, useLocale } from "next-intl";
import { 
    ArrowLeft, 
    Save, 
    Trash2, 
    Check, 
    X, 
    Upload, 
    FileText, 
    Briefcase, 
    CreditCard, 
    Calendar, 
    Settings, 
    RefreshCcw, 
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Info,
    Search,
    Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FilePreviewModal from "@/components/FilePreviewModal";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export default function SubscriptionFormPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id, locale } = use(params);
    const t = useTranslations('admin.subscriptions');
    const tc = useTranslations('dashboard.common');
    const router = useRouter();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { subscriptionInfo: subscriptions, loading: listLoading } = useSelector((state: RootState) => state.subscription);
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [provisioningResult, setProvisioningResult] = useState<any>(null);
    const [showProvisioningModal, setShowProvisioningModal] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string, type: 'image' | 'pdf' | 'other', name?: string } | null>(null);

    useEffect(() => {
        if (subscriptions.length === 0) {
            dispatch(getSubscription());
        }
    }, [dispatch, subscriptions.length]);

    useEffect(() => {
        const sub = subscriptions.find((s: any) => s.id === parseInt(id));
        if (sub) {
            setSelectedSubscription(sub);
            setFormData(sub);
            setLoading(false);
        } else if (!listLoading && subscriptions.length > 0) {
            // If list is loaded but sub not found
            toast.error(isAr ? "الاشتراك غير موجود" : "Subscription not found");
            router.push(`/${locale}/admin/subscription`);
        }
    }, [id, subscriptions, listLoading]);

    const handlePreviewFile = (url: string, name?: string) => {
        if (!url) return;
        let type: 'image' | 'pdf' | 'other' = 'other';
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/) || lowerUrl.startsWith('data:image/')) {
            type = 'image';
        } else if (lowerUrl.match(/\.pdf($|\?)/) || lowerUrl.startsWith('data:application/pdf')) {
            type = 'pdf';
        }
        setPreviewFile({ url, type, name });
    };

    const performUpdate = async (data: any) => {
        setIsUpdating(true);
        try {
            const payload: any = { ...data };
            if (payload.licenseFile instanceof File) {
                payload.licenseFile = await fileToBase64(payload.licenseFile);
            }
            if (payload.bankReceipt instanceof File) {
                payload.bankReceipt = await fileToBase64(payload.bankReceipt);
            }

            const result = await dispatch(updateSubscription({ id: parseInt(id), data: payload })).unwrap();
            
            if (result.provisioning) {
                setProvisioningResult(result.provisioning);
                setShowProvisioningModal(true);
            }
            
            toast.success(isAr ? result.message_ar : result.message);
            setIsEditing(false);
        } catch (err: any) {
            toast.error(err || t('updateError'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await performUpdate(formData);
    };

    const handleDelete = async () => {
        if (confirm(t('deleteWarning'))) {
            try {
                await dispatch(deleteSubscription(parseInt(id))).unwrap();
                toast.success(t('deleteSuccess'));
                router.push(`/${locale}/admin/subscription`);
            } catch (err: any) {
                toast.error(t('deleteError'));
            }
        }
    };

    const currentIndex = subscriptions.findIndex((s: any) => s.id === parseInt(id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < subscriptions.length - 1;

    const stages = [
        { id: 'DRAFT', label: tc('draft') },
        { id: 'PROGRES', label: tc('inProgress') },
        { id: 'DONE', label: tc('accepted') },
        { id: 'CANCEL', label: tc('rejected') }
    ];

    if (loading || listLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedSubscription) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-80 space-y-4 shrink-0">
                <Link
                    href={`/${locale}/admin/subscription`}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`} />
                    <span className="font-medium">{t("title")}</span>
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-primary" />
                            {t("title")}
                        </h3>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        {subscriptions.map((s: any) => (
                            <Link
                                key={s.id}
                                href={`/${locale}/admin/subscription/${s.id}`}
                                className={`flex flex-col gap-1 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${parseInt(id) === s.id ? "bg-primary/5 text-primary border-s-4 border-s-primary" : "text-gray-600"}`}
                            >
                                <span className="font-bold truncate text-sm">
                                    {s.user?.charityName || s.fullName}
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400">#{s.id}</span>
                                    <Badge className={cn(
                                        "text-[9px] px-1.5 py-0",
                                        s.status === 'DONE' ? "bg-green-100 text-green-700" :
                                        s.status === 'PROGRES' ? "bg-yellow-100 text-yellow-700" :
                                        s.status === 'CANCEL' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                    )}>
                                        {s.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {selectedSubscription.user?.charityName || selectedSubscription.fullName}
                                </h2>
                                <p className="text-gray-500 text-sm">ID: #{id} • {selectedSubscription.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 mr-4 rtl:ml-4 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-gray-200 pr-4 rtl:pl-4 rtl:pr-0">
                                <button
                                    onClick={() => hasPrev && router.push(`/${locale}/admin/subscription/${subscriptions[currentIndex-1].id}`)}
                                    disabled={!hasPrev}
                                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
                                </button>
                                <button
                                    onClick={() => hasNext && router.push(`/${locale}/admin/subscription/${subscriptions[currentIndex+1].id}`)}
                                    disabled={!hasNext}
                                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
                                </button>
                            </div>
                            
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleUpdate}
                                        disabled={isUpdating}
                                        className="px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        <span className="font-bold ms-2">{tc('save')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 rounded-2xl border-gray-200"
                                    >
                                        {tc('cancel')}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Settings className="w-5 h-5" />
                                    <span className="font-bold ms-2">{tc('edit')}</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-12">
                        {/* Status Tracker */}
                        <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                            <div className="flex w-full h-14 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
                                {stages.slice(0, 3).map((step, index) => {
                                    const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                    const statusValue = isEditing ? formData.status : selectedSubscription.status;
                                    const currentIdx = statusOrder.indexOf(statusValue || 'DRAFT');
                                    const isPast = index < currentIdx;
                                    const isActive = statusValue === step.id;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`
                                                relative flex-1 flex items-center justify-center font-bold text-xs md:text-sm transition-all px-4
                                                ${isActive ? 'bg-primary/10 text-primary' :
                                                    isPast && statusValue !== 'CANCEL' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}
                                            `}
                                            style={{
                                                clipPath: index === 0
                                                    ? 'polygon(100% 0, 10% 0, 0 50%, 10% 100%, 100% 100%)'
                                                    : index === 2
                                                        ? 'polygon(100% 0, 92% 50%, 100% 100%, 0 100%, 0 0)'
                                                        : 'polygon(100% 0, 92% 50%, 100% 100%, 8% 100%, 0 50%, 8% 0)',
                                                marginRight: index === 0 ? '0' : '-12px',
                                                zIndex: 3 - index
                                            }}
                                        >
                                            <span>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {isEditing && (
                                <div className="flex gap-2 mt-6">
                                    {(formData.status === 'DONE' || formData.status === 'CANCEL') ? (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'DRAFT' })}
                                            className="px-6 py-2 bg-gray-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            {tc('returnToDraft')}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                                    const curIdx = statusOrder.indexOf(formData.status || 'DRAFT');
                                                    if (curIdx < statusOrder.length - 1) {
                                                        setFormData({ ...formData, status: statusOrder[curIdx + 1] });
                                                    }
                                                }}
                                                className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 text-xs"
                                            >
                                                <Check className="w-4 h-4" />
                                                {tc('approve')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: 'CANCEL' })}
                                                className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 text-xs"
                                            >
                                                <X className="w-4 h-4" />
                                                {tc('reject')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Basic Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2">
                                    <Info className="w-5 h-5" />
                                    <span>{t('basicInfo')}</span>
                                </div>
                                <div className="space-y-4">
                                    <DetailField 
                                        label={tc('fullName')} 
                                        value={formData.fullName} 
                                        isEditing={isEditing} 
                                        onChange={(v) => setFormData({...formData, fullName: v})} 
                                    />
                                    <DetailField 
                                        label={tc('email')} 
                                        value={formData.email} 
                                        isEditing={isEditing} 
                                        onChange={(v) => setFormData({...formData, email: v})} 
                                    />
                                    <DetailField 
                                        label={tc('phone')} 
                                        value={formData.phone} 
                                        isEditing={isEditing} 
                                        onChange={(v) => setFormData({...formData, phone: v})} 
                                    />
                                </div>
                            </div>

                            {/* Domain & Package */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2">
                                    <Briefcase className="w-5 h-5" />
                                    <span>{t('selectedPackage')}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('selectedPackage')}</label>
                                        <div className="text-xl font-black text-gray-900 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                            {isAr ? selectedSubscription.package?.name_ar : selectedSubscription.package?.name_en}
                                        </div>
                                    </div>
                                    <DetailField 
                                        label={tc('domainName')} 
                                        value={formData.domainName} 
                                        isEditing={isEditing} 
                                        onChange={(v) => setFormData({...formData, domainName: v})} 
                                        mono
                                    />
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tc('domainType')}</label>
                                        {isEditing ? (
                                            <select
                                                value={formData.domainType}
                                                onChange={(e) => setFormData({ ...formData, domainType: e.target.value })}
                                                className="w-full rounded-xl border-gray-200 py-3 bg-gray-50 focus:bg-white transition-all text-sm font-bold"
                                            >
                                                <option value="SUBDOMAIN">{tc('subdomain')}</option>
                                                <option value="CUSTOM_DOMAIN">{tc('customDomain')}</option>
                                            </select>
                                        ) : (
                                            <div className="text-lg font-bold text-gray-700">
                                                {selectedSubscription.domainType === 'SUBDOMAIN' ? tc('subdomain') : tc('customDomain')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Legal & Dates */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>{t('dates')}</span>
                                </div>
                                <div className="space-y-4">
                                    <DetailField 
                                        label={tc('charityRegisterNo')} 
                                        value={formData.charityRegisterNo} 
                                        isEditing={isEditing} 
                                        onChange={(v) => setFormData({...formData, charityRegisterNo: v})} 
                                    />
                                    <DetailField 
                                        label={tc('approvalDate')} 
                                        value={formData.approvalDate} 
                                        isEditing={isEditing} 
                                        type="date"
                                        onChange={(v) => setFormData({...formData, approvalDate: v})} 
                                    />
                                    <DetailField 
                                        label={tc('expiryDate')} 
                                        value={formData.expiryDate} 
                                        isEditing={isEditing} 
                                        type="date"
                                        onChange={(v) => setFormData({...formData, expiryDate: v})} 
                                    />
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span>{tc('paymentMethod')}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tc('paymentMethod')}</label>
                                        {isEditing ? (
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="w-full rounded-xl border-gray-200 py-3 bg-gray-50 focus:bg-white transition-all text-sm font-bold"
                                            >
                                                <option value="ONLINE">{tc('online')}</option>
                                                <option value="BANK">{tc('bank')}</option>
                                            </select>
                                        ) : (
                                            <div className="text-lg font-bold text-gray-700">
                                                {selectedSubscription.paymentMethod === 'BANK' ? tc('bank') : tc('online')}
                                            </div>
                                        )}
                                    </div>

                                    {formData.paymentMethod === 'BANK' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tc('bankReceipt')}</label>
                                            <div className="flex items-center gap-4">
                                                {formData.bankReceipt ? (
                                                    <div className="flex-1 flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-sm font-bold text-amber-900 truncate max-w-[150px]">
                                                                {formData.bankReceipt instanceof File ? formData.bankReceipt.name : tc('bankReceipt')}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreviewFile(formData.bankReceipt instanceof File ? URL.createObjectURL(formData.bankReceipt) : formData.bankReceipt, tc('bankReceipt'))}
                                                            className="text-xs font-black text-amber-600 hover:underline"
                                                        >
                                                            {tc('view')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs font-bold">
                                                        {tc('noReceipt')}
                                                    </div>
                                                )}
                                                {isEditing && (
                                                    <label className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer shadow-sm transition-all shrink-0">
                                                        <Upload className="w-5 h-5 text-gray-600" />
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf,.jpg,.jpeg,.png" 
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setFormData({ ...formData, bankReceipt: file });
                                                            }} 
                                                            className="hidden" 
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-red-900 font-bold flex items-center gap-2 text-lg">
                            <Trash2 className="w-5 h-5" />
                            {t('dangerZone')}
                        </h4>
                        <p className="text-red-700 text-sm mt-1">
                            {t('deleteWarning')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-8 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200 active:scale-95"
                    >
                        {tc('delete')}
                    </button>
                </div>
            </div>

            {/* Modals */}
            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ""}
                fileType={previewFile?.type}
                fileName={previewFile?.name}
            />

            {showProvisioningModal && provisioningResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowProvisioningModal(false)} />
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden text-center p-10">
                        <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 ${provisioningResult.success ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                            {provisioningResult.success ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            {provisioningResult.success ? t('provisioningSuccess') : t('provisioningError')}
                        </h3>
                        <p className="text-gray-500 font-medium mb-8">
                            {provisioningResult.success ? t('provisioningSuccessMsg') : provisioningResult.message || t('provisioningErrorMsg')}
                        </p>
                        {provisioningResult.success && provisioningResult.domain && (
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('instanceUrl')}</span>
                                <a href={provisioningResult.domain} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all">
                                    {provisioningResult.domain}
                                </a>
                            </div>
                        )}
                        <Button onClick={() => setShowProvisioningModal(false)} className="w-full py-6 rounded-2xl font-bold text-lg">{t('close')}</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailField({ label, value, isEditing, onChange, mono = false, type = "text" }: { label: string, value: any, isEditing: boolean, onChange: (v: string) => void, mono?: boolean, type?: string }) {
    const displayValue = type === "date" && value ? new Date(value).toISOString().split('T')[0] : value || "—";
    
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            {isEditing ? (
                <Input
                    type={type}
                    value={displayValue === "—" ? "" : displayValue}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "rounded-xl border-gray-200 py-3 bg-gray-50 focus:bg-white transition-all text-sm font-bold",
                        mono && "font-mono text-primary"
                    )}
                />
            ) : (
                <div className={cn(
                    "text-lg font-bold text-gray-700 truncate",
                    mono && "font-mono text-primary"
                )}>
                    {displayValue}
                </div>
            )}
        </div>
    );
}
