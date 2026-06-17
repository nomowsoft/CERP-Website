"use client";
import Image from "next/image";
import { SubscriptionDTO } from "@/utils/types";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState, useMemo } from 'react';
import { getSubscription, deleteSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Eye, Search, X, Check, RotateCcw, Upload, FileText, Briefcase, Image as ImageIcon, CreditCard, Calendar, Settings, List, RefreshCcw, ArrowUpCircle, Settings2, Inbox, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { UserSubscriptionView } from "./UserSubscriptionView";
import FilePreviewModal from "@/components/FilePreviewModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getModuleFriendlyName } from "@/utils/moduleMapper";


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
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'RENEWAL_REQUESTS' | 'UPGRADE_REQUESTS' | 'SYSTEM_REQUESTS' | 'SETTINGS'>(initialTab);
    const [requests, setRequests] = useState<any[]>([]);
    const [provisioningResult, setProvisioningResult] = useState<any>(null);
    const [showProvisioningModal, setShowProvisioningModal] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; type?: string; name?: string } | null>(null);

    const handlePreviewFile = (url: string, name: string) => {
        let type = url.split('.').pop()?.toLowerCase();
        // Check for base64 data URLs
        if (url.startsWith('data:image/')) type = 'image';
        else if (url.startsWith('data:application/pdf')) type = 'pdf';
        
        setPreviewFile({ url, name, type });
    };

    const [requestsPage, setRequestsPage] = useState(1);
    const [requestsPagination, setRequestsPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const fetchRequests = async () => {
        try {
            const type = activeTab === 'RENEWAL_REQUESTS' ? 'RENEW' : 
                         activeTab === 'UPGRADE_REQUESTS' ? 'UPGRADE' : 
                         activeTab === 'SYSTEM_REQUESTS' ? 'ADD_SYSTEM' : 'ALL';
            
            const resp = await axios.get(`/api/subscription-requests?page=${requestsPage}&limit=10&type=${type}`);
            setRequests(resp.data.data);
            setRequestsPagination(resp.data.pagination);
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
        if (activeTab === 'RENEWAL_REQUESTS' || activeTab === 'UPGRADE_REQUESTS' || activeTab === 'SYSTEM_REQUESTS') {
            fetchRequests();
        }
        if (activeTab === 'SETTINGS') fetchSettings();
    }, [activeTab, requestsPage]);

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


    const params = useParams();
    const locale = params.locale as string || 'ar';
    const isAr = locale === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    useEffect(() => {
        dispatch(getSubscription());
    }, [dispatch]);

    const { subscriptionInfo, loading } = useSelector((state: any) => state.subscription);
    const subscriptions = subscriptionInfo?.data || [];
    const pagination = subscriptionInfo?.pagination || { total: 0, totalPages: 0 };

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(getSubscription({ 
                page, 
                limit, 
                search: searchTerm, 
                status: statusFilter 
            }));
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [dispatch, page, limit, searchTerm, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    const filteredSubscriptions = subscriptions; // Now handled by server

    const handleShowDetails = (item: SubscriptionDTO) => {
        router.push(`/${params.locale}/admin/subscription/${item.id}`);
    };

    const handleEdit = (item: SubscriptionDTO) => {
        router.push(`/${params.locale}/admin/subscription/${item.id}`);
    };

    const handleDeleteClick = (id: any) => {
        setSubscriptionToDelete(id);
        setShowDeleteModal(true);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = async () => {
        if (subscriptionToDelete) {
            setIsDeleting(true);
            try {
                await dispatch(deleteSubscription(subscriptionToDelete)).unwrap();
                toast.success(tc('deleteSuccess'));
                handleCloseModal();
                // Re-fetch to update pagination and ensure state is fresh from server
                // We do this after closing modal and success toast
                setTimeout(() => {
                    dispatch(getSubscription({ page, limit, search: searchTerm, status: statusFilter }));
                }, 100);
            } catch (error) {
                toast.error(tc('deleteError'));
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setSubscriptionToDelete(null);
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(t('copied'));
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
        const userSubscription = subscriptions?.[0];
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
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{tc('id')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{tc('user')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{tc('package')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{isAr ? "الأنظمة والوحدات" : "Systems & Modules"}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{tc('status')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{tc('lastRenewal')}</th>
                                        <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center px-6">{tc('actions')}</th>
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
                                                <td className="py-5 px-6 max-w-[250px]">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(() => {
                                                            const systems = [...(item.package?.systems || []), ...(item.systems || [])];
                                                            return systems.map((sys: any, sIdx: number) => (
                                                                <div key={sIdx} className="flex flex-col gap-1">
                                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] px-2 py-0 rounded-lg font-bold w-fit">
                                                                        {isAr ? sys.name_ar : sys.name_en}
                                                                    </Badge>
                                                                    {sys.modules && sys.modules.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {sys.modules.slice(0, 3).map((mod: string, mIdx: number) => (
                                                                                <span key={mIdx} className="text-[8px] bg-gray-50 px-1 rounded text-gray-400 font-medium border border-gray-100">
                                                                                    {getModuleFriendlyName(mod, locale)}
                                                                                </span>
                                                                            ))}
                                                                            {sys.modules.length > 3 && <span className="text-[8px] text-gray-300">+{sys.modules.length - 3}</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
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
                                                            onClick={(e) => { e.stopPropagation(); handleShowDetails(item); }}
                                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title={tc('view')}
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title={tc('edit')}
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }}
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
                        
                        {pagination.totalPages > 1 && (
                            <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4">
                                <div className="text-[12px] text-gray-500 font-medium">
                                    {isAr ? `عرض ${subscriptions.length} من أصل ${pagination.total}` : `Showing ${subscriptions.length} of ${pagination.total}`}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="rounded-xl h-9 px-4 border-gray-200"
                                    >
                                        <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <Button
                                                key={i + 1}
                                                variant={page === i + 1 ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(i + 1)}
                                                className={cn(
                                                    "w-9 h-9 rounded-xl font-bold text-[12px]",
                                                    page === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-200 text-gray-500"
                                                )}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === pagination.totalPages}
                                        className="rounded-xl h-9 px-4 border-gray-200"
                                    >
                                        <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                        )}
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
                                    type="text"
                                    value={settings.nearExpiryDays !== undefined && settings.nearExpiryDays !== null ? settings.nearExpiryDays : 30}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setSettings({ ...settings, nearExpiryDays: val });
                                    }}
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
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.user')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.type')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.package')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.paymentMethod')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.date')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-start px-6">{t('table.status')}</th>
                                    <th className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center px-6">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(() => {
                                    if (requests.length === 0) {
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

                                    return requests.map((req: any) => (
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
                                                                {isAr ? s.name_ar : s.name_en}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    isAr ? req.package?.name_ar : req.package?.name_en
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

                    {requestsPagination.totalPages > 1 && (
                        <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div className="text-[12px] text-gray-500 font-medium">
                                {isAr ? `عرض ${requests.length} من أصل ${requestsPagination.total}` : `Showing ${requests.length} of ${requestsPagination.total}`}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRequestsPage(prev => Math.max(1, prev - 1))}
                                    disabled={requestsPage === 1}
                                    className="rounded-xl h-9 px-4 border-gray-200"
                                >
                                    <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {[...Array(requestsPagination.totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={requestsPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setRequestsPage(i + 1)}
                                            className={cn(
                                                "w-9 h-9 rounded-xl font-bold text-[12px]",
                                                requestsPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-200 text-gray-500"
                                            )}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRequestsPage(prev => Math.min(requestsPagination.totalPages, prev + 1))}
                                    disabled={requestsPage === requestsPagination.totalPages}
                                    className="rounded-xl h-9 px-4 border-gray-200"
                                >
                                    <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ""}
                fileType={previewFile?.type}
                fileName={previewFile?.name}
            />

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={confirmDelete}
                title={tc('confirmDelete')}
                message={tc('deleteWarning')}
                confirmText={tc('delete')}
                cancelText={tc('cancel')}
                variant="danger"
                locale={params.locale as string}
                isLoading={isDeleting}
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
                        {provisioningResult.success && (
                            <div className="space-y-4 mb-8">
                                {provisioningResult.domain && (
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-start relative group">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('instanceUrl')}</span>
                                        <div className="flex items-center justify-between gap-3">
                                            <a href={provisioningResult.domain} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all text-sm">
                                                {provisioningResult.domain}
                                            </a>
                                            <button 
                                                onClick={() => copyToClipboard(provisioningResult.domain)}
                                                className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors shrink-0"
                                                title={t('copy')}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {provisioningResult.data?.Data?.Credentials && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-start">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('login')}</span>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono font-bold text-gray-700 text-xs truncate">
                                                    {provisioningResult.data.Data.Credentials.Login}
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(provisioningResult.data.Data.Credentials.Login)}
                                                    className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors shrink-0"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-start">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('password')}</span>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono font-bold text-gray-700 text-xs truncate">
                                                    {provisioningResult.data.Data.Credentials.Password}
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(provisioningResult.data.Data.Credentials.Password)}
                                                    className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors shrink-0"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Button onClick={() => setShowProvisioningModal(false)} className="w-full py-6 rounded-2xl font-bold text-lg">{t('close')}</Button>
                    </div>
                </div>
            )}
        </section >
    );
}
