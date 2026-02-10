"use client";
import Image from "next/image";
import { SubscriptionDTO } from "@/utils/types";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState } from 'react';
import { getSubscription, deleteSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Eye, Search, X, Check, RotateCcw, Upload, FileText, Briefcase, Image as ImageIcon, CreditCard, Calendar, Settings } from "lucide-react";
import axios from 'axios';
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { UserSubscriptionView } from "./UserSubscriptionView";
import FilePreviewModal from "@/components/FilePreviewModal";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

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
    const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'RENEWAL_REQUESTS' | 'UPGRADE_REQUESTS' | 'SETTINGS'>('SUBSCRIPTIONS');
    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = async () => {
        try {
            const resp = await axios.get('/api/subscription-requests');
            setRequests(resp.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const [settings, setSettings] = useState<any>({});
    const [isSavingSetting, setIsSavingSetting] = useState(false);

    const fetchSettings = async () => {
        try {
            const resp = await axios.get('/api/settings');
            setSettings(resp.data);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'RENEWAL_REQUESTS' || activeTab === 'UPGRADE_REQUESTS') fetchRequests();
        if (activeTab === 'SETTINGS') fetchSettings();
    }, [activeTab]);

    const handleSaveSetting = async (key: string, value: any) => {
        setIsSavingSetting(true);
        try {
            await axios.post('/api/settings', { key, value });
            toast.success(isAr ? "تم حفظ الإعداد بنجاح" : "Setting saved successfully");
            fetchSettings();
        } catch (err: any) {
            console.error("Failed to save setting", err);
            const data = err.response?.data;
            const fullMsg = data ? `${data.message}: ${data.error || ''}` : err.message;
            toast.error(isAr ? `فشل حفظ الإعداد: ${fullMsg}` : `Failed to save setting: ${fullMsg}`);
            if (data?.stack) console.error("Server Stack:", data.stack);
        } finally {
            setIsSavingSetting(false);
        }
    };


    console.log(formData)

    // File Preview State
    const [previewFile, setPreviewFile] = useState<{ url: string, type: 'image' | 'pdf' | 'other', name?: string } | null>(null);

    const handlePreviewFile = (url: string, name?: string) => {
        if (!url) return;

        let type: 'image' | 'pdf' | 'other' = 'other';
        const lowerUrl = url.toLowerCase();

        if (lowerUrl.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/) || lowerUrl.startsWith('data:image/')) {
            type = 'image';
        } else if (lowerUrl.match(/\.pdf($|\?)/) || lowerUrl.startsWith('data:application/pdf')) {
            type = 'pdf';
        }

        setPreviewFile({
            url,
            type,
            name
        });
    };

    const params = useParams();
    const isAr = params.locale === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    useEffect(() => {
        dispatch(getSubscription());
    }, [dispatch]);

    const { subscriptionInfo: subscriptions, loading } = useSelector((state: any) => state.subscription);

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
            // Prepare payload (convert Files to Base64 strings)
            const payload: any = { ...formData };
            if (payload.licenseFile instanceof File) {
                payload.licenseFile = await fileToBase64(payload.licenseFile);
            }
            // Check if bankReceipt is a File object (new upload) or keep existing string
            if (payload.bankReceipt instanceof File) {
                payload.bankReceipt = await fileToBase64(payload.bankReceipt);
            }

            await dispatch(updateSubscription({ id: selectedSubscription?.id as number, data: payload })).unwrap();
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

    const { userInfo } = useSelector((state: any) => state.user);
    const isAdmin = userInfo?.role === 'ADMIN';

    if (!isAdmin) {
        if (loading) {
            return (
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }
        const userSubscription = subscriptions?.find((s: any) => s.userId === userInfo?.id);
        return (
            <section className="container mx-auto p-4 lg:p-8" dir={dir}>
                <UserSubscriptionView subscription={userSubscription} />
            </section>
        );
    }

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

            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('SUBSCRIPTIONS')}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'SUBSCRIPTIONS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                    {isAr ? "جميع الاشتراكات" : "All Subscriptions"}
                </button>
                <button
                    onClick={() => setActiveTab('RENEWAL_REQUESTS')}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'RENEWAL_REQUESTS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                    {isAr ? "طلبات التجديد" : "Renewal Requests"}
                </button>
                <button
                    onClick={() => setActiveTab('UPGRADE_REQUESTS')}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'UPGRADE_REQUESTS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                    {isAr ? "طلبات الترقية" : "Upgrade Requests"}
                </button>
                <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                    <Settings className="w-5 h-5 inline-block mr-2" />
                    {isAr ? "إعدادات الإشتراك" : "Subscription Settings"}
                </button>
            </div>

            {activeTab === 'SUBSCRIPTIONS' ? (
                <>
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
                </>
            ) : activeTab === 'SETTINGS' ? (
                <div className="max-w-2xl bg-white shadow-xl shadow-gray-100 border border-gray-100 rounded-[2.5rem] p-8 lg:p-12">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{isAr ? "إعدادات فترة التجديد" : "Renewal Period Settings"}</h3>
                            <p className="text-gray-500">{isAr ? "تحكم في المدة الزمنية التي يظهر فيها زر التجديد للمشتركين" : "Control the time window when the renewal button appears for subscribers"}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold">{isAr ? "عدد الأيام قبل الانتهاء (لظهور زر التجديد):" : "Days before expiry (to show renewal button):"}</label>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    value={settings.nearExpiryDays || 30}
                                    onChange={(e) => setSettings({ ...settings, nearExpiryDays: e.target.value })}
                                    className="max-w-[200px] border-gray-200 py-6 rounded-2xl focus:ring-primary focus:border-primary"
                                />
                                <Button
                                    onClick={() => handleSaveSetting('nearExpiryDays', settings.nearExpiryDays || 30)}
                                    disabled={isSavingSetting}
                                    className="bg-primary hover:bg-secondary text-white px-8 py-6 rounded-2xl font-bold"
                                >
                                    {isSavingSetting ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 italic">
                                {isAr ? "* سيظهر زر 'تجديد الاشتراك' للمستخدم فقط إذا كان اشتراكه سينتهي خلال هذه المدة." : "* The 'Renew Subscription' button will only appear for the user if their subscription expires within this period."}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "المستخدم" : "User"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "نوع الطلب" : "Type"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "الباقة المطلوبة" : "Package"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "طريقة الدفع" : "Method"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "التاريخ" : "Date"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b">{isAr ? "الحالة" : "Status"}</th>
                                    <th className="py-5 px-6 font-semibold text-gray-600 border-b text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(() => {
                                    const filteredReqs = requests.filter(req => {
                                        if (activeTab === 'RENEWAL_REQUESTS') return req.type === 'RENEW';
                                        if (activeTab === 'UPGRADE_REQUESTS') return req.type === 'UPGRADE';
                                        return false;
                                    });

                                    if (filteredReqs.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                                        <RotateCcw className="w-10 h-10 opacity-20" />
                                                        <p className="text-lg font-medium">
                                                            {isAr ? "لا توجد طلبات معلقة حالياً" : "No pending requests at the moment"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return filteredReqs.map((req: any) => (
                                        <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="py-5 px-6">
                                                <p className="font-bold text-gray-800">{req.subscription?.user?.charityName || req.subscription?.fullName}</p>
                                                <p className="text-xs text-gray-400">{req.subscription?.email}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.type === 'RENEW' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {req.type === 'RENEW' ? (isAr ? 'تجديد' : 'Renew') : (isAr ? 'ترقية' : 'Upgrade')}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-gray-700 font-medium">
                                                {isAr ? (req.package?.name_ar || req.package?.name) : (req.package?.name_en || req.package?.name)}
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{req.paymentMethod === 'BANK' ? (isAr ? 'تحويل بنكي' : 'Bank') : 'Online'}</span>
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-gray-400 text-sm">
                                                {new Date(req.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                    req.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {req.status === 'PENDING' ? (isAr ? 'قيد الانتظار' : 'Pending') :
                                                        req.status === 'APPROVED' ? (isAr ? 'تمت الموافقة' : 'Approved') : (isAr ? 'مرفوض' : 'Rejected')}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {req.status === 'PENDING' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`/api/subscription-requests/${req.id}/approve`);
                                                                    toast.success(isAr ? "تم الموافقة بنجاح" : "Approved successfully");
                                                                    fetchRequests();
                                                                    dispatch(getSubscription());
                                                                } catch (e) {
                                                                    toast.error(isAr ? "فشل الموافقة" : "Approval failed");
                                                                }
                                                            }}
                                                            className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition-all flex items-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {isAr ? "موافقة" : "Approve"}
                                                        </button>
                                                    )}
                                                    {req.bankReceipt && (
                                                        <button
                                                            onClick={() => handlePreviewFile(req.bankReceipt as string, isAr ? "إيصال البنك" : "Bank Receipt")}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title={isAr ? "عرض الإيصال" : "View Receipt"}
                                                        >
                                                            <FileText className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }

            {
                showModal && selectedSubscription && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl relative z-10 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header - Fixed */}
                            <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white shrink-0 z-20">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {isEditing ? (isAr ? 'تعديل بيانات الإشتراك' : 'Edit Subscription Details') : (isAr ? 'تفاصيل الإشتراك' : 'Subscription Details')}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedSubscription.fullName} - {selectedSubscription.domainName}
                                    </p>
                                </div>
                                <button
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600 active:scale-95"
                                    onClick={handleCloseModal}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {isEditing ? (
                                    <form id="edit-subscription-form" onSubmit={handleUpdate} className="space-y-8">
                                        {/* Status Stepper Section */}
                                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                                            <label className="text-sm font-bold text-gray-700 block mb-4">{isAr ? "تحديث حالة الإشتراك" : "Update Subscription Status"}</label>

                                            <div className="flex flex-col lg:flex-row items-stretch gap-4">
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
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Form Content */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "الاسم الكامل" : "Full Name"}</label>
                                                    <Input
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                                                    <Input
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "رقم الهاتف" : "Phone"}</label>
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "اسم الدومين" : "Domain Name"}</label>
                                                    <Input
                                                        value={formData.domainName}
                                                        onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "نوع الدومين" : "Domain Type"}</label>
                                                    <select
                                                        value={formData.domainType}
                                                        onChange={(e) => setFormData({ ...formData, domainType: e.target.value })}
                                                        className="w-full rounded-2xl border border-gray-100 p-2 text-sm focus:ring-primary h-14 bg-gray-50/30 focus:bg-white transition-all"
                                                    >
                                                        <option value="SUBDOMAIN">{isAr ? "فرعي (Subdomain)" : "Subdomain"}</option>
                                                        <option value="CUSTOM_DOMAIN">{isAr ? "مخصص (Custom Domain)" : "Custom Domain"}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "تاريخ الموافقة" : "Approval Date"}</label>
                                                    <Input
                                                        type="date"
                                                        value={formData.approvalDate ? new Date(formData.approvalDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all px-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                                                    <Input
                                                        type="date"
                                                        value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all px-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "رقم تسجيل الجمعية" : "Charity Register No"}</label>
                                                    <Input
                                                        value={formData.charityRegisterNo}
                                                        onChange={(e) => setFormData({ ...formData, charityRegisterNo: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "طريقة الدفع" : "Payment Method"}</label>
                                                    <select
                                                        value={formData.paymentMethod}
                                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                        className="w-full rounded-2xl border border-gray-100 p-2 text-sm focus:ring-primary h-14 bg-gray-50/30 focus:bg-white transition-all"
                                                    >
                                                        <option value="ONLINE">{isAr ? "أونلاين" : "Online"}</option>
                                                        <option value="BANK">{isAr ? "تحويل بنكي" : "Bank Transfer"}</option>
                                                    </select>
                                                </div>
                                                {formData.paymentMethod === 'BANK' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ms-1">{isAr ? "إيصال البنك" : "Bank Receipt"}</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex-1 group">
                                                                <div className="absolute inset-0 bg-blue-50/30 rounded-2xl border border-dashed border-blue-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all pointer-events-none" />
                                                                <div className="relative h-14 flex items-center justify-center px-4 cursor-pointer">
                                                                    <Input
                                                                        type="file"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) setFormData({ ...formData, bankReceipt: file });
                                                                        }}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                    />
                                                                    <div className="flex items-center gap-3 text-gray-500 group-hover:text-blue-600 transition-colors">
                                                                        <Upload className="w-5 h-5" />
                                                                        <span className="font-medium text-xs truncate">
                                                                            {formData.bankReceipt instanceof File ? formData.bankReceipt.name : (isAr ? "تغيير الإيصال" : "Change Receipt")}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-12">
                                        {/* View Mode Content */}
                                        <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                                            <div className="flex w-full h-14 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
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
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-16 px-4">
                                            <div className="space-y-2 border-s-4 border-primary/20 ps-5 group hover:border-primary transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "الاسم الكامل" : "Full Name"}</span>
                                                <span className="font-extrabold text-gray-800 text-xl block leading-tight">{selectedSubscription.fullName}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                                                <span className="font-bold text-gray-700 text-lg block break-all leading-tight">{selectedSubscription.email}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "رقم الهاتف" : "Phone"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.phone}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-primary/20 ps-5 group hover:border-primary transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "اسم الدومين" : "Domain Name"}</span>
                                                <span className="font-black text-primary font-mono text-xl block leading-tight">{selectedSubscription.domainName}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "نوع الدومين" : "Domain Type"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.domainType === 'SUBDOMAIN' ? (isAr ? 'فرعي' : 'Subdomain') : (isAr ? 'مخصص' : 'Custom')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "تاريخ الإشتراك" : "Subscription Date"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{new Date(selectedSubscription.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "رقم تسجيل الجمعية" : "Charity Register No"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.charityRegisterNo || (isAr ? 'غير متوفر' : 'N/A')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">
                                                    {selectedSubscription.expiryDate ? new Date(selectedSubscription.expiryDate as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : (isAr ? 'غير محدد' : 'Not Set')}
                                                </span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "ملف الترخيص" : "License File"}</span>
                                                {selectedSubscription.licenseFile ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreviewFile(selectedSubscription.licenseFile, isAr ? "ملف الترخيص" : "License File")}
                                                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
                                                    >
                                                        {isAr ? "عرض الملف" : "View File"}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-bold block">{isAr ? "لا يوجد ملف" : "No File"}</span>
                                                )}
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.paymentMethod === 'BANK' ? (isAr ? 'تحويل بنكي' : 'Bank Transfer') : (isAr ? 'أونلاين' : 'Online')}</span>
                                            </div>
                                            {selectedSubscription.paymentMethod === 'BANK' && (
                                                <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isAr ? "إيصال البنك" : "Bank Receipt"}</span>
                                                    {selectedSubscription.bankReceipt ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreviewFile(selectedSubscription.bankReceipt as string, isAr ? "إيصال البنك" : "Bank Receipt")}
                                                            className="bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
                                                        >
                                                            {isAr ? "عرض الإيصال" : "View Receipt"}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm font-bold block">{isAr ? "لا يوجد إيصال" : "No Receipt"}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer - Fixed */}
                            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex gap-4 shrink-0 z-20">
                                {isEditing ? (
                                    <>
                                        <Button
                                            form="edit-subscription-form"
                                            type="submit"
                                            className="flex-1 rounded-[1.5rem] py-8 bg-primary hover:bg-secondary text-info text-xl font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            <Check className="w-6 h-6 me-2" />
                                            {isAr ? "حفظ التغييرات" : "Save Changes"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseModal}
                                            className="flex-1 rounded-[1.5rem] py-8 bg-white border-2 border-gray-200 text-gray-600 text-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            {isAr ? "إلغاء وفقدان التغييرات" : "Cancel & Discard"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-full rounded-[1.5rem] py-8 bg-gray-800 hover:bg-gray-900 text-white text-xl font-black transition-all active:scale-95"
                                    >
                                        {isAr ? "إغلاق" : "Close Details"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showDeleteModal && (
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
                )
            }

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ""}
                fileType={previewFile?.type}
                fileName={previewFile?.name}
            />
        </section >
    );
}
