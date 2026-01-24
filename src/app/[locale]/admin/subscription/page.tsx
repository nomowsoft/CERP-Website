"use client";
import Image from "next/image";
import { SubscriptionDTO } from "@/utils/types";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState } from 'react';
import { getSubscription, deleteSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Eye, Search, X, Check, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

export default function Subscription() {
    const t = useTranslations('dashboard');
    const dispatch = useDispatch<AppDispatch>();
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDTO | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const params = useParams();
    const isAr = params.locale === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    useEffect(() => {
        dispatch(getSubscription());
    }, [dispatch]);

    const subscriptions = useSelector((state: any) => state.subscription.subscriptionInfo);

    const filteredSubscriptions = subscriptions.filter((item: SubscriptionDTO) => {
        const matchesSearch =
            item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.domainName && item.domainName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleShowDetails = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setFormData(item);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = (id: any) => {
        setSubscriptionToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (subscriptionToDelete) {
            try {
                await dispatch(deleteSubscription(subscriptionToDelete)).unwrap();
                toast.success("تم حذف الإشتراك بنجاح");
                handleCloseModal();
            } catch (err: any) {
                toast.error(err || "فشل حذف الإشتراك");
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(updateSubscription({ id: selectedSubscription?.id as number, data: formData })).unwrap();
            toast.success("تم تحديث الإشتراك بنجاح");
            handleCloseModal();
        } catch (err: any) {
            toast.error(err || "فشل تحديث الإشتراك");
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (selectedSubscription) {
            try {
                await dispatch(updateSubscription({ id: selectedSubscription.id, data: { ...selectedSubscription, status: newStatus } })).unwrap();
                toast.success("تم تحديث الحالة بنجاح");
                dispatch(getSubscription()); // Refresh data
                handleCloseModal();
            } catch (err: any) {
                toast.error(err || "فشل تحديث الحالة");
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowDeleteModal(false);
        setSelectedSubscription(null);
        setSubscriptionToDelete(null);
        setIsEditing(false);
    };

    const stages = [
        { id: 'DRAFT', label: 'مسودة' },
        { id: 'PROGRES', label: 'تحت التنفيذ' },
        { id: 'DONE', label: 'مقبول' },
        { id: 'CANCEL', label: 'مرفوض' }
    ];

    return (

        <section className="container mx-auto p-4 lg:p-8" dir={dir}>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Image
                            src="/admin/SVG1.svg"
                            alt="Subscription Icon"
                            width={40}
                            height={40}
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                            {isAr ? "الإشتراكات" : "Subscriptions"}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {isAr ? "عرض وإدارة جميع طلبات الإشتراك في النظام" : "View and manage all subscription requests in the system"}
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
                            placeholder={isAr ? "البحث بالاسم أو البريد أو الدومين..." : "Search by name, email or domain..."}
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
                            variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('DRAFT')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'DRAFT' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                        >
                            {isAr ? "مسودة" : "Draft"}
                        </Button>
                        <Button
                            variant={statusFilter === 'PROGRES' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('PROGRES')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'PROGRES' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}
                        >
                            {isAr ? "تحت التنفيذ" : "In Progress"}
                        </Button>
                        <Button
                            variant={statusFilter === 'DONE' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('DONE')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'DONE' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 border-green-100'}`}
                        >
                            {isAr ? "مقبول" : "Accepted"}
                        </Button>
                        <Button
                            variant={statusFilter === 'CANCEL' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('CANCEL')}
                            className={`rounded-xl px-6 py-2 whitespace-nowrap ${statusFilter === 'CANCEL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border-red-100'}`}
                        >
                            {isAr ? "مرفوض" : "Rejected"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "الأسم" : "Name"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "البريد الإلكتروني" : "Email"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "تاريخ الإنشاء" : "Created At"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "اسم الدومين" : "Domain"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "الحالة" : "Status"}</th>
                                <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSubscriptions.map((item: SubscriptionDTO) => (
                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="py-5 px-6 text-gray-700 font-medium">{item.fullName}</td>
                                    <td className="py-5 px-6 text-gray-500">{item.email}</td>
                                    <td className="py-5 px-6 text-gray-400 text-sm">{new Date(item.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</td>
                                    <td className="py-5 px-6">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-mono">
                                            {item.domainName}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'DRAFT' ? 'bg-blue-100 text-blue-600' :
                                            item.status === 'PROGRES' ? 'bg-yellow-100 text-yellow-600' :
                                                item.status === 'DONE' ? 'bg-green-100 text-green-600' :
                                                    'bg-red-100 text-red-600'
                                            }`}>
                                            {item.status === 'DRAFT' ? (isAr ? 'مسودة' : 'Draft') :
                                                item.status === 'PROGRES' ? (isAr ? 'تحت التنفيذ' : 'In Progress') :
                                                    item.status === 'DONE' ? (isAr ? 'مقبول' : 'Accepted') : (isAr ? 'مرفوض' : 'Rejected')}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleShowDetails(item)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title={isAr ? "عرض" : "View"}
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title={isAr ? "تعديل" : "Edit"}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title={isAr ? "حذف" : "Delete"}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedSubscription && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl relative z-10 animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {isEditing ? 'تعديل بيانات الإشتراك' : 'تفاصيل الإشتراك'}
                            </h3>
                            <button
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                                onClick={handleCloseModal}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <label className="text-sm font-bold text-gray-700 block mb-4">{isAr ? "تحديث حالة الإشتراك" : "Update Subscription Status"}</label>

                                    <div className="flex flex-col lg:flex-row items-stretch gap-4">
                                        {/* Action Buttons on the Right (in RTL) */}
                                        <div className="flex gap-2 shrink-0">
                                            {(formData.status === 'DONE' || formData.status === 'CANCEL') ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: 'DRAFT' })}
                                                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 text-sm"
                                                >
                                                    <RotateCcw className="w-5 h-5" />
                                                    <span>{t('common.returnToDraft')}</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                                            const currentIndex = statusOrder.indexOf(formData.status || 'DRAFT');
                                                            if (currentIndex < statusOrder.length - 1) {
                                                                setFormData({ ...formData, status: statusOrder[currentIndex + 1] });
                                                            }
                                                        }}
                                                        className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                        <span>{isAr ? "موافق" : "Approve"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, status: 'CANCEL' })}
                                                        className="px-8 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <X className="w-5 h-5" />
                                                        <span>{isAr ? "رفض" : "Reject"}</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Stages on the Left (in RTL) */}
                                        <div className="flex grow h-12 overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm">
                                            {stages.slice(0, 3).map((step, index) => {
                                                const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                                const currentIndex = statusOrder.indexOf(formData.status || 'DRAFT');
                                                const isPast = index < currentIndex;
                                                const isActive = formData.status === step.id;

                                                const stepLabels: Record<string, string> = {
                                                    'DRAFT': isAr ? 'مسودة' : 'Draft',
                                                    'PROGRES': isAr ? 'تحت التنفيذ' : 'In Progress',
                                                    'DONE': isAr ? 'مقبول' : 'Accepted'
                                                };

                                                return (
                                                    <div
                                                        key={step.id}
                                                        className={`
                                                            relative flex-1 flex items-center justify-center font-bold text-xs md:text-sm transition-all px-4
                                                            ${isActive ? 'bg-[#EEF2FF] text-[#4F46E5]' :
                                                                isPast && formData.status !== 'CANCEL' ? 'bg-[#F0FDFA] text-[#0D9488]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}
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
                                                        <span className="relative z-10">{stepLabels[step.id] || step.label}</span>
                                                        {isActive && (
                                                            <div className="absolute inset-0 border-2 border-[#4F46E5]/50 pointer-events-none" style={{ clipPath: 'inherit' }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {formData.status === 'CANCEL' && (
                                                <div
                                                    className="relative flex-1 flex items-center justify-center font-bold text-sm bg-red-100 text-red-600"
                                                    style={{
                                                        clipPath: 'polygon(100% 0, 92% 50%, 100% 100%, 0 100%, 0 0)',
                                                        marginRight: '-12px',
                                                        zIndex: 0
                                                    }}
                                                >
                                                    {isAr ? "مرفوض" : "Rejected"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "الاسم الكامل" : "Full Name"}</label>
                                        <Input
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "رقم الهاتف" : "Phone"}</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "اسم الدومين" : "Domain Name"}</label>
                                        <Input
                                            value={formData.domainName}
                                            onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "رقم تسجيل الجمعية" : "Charity Register No"}</label>
                                        <Input
                                            value={formData.charityRegisterNo}
                                            onChange={(e) => setFormData({ ...formData, charityRegisterNo: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "ملف الترخيص (رابط)" : "License File (Link)"}</label>
                                        <Input
                                            value={formData.licenseFile}
                                            onChange={(e) => setFormData({ ...formData, licenseFile: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "نوع الدومين" : "Domain Type"}</label>
                                        <select
                                            value={formData.domainType}
                                            onChange={(e) => setFormData({ ...formData, domainType: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:ring-primary h-10"
                                        >
                                            <option value="SUBDOMAIN">{isAr ? "فرعي (Subdomain)" : "Subdomain"}</option>
                                            <option value="CUSTOM_DOMAIN">{isAr ? "مخصص (Custom Domain)" : "Custom Domain"}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "طريقة الدفع" : "Payment Method"}</label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:ring-primary h-10"
                                        >
                                            <option value="ONLINE">{isAr ? "أونلاين" : "Online"}</option>
                                            <option value="BANK">{isAr ? "تحويل بنكي" : "Bank Transfer"}</option>
                                        </select>
                                    </div>
                                    {formData.paymentMethod === 'BANK' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 ms-1">{isAr ? "إيصال البنك (رابط)" : "Bank Receipt (Link)"}</label>
                                            <Input
                                                value={formData.bankReceipt}
                                                onChange={(e) => setFormData({ ...formData, bankReceipt: e.target.value })}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button type="submit" className="flex-1 rounded-xl py-6 bg-primary hover:bg-primary/90">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
                                    <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 rounded-xl py-6">{isAr ? "إلغاء" : "Cancel"}</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-10">
                                {/* Chevron Stepper - Visualization Only */}
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex w-full h-12 overflow-hidden rounded-xl bg-white border border-gray-100">
                                        {stages.slice(0, 3).map((step, index) => {
                                            const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                            const currentIndex = statusOrder.indexOf(selectedSubscription.status || 'DRAFT');
                                            const isPast = index < currentIndex;
                                            const isActive = selectedSubscription.status === step.id;

                                            const stepLabels: Record<string, string> = {
                                                'DRAFT': isAr ? 'مسودة' : 'Draft',
                                                'PROGRES': isAr ? 'تحت التنفيذ' : 'In Progress',
                                                'DONE': isAr ? 'مقبول' : 'Accepted'
                                            };

                                            return (
                                                <div
                                                    key={step.id}
                                                    className={`
                                                        relative flex-1 flex items-center justify-center font-bold text-xs md:text-sm transition-all px-4
                                                        ${isActive ? 'bg-[#EEF2FF] text-[#4F46E5]' :
                                                            isPast && selectedSubscription.status !== 'CANCEL' ? 'bg-[#F0FDFA] text-[#0D9488]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}
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
                                                    <span className="relative z-10">{stepLabels[step.id] || step.label}</span>
                                                    {isActive && (
                                                        <div className="absolute inset-0 border-2 border-[#4F46E5]/50 pointer-events-none" style={{ clipPath: 'inherit' }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {selectedSubscription.status === 'CANCEL' && (
                                            <div
                                                className="relative flex-1 flex items-center justify-center font-bold text-sm bg-red-100 text-red-600"
                                                style={{
                                                    clipPath: 'polygon(100% 0, 92% 50%, 100% 100%, 0 100%, 0 0)',
                                                    marginRight: '-12px',
                                                    zIndex: 0
                                                }}
                                            >
                                                {isAr ? "مرفوض" : "Rejected"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12 px-2">
                                    <div className="space-y-1.5 border-s-4 border-primary/20 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "الاسم الكامل" : "Full Name"}</span>
                                        <span className="font-extrabold text-gray-800 text-lg block">{selectedSubscription.fullName}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                                        <span className="font-bold text-gray-700 text-base block break-all">{selectedSubscription.email}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "رقم الهاتف" : "Phone"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.phone}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-primary/20 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "اسم الدومين" : "Domain Name"}</span>
                                        <span className="font-black text-primary font-mono text-lg block">{selectedSubscription.domainName}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "نوع الدومين" : "Domain Type"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.domainType === 'SUBDOMAIN' ? (isAr ? 'فرعي' : 'Subdomain') : (isAr ? 'مخصص' : 'Custom')}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "تاريخ الإشتراك" : "Subscription Date"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{new Date(selectedSubscription.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "رقم تسجيل الجمعية" : "Charity Register No"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.charityRegisterNo || (isAr ? 'غير متوفر' : 'N/A')}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "ملف الترخيص" : "License File"}</span>
                                        {selectedSubscription.licenseFile ? (
                                            <a href={selectedSubscription.licenseFile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-sm block">{isAr ? "عرض الملف" : "View File"}</a>
                                        ) : (
                                            <span className="text-gray-400 text-sm block">{isAr ? "لا يوجد ملف" : "No File"}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.paymentMethod === 'BANK' ? (isAr ? 'تحويل بنكي' : 'Bank Transfer') : (isAr ? 'أونلاين' : 'Online')}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "صاحب البطاقة" : "Card Holder"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.cardHolderName || (isAr ? 'غير متوفر' : 'N/A')}</span>
                                    </div>
                                    <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "تاريخ انتهاء البطاقة" : "Card Expiry"}</span>
                                        <span className="font-bold text-gray-700 text-base block">{selectedSubscription.cardExpiryDate || (isAr ? 'غير متوفر' : 'N/A')}</span>
                                    </div>
                                    {selectedSubscription.paymentMethod === 'BANK' && (
                                        <div className="space-y-1.5 border-s-4 border-gray-100 ps-4">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isAr ? "إيصال البنك" : "Bank Receipt"}</span>
                                            {selectedSubscription.bankReceipt ? (
                                                <a href={selectedSubscription.bankReceipt} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-sm block">{isAr ? "عرض الإيصال" : "View Receipt"}</a>
                                            ) : (
                                                <span className="text-gray-400 text-sm block">{isAr ? "لا يوجد إيصال" : "No Receipt"}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</h3>
                        <p className="text-gray-500 mb-8">{isAr ? "هل أنت متأكد من رغبتك في حذف هذا الإشتراك؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this subscription? This action cannot be undone."}</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl py-6 bg-red-600 hover:bg-red-700"
                            >
                                {isAr ? "نعم، حذف" : "Yes, Delete"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                className="flex-1 rounded-xl py-6"
                            >
                                {isAr ? "إلغاء" : "Cancel"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
