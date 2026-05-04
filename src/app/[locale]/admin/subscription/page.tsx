"use client";
import Image from "next/image";
import { SubscriptionDTO } from "@/utils/types";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState } from 'react';
import { getSubscription, deleteSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Eye, Search, X, Check, RotateCcw, Upload, FileText, Briefcase, Image as ImageIcon, CreditCard, Calendar, Settings, List, RefreshCcw, ArrowUpCircle, Settings2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useParams, useSearchParams } from "next/navigation";
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
    const t = useTranslations('admin.subscriptions');
    const tc = useTranslations('dashboard.common');
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as any) || 'SUBSCRIPTIONS';
    
    const dispatch = useDispatch<AppDispatch>();
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDTO | null>(null);
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'RENEWAL_REQUESTS' | 'UPGRADE_REQUESTS' | 'SYSTEM_REQUESTS' | 'SETTINGS'>(initialTab);
    const [requests, setRequests] = useState<any[]>([]);
    const [provisioningResult, setProvisioningResult] = useState<any>(null);
    const [showProvisioningModal, setShowProvisioningModal] = useState(false);

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
        if (activeTab === 'RENEWAL_REQUESTS' || activeTab === 'UPGRADE_REQUESTS' || activeTab === 'SYSTEM_REQUESTS') fetchRequests();
        if (activeTab === 'SETTINGS') fetchSettings();
    }, [activeTab]);

    const handleSaveSetting = async (key: string, value: any) => {
        setIsSavingSetting(true);
        try {
            await axios.post('/api/settings', { key, value });
            toast.success(t('saveSettingSuccess'));
            fetchSettings();
        } catch (error) {
            console.error('Error saving setting:', error);
            toast.error(t('saveSettingError'));
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
        setViewMode('FORM');
    };

    const handleEdit = (item: SubscriptionDTO) => {
        setSelectedSubscription(item);
        setFormData(item);
        setIsEditing(true);
        setViewMode('FORM');
    };

    const currentIndex = selectedSubscription ? filteredSubscriptions.findIndex((s: any) => s.id === selectedSubscription.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < filteredSubscriptions.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            const prev = filteredSubscriptions[currentIndex - 1];
            setSelectedSubscription(prev);
            setFormData(prev);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            const next = filteredSubscriptions[currentIndex + 1];
            setSelectedSubscription(next);
            setFormData(next);
        }
    };

    const handleDeleteClick = (id: any) => {
        setSubscriptionToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (subscriptionToDelete) {
            try {
                await dispatch(deleteSubscription(subscriptionToDelete)).unwrap();
                toast.success(tc('deleteSuccess'));
                handleCloseModal();
            } catch (err: any) {
                toast.error(tc('deleteError'));
            }
        }
    };

    const [isUpdating, setIsUpdating] = useState(false);

    const performUpdate = async (data: any) => {
        setIsUpdating(true);
        try {
            // Prepare payload (convert Files to Base64 strings)
            const payload: any = { ...data };
            if (payload.licenseFile instanceof File) {
                payload.licenseFile = await fileToBase64(payload.licenseFile);
            }
            // Check if bankReceipt is a File object (new upload) or keep existing string
            if (payload.bankReceipt instanceof File) {
                payload.bankReceipt = await fileToBase64(payload.bankReceipt);
            }

            const result = await dispatch(updateSubscription({ id: selectedSubscription?.id as number, data: payload })).unwrap();
            
            if (result.provisioning) {
                setProvisioningResult(result.provisioning);
                setShowProvisioningModal(true);
            }
            
            toast.success(isAr ? result.message_ar : result.message);
            handleCloseModal();
        } catch (err: any) {
            toast.error(err || tc('updateError'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await performUpdate(formData);
    };

    const handleCloseModal = () => {
        setViewMode('LIST');
        setShowDeleteModal(false);
        setSelectedSubscription(null);
        setSubscriptionToDelete(null);
        setIsEditing(false);
    };

    const stages = [
        { id: 'DRAFT', label: tc('draft') },
        { id: 'PROGRES', label: tc('inProgress') },
        { id: 'DONE', label: tc('accepted') },
        { id: 'CANCEL', label: tc('rejected') }
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
            {viewMode === 'LIST' ? (
                <>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                        <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">{t('subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="w-full mb-8">
                <div className="flex border-b border-gray-100 gap-8">
                    {[
                        { id: 'SUBSCRIPTIONS', icon: List, label: t('tabs.all') },
                        { id: 'RENEWAL_REQUESTS', icon: RefreshCcw, label: t('tabs.renewals') },
                        { id: 'UPGRADE_REQUESTS', icon: ArrowUpCircle, label: t('tabs.upgrades') },
                        { id: 'SYSTEM_REQUESTS', icon: Settings2, label: t('tabs.systemRequests') },
                        { id: 'SETTINGS', icon: Settings, label: t('tabs.settings') }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-[12px] font-bold uppercase tracking-wider transition-all border-b-2",
                                activeTab === tab.id 
                                    ? "text-primary border-primary" 
                                    : "text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'SUBSCRIPTIONS' ? (
                <>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="relative md:col-span-6 lg:col-span-7">
                                <Input
                                    type="search"
                                    placeholder={tc('search')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-600"
                                />
                                <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{tc('id')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{tc('user')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{tc('package')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{tc('status')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{tc('lastRenewal')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">{tc('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubscriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-4">
                                                        <Inbox className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{t('noResults')}</h3>
                                                    <p className="text-[12px] text-gray-500 font-medium mt-1">{t('noResultsDesc')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubscriptions.map((item: SubscriptionDTO) => (
                                            <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="py-5 px-6 text-gray-700 font-bold">#{item.id}</td>
                                                <td className="py-5 px-6">
                                                    <div className="font-bold text-gray-800">{(item as any).user?.charityName || item.fullName}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{item.email}</div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className="font-bold text-primary">{isAr ? item.package?.name_ar : item.package?.name_en}</span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'DRAFT' ? 'bg-blue-100 text-blue-600' :
                                                        item.status === 'PROGRES' ? 'bg-yellow-100 text-yellow-600' :
                                                            item.status === 'DONE' ? 'bg-green-100 text-green-600' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        {item.status === 'DRAFT' ? tc('draft') :
                                                            item.status === 'PROGRES' ? tc('inProgress') :
                                                                item.status === 'DONE' ? tc('accepted') : tc('rejected')}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-gray-400 text-sm font-medium">
                                                    {new Date(item.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleShowDetails(item)}
                                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title={tc('view')}
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title={tc('edit')}
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title={tc('delete')}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : activeTab === 'SETTINGS' ? (
                <div className="max-w-2xl bg-white shadow-xl shadow-gray-100 border border-gray-100 rounded-[2.5rem] p-8 lg:p-12">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">{t('settings.renewalTitle')}</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-1 leading-relaxed">
                                {t('settings.renewalSubtitle')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                                {t('settings.daysLabel')}
                            </Label>
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
                                    {isSavingSetting ? tc('saving') : tc('save')}
                                </Button>
                            </div>
                            <p className="text-[11px] text-amber-600/80 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 leading-relaxed italic">
                                {t('settings.renewalNote')}
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
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.user')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.type')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.package')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.paymentMethod')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.date')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start">{t('table.status')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(() => {
                                    const filteredReqs = requests.filter(req => {
                                        if (activeTab === 'RENEWAL_REQUESTS') return req.type === 'RENEW';
                                        if (activeTab === 'UPGRADE_REQUESTS') return req.type === 'UPGRADE';
                                        if (activeTab === 'SYSTEM_REQUESTS') return req.type === 'ADD_SYSTEM';
                                        return false;
                                    });

                                    if (filteredReqs.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={7} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                                        <RotateCcw className="w-10 h-10 opacity-20" />
                                                        <p className="text-lg font-medium">
                                                            {t('noRequests')}
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
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    req.type === 'RENEW' ? 'bg-blue-100 text-blue-600' : 
                                                    req.type === 'UPGRADE' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {req.type === 'RENEW' ? tc('renew') : req.type === 'UPGRADE' ? tc('upgrade') : (isAr ? "إضافة نظام" : "Add System")}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-gray-700 font-medium">
                                                {req.type === 'ADD_SYSTEM' ? (
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {req.systems?.map((s: any) => (
                                                            <Badge key={s.id} variant="outline" className="text-[10px] py-0">
                                                                {isAr ? (s.name_ar || s.name) : (s.name_en || s.name)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    isAr ? (req.package?.name_ar || req.package?.name) : (req.package?.name_en || req.package?.name)
                                                )}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="text-[11px] font-bold text-gray-700">
                                                    {req.paymentMethod === 'BANK' ? tc('bank') : tc('online')}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-gray-400 text-sm">
                                                {new Date(req.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="py-5 px-6">
                                                <Badge className={cn(
                                                    "px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-none",
                                                    req.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    req.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-gray-50 text-gray-600 border-gray-100"
                                                )}>
                                                    {req.status === 'PENDING' ? tc('inProgress') : req.status === 'APPROVED' ? tc('approved') : tc('rejected')}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {req.status === 'PENDING' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const resp = await axios.put(`/api/subscription-requests/${req.id}/approve`);
                                                                    const result = resp.data;
                                                                    
                                                                    if (result.provisioning) {
                                                                        setProvisioningResult(result.provisioning);
                                                                        setShowProvisioningModal(true);
                                                                    }
                                                                    
                                                                    toast.success(isAr ? result.message_ar : result.message);
                                                                    fetchRequests();
                                                                    dispatch(getSubscription());
                                                                } catch (e) {
                                                                    toast.error(t('approveError'));
                                                                }
                                                            }}
                                                            className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition-all flex items-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {tc('approve')}
                                                        </button>
                                                    )}
                                                    {req.bankReceipt && (
                                                        <button
                                                            onClick={() => handlePreviewFile(req.bankReceipt as string, tc('bankReceipt'))}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title={tc('viewReceipt')}
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

            </>
            ) : viewMode === 'FORM' && selectedSubscription ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Form Header with Breadcrumbs & Pagination */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleCloseModal} 
                                className="text-gray-500 hover:text-primary font-bold transition-colors text-lg"
                            >
                                {t('title')}
                            </button>
                            <span className="text-gray-300 mx-2">/</span>
                            <span className="text-gray-900 font-black tracking-tight text-lg">#{selectedSubscription.id} - {(selectedSubscription as any).user?.charityName || selectedSubscription.fullName}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
                            <button 
                                onClick={handlePrev} 
                                disabled={!hasPrev} 
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-600 border-x border-gray-100">
                                {currentIndex + 1} / {filteredSubscriptions.length}
                            </span>
                            <button 
                                onClick={handleNext} 
                                disabled={!hasNext} 
                                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 w-full relative z-10 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white shrink-0 z-20">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {isEditing ? t('editSubscription') : t('detailsTitle')}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {(selectedSubscription as any).user?.charityName || selectedSubscription.fullName} - {selectedSubscription.domainType === 'SUBDOMAIN' && !selectedSubscription.domainName?.includes('.') ? `${selectedSubscription.domainName}.cerp.sa` : selectedSubscription.domainName}
                                    </p>
                                </div>
                                <button
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600 active:scale-95"
                                    onClick={handleCloseModal}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {isEditing ? (
                                    <form id="edit-subscription-form" onSubmit={handleUpdate} className="space-y-8">
                                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                                            <label className="text-sm font-bold text-gray-700 block mb-4">{t('updateStatus')}</label>

                                            <div className="flex flex-col lg:flex-row items-stretch gap-4">
                                                <div className="flex gap-2 shrink-0">
                                                    {(formData.status === 'DONE' || formData.status === 'CANCEL') ? (
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() => {
                                                                const nextStatus = 'DRAFT';
                                                                setFormData({ ...formData, status: nextStatus });
                                                                performUpdate({ ...formData, status: nextStatus });
                                                            }}
                                                            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 text-sm disabled:opacity-50"
                                                        >
                                                            {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                                            <span>{tc('returnToDraft')}</span>
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={isUpdating}
                                                                onClick={() => {
                                                                    const statusOrder = ['DRAFT', 'PROGRES', 'DONE'];
                                                                    const currentIndex = statusOrder.indexOf(formData.status || 'DRAFT');
                                                                    if (currentIndex < statusOrder.length - 1) {
                                                                        const nextStatus = statusOrder[currentIndex + 1];
                                                                        setFormData({ ...formData, status: nextStatus });
                                                                        performUpdate({ ...formData, status: nextStatus, provision: nextStatus === 'DONE' });
                                                                    }
                                                                }}
                                                                className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                                            >
                                                                {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                                <span>{tc('approve')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={isUpdating}
                                                                onClick={() => {
                                                                    const nextStatus = 'CANCEL';
                                                                    setFormData({ ...formData, status: nextStatus });
                                                                    performUpdate({ ...formData, status: nextStatus });
                                                                }}
                                                                className="px-8 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                                            >
                                                                {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                                                <span>{tc('reject')}</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('fullName')}</label>
                                                    <Input
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('email')}</label>
                                                    <Input
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('phone')}</label>
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('domainName')}</label>
                                                    <Input
                                                        value={formData.domainName}
                                                        onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('domainType')}</label>
                                                    <select
                                                        value={formData.domainType}
                                                        onChange={(e) => setFormData({ ...formData, domainType: e.target.value })}
                                                        className="w-full rounded-2xl border border-gray-100 p-2 text-sm focus:ring-primary h-14 bg-gray-50/30 focus:bg-white transition-all"
                                                    >
                                                        <option value="SUBDOMAIN">{tc('subdomain')}</option>
                                                        <option value="CUSTOM_DOMAIN">{tc('customDomain')}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('approvalDate')}</label>
                                                    <Input
                                                        type="date"
                                                        value={formData.approvalDate ? new Date(formData.approvalDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all px-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('expiryDate')}</label>
                                                    <Input
                                                        type="date"
                                                        value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all px-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('charityRegisterNo')}</label>
                                                    <Input
                                                        value={formData.charityRegisterNo}
                                                        onChange={(e) => setFormData({ ...formData, charityRegisterNo: e.target.value })}
                                                        className="rounded-2xl py-7 bg-gray-50/30 border-gray-100 focus:bg-white transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ms-1">{tc('paymentMethod')}</label>
                                                    <select
                                                        value={formData.paymentMethod}
                                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                        className="w-full rounded-2xl border border-gray-100 p-2 text-sm focus:ring-primary h-14 bg-gray-50/30 focus:bg-white transition-all"
                                                    >
                                                        <option value="ONLINE">{tc('online')}</option>
                                                        <option value="BANK">{tc('bank')}</option>
                                                    </select>
                                                </div>
                                                {formData.paymentMethod === 'BANK' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ms-1">{tc('bankReceipt')}</label>
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
                                                                            {formData.bankReceipt instanceof File ? formData.bankReceipt.name : tc('changeReceipt')}
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
                                                            'DRAFT': tc('draft'),
                                                            'PROGRES': tc('inProgress'),
                                                            'DONE': tc('accepted')
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
                                            <div className="space-y-2 border-s-4 border-primary ps-5 group hover:border-primary transition-all bg-primary/5 py-4 rounded-e-2xl">
                                                <span className="text-xs text-primary font-black uppercase tracking-widest">{t('selectedPackage')}</span>
                                                <span className="font-black text-gray-900 text-2xl block leading-tight">{isAr ? selectedSubscription.package?.name_ar : selectedSubscription.package?.name_en}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-primary/20 ps-5 group hover:border-primary transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('fullName')}</span>
                                                <span className="font-extrabold text-gray-800 text-xl block leading-tight">{selectedSubscription.fullName}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('email')}</span>
                                                <span className="font-bold text-gray-700 text-lg block break-all leading-tight">{selectedSubscription.email}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('phone')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.phone}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-primary/20 ps-5 group hover:border-primary transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('domainName')}</span>
                                                <span className="font-black text-primary font-mono text-xl block leading-tight">{selectedSubscription.domainType === 'SUBDOMAIN' && !selectedSubscription.domainName?.includes('.') ? `${selectedSubscription.domainName}.cerp.sa` : selectedSubscription.domainName}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('domainType')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.domainType === 'SUBDOMAIN' ? tc('subdomain') : tc('customDomain')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('createdAt')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{new Date(selectedSubscription.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('charityRegisterNo')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.charityRegisterNo || tc('noResults')}</span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('expiryDate')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">
                                                    {selectedSubscription.expiryDate ? new Date(selectedSubscription.expiryDate as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : tc('draft')}
                                                </span>
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('licenseFile')}</span>
                                                {selectedSubscription.licenseFile ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreviewFile(selectedSubscription.licenseFile, tc('licenseFile'))}
                                                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
                                                    >
                                                        {tc('viewFile')}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-bold block">{tc('noFile')}</span>
                                                )}
                                            </div>
                                            <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('paymentMethod')}</span>
                                                <span className="font-bold text-gray-700 text-lg block leading-tight">{selectedSubscription.paymentMethod === 'BANK' ? tc('bank') : tc('online')}</span>
                                            </div>
                                            {selectedSubscription.paymentMethod === 'BANK' && (
                                                <div className="space-y-2 border-s-4 border-gray-100 ps-5 group hover:border-primary/40 transition-all">
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{tc('bankReceipt')}</span>
                                                    {selectedSubscription.bankReceipt ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreviewFile(selectedSubscription.bankReceipt as string, tc('bankReceipt'))}
                                                            className="bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
                                                        >
                                                            {tc('viewReceipt')}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm font-bold block">{tc('noReceipt')}</span>
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
                                            disabled={isUpdating}
                                            className="flex-1 rounded-[1.5rem] py-8 bg-primary hover:bg-secondary text-info text-xl font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpdating ? <RefreshCcw className="w-6 h-6 me-2 animate-spin" /> : <Check className="w-6 h-6 me-2" />}
                                            {tc('saveChanges')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseModal}
                                            className="flex-1 rounded-[1.5rem] py-8 bg-white border-2 border-gray-200 text-gray-600 text-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            {tc('cancel')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-full rounded-[1.5rem] py-8 bg-gray-800 hover:bg-gray-900 text-white text-xl font-black transition-all active:scale-95"
                                    >
                                        {tc('close')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
            ) : null}
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
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{tc('confirmDelete')}</h3>
                            <p className="text-gray-500 mb-8">{tc('deleteWarning')}</p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-xl py-6 bg-red-600 hover:bg-red-700"
                                >
                                    {tc('yesDelete')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    className="flex-1 rounded-xl py-6"
                                >
                                    {tc('cancel')}
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

            {showProvisioningModal && provisioningResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowProvisioningModal(false)} />
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden">
                        <div className={`p-1 h-2 w-full ${provisioningResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="p-10 text-center">
                            <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 ${provisioningResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                {provisioningResult.success ? (
                                    <Check className="w-10 h-10 text-green-500" />
                                ) : (
                                    <X className="w-10 h-10 text-red-500" />
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {provisioningResult.success ? t('provisioningSuccess') : t('provisioningError')}
                            </h3>
                            
                            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                {provisioningResult.success 
                                    ? t('provisioningSuccessMsg') 
                                    : provisioningResult.message || t('provisioningErrorMsg')}
                            </p>

                            {provisioningResult.success && provisioningResult.domain && (
                                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('instanceUrl')}</span>
                                    <a href={provisioningResult.domain} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all">
                                        {provisioningResult.domain}
                                    </a>
                                </div>
                            )}

                            <Button 
                                onClick={() => setShowProvisioningModal(false)}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all active:scale-95"
                            >
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section >
    );
}
