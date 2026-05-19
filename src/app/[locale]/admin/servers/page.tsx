"use client";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { 
    ShoppingBag, 
    Search, 
    Globe, 
    Copy, 
    ExternalLink, 
    ShieldCheck, 
    Layers, 
    User, 
    Clock, 
    Inbox,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import axios from 'axios';
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ServersPage() {
    const t = useTranslations('dashboard');
    const tc = useTranslations('dashboard.common');
    const ts = useTranslations('admin.subscriptions');
    const params = useParams();
    const locale = params.locale as string || 'ar';
    const isAr = locale === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<{ id: string, projectName: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchServers = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(`/api/servers?page=${page}&limit=10&search=${searchTerm}`);
            setServers(resp.data.data);
            setPagination(resp.data.pagination);
        } catch (err) {
            console.error("Failed to fetch servers", err);
            toast.error(isAr ? "فشل في تحميل السيرفرات" : "Failed to load servers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchServers();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(ts('copied'));
    };

    const togglePassword = (id: string) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDeleteServer = (id: string, projectName: string) => {
        setServerToDelete({ id, projectName });
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!serverToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/servers/${serverToDelete.id}`);
            toast.success(isAr ? "تم حذف السيرفر بنجاح" : "Server deleted successfully");
            setIsConfirmOpen(false);
            setServerToDelete(null);
            fetchServers();
        } catch (error) {
            console.error("Failed to delete server", error);
            toast.error(isAr ? "فشل في حذف السيرفر" : "Failed to delete server");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={dir}>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isAr ? "إدارة السيرفرات" : "Servers Management"}
                        </h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                            {isAr ? "مراقبة وإدارة جميع السيرفرات المهيأة للعملاء" : "Monitor and manage all provisioned client servers"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 mb-8">
                <div className="relative max-w-md">
                    <Input
                        type="search"
                        placeholder={tc('search')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-600"
                    />
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                </div>
            </div>

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : servers.length === 0 ? (
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden p-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{tc('noResults')}</h3>
                    <p className="text-[12px] text-gray-500 font-medium mt-1">{ts('noResultsDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {servers.map((server) => (
                        <div key={server.id} className="bg-white shadow-xl shadow-gray-100/50 border border-gray-100 rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                                            <Globe className="w-7 h-7 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 leading-tight">
                                                {server.projectName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <a 
                                                    href={`https://${server.domain}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[12px] text-gray-400 font-bold hover:text-primary transition-colors flex items-center gap-1"
                                                >
                                                    {server.domain}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-50 text-green-600 border-green-100 shadow-none px-3 py-1 rounded-full font-bold text-[10px]">
                                            {isAr ? "نشط" : "ACTIVE"}
                                        </Badge>
                                        <button 
                                            onClick={() => handleDeleteServer(server.id, server.projectName)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                                            title={isAr ? "حذف السيرفر" : "Delete Server"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ts('login')}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono font-bold text-gray-700 text-xs truncate">
                                                {server.login}
                                            </span>
                                            <button 
                                                onClick={() => copyToClipboard(server.login)}
                                                className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ts('password')}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono font-bold text-gray-700 text-xs truncate">
                                                {showPassword[server.id] ? server.password : '••••••••'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => togglePassword(server.id)}
                                                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                                                >
                                                    {showPassword[server.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button 
                                                    onClick={() => copyToClipboard(server.password)}
                                                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Layers className="w-4 h-4" />
                                            <span className="text-xs font-bold">{isAr ? "الأنظمة المثبتة" : "Installed Modules"}</span>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                                            {server.installedModules?.split(',').map((mod: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-gray-50 text-gray-500 border-gray-100 text-[9px] px-2 py-0">
                                                    {mod.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User className="w-4 h-4" />
                                            <span className="text-xs font-bold">{isAr ? "العميل" : "Client"}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-900">{server.subscription?.user?.charityName || server.subscription?.fullName}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-bold">{isAr ? "تاريخ التفعيل" : "Activation Date"}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">
                                            {new Date(server.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50/50 p-6 flex justify-center border-t border-gray-50">
                                <Button 
                                    variant="outline" 
                                    className="w-full rounded-2xl font-bold bg-white border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                                    onClick={() => window.open(`https://${server.domain}`, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {ts('visitInstance')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="rounded-xl h-10 px-6 border-gray-200"
                    >
                        <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Button>
                    <div className="flex items-center gap-2">
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <Button
                                key={i + 1}
                                variant={page === i + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold text-[13px]",
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
                        onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={page === pagination.totalPages}
                        className="rounded-xl h-10 px-6 border-gray-200"
                    >
                        <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            )}

            <ConfirmDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={isAr ? "تأكيد حذف السيرفر" : "Confirm Server Deletion"}
                message={isAr ? `هل أنت متأكد من حذف السيرفر "${serverToDelete?.projectName}"؟ سيتم حذفه من المنصة ومن النظام.` : `Are you sure you want to delete server "${serverToDelete?.projectName}"? It will be deleted from the platform and the system.`}
                confirmText={isAr ? "حذف السيرفر" : "Delete Server"}
                cancelText={isAr ? "إلغاء" : "Cancel"}
                variant="danger"
                locale={locale}
                isLoading={isDeleting}
            />
        </section>
    );
}
