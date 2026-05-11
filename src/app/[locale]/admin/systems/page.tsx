"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Layers, Settings2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getModuleFriendlyName } from "@/utils/moduleMapper";

export default function SystemsPage() {
    const t = useTranslations("admin.systems");
    const locale = useLocale();
    const router = useRouter();
    const [systems, setSystems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [systemToDelete, setSystemToDelete] = useState<number | null>(null);

    const fetchSystems = async () => {
        try {
            const resp = await axios.get("/api/systems");
            setSystems(resp.data);
        } catch (err) {
            console.error("Failed to fetch systems", err);
            toast.error("Failed to load systems");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystems();
    }, []);

    const handleDeleteClick = (id: number) => {
        setSystemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!systemToDelete) return;
        try {
            await axios.delete(`/api/systems/${systemToDelete}`);
            toast.success(t("deleteSuccess"));
            fetchSystems();
        } catch (err) {
            toast.error("Failed to delete system");
        } finally {
            setShowDeleteModal(false);
            setSystemToDelete(null);
        }
    };

    const filteredSystems = systems.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name_ar.includes(searchTerm) ||
        s.name_en.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Settings2 className="w-8 h-8 text-primary" />
                        {t("title")}
                    </h1>
                    <p className="text-gray-500 mt-1">{t("subtitle")}</p>
                </div>
                <Link 
                    href={`/${locale}/admin/systems/new`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="font-semibold">{t("newSystem")}</span>
                </Link>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-gray-700"
                    />
                </div>
            </div>

            {/* Systems Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
                    ))
                ) : filteredSystems.length > 0 ? (
                    <AnimatePresence>
                        {filteredSystems.map((system) => (
                            <motion.div
                                key={system.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                router.push(`/${locale}/admin/systems/${system.id}`);
                                            }}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                                            title={t("editSystem")}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteClick(system.id);
                                            }}
                                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                                            title={t("deleteConfirm")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                        {system.icon ? (
                                            <img src={system.icon} alt={system.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Layers className="w-7 h-7 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 truncate">
                                            {locale === 'ar' ? (system.name_ar || system.name) : (system.name_en || system.name)}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                                            {locale === 'ar' ? system.description_ar : system.description_en}
                                        </p>
                                        
                                        {system.modules && system.modules.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {system.modules.slice(0, 4).map((mod: string, mIdx: number) => (
                                                    <span 
                                                        key={mIdx} 
                                                        className="text-[9px] bg-primary/5 text-primary px-2 py-0.5 rounded-md font-bold border border-primary/10"
                                                    >
                                                        {getModuleFriendlyName(mod, locale)}
                                                    </span>
                                                ))}
                                                {system.modules.length > 4 && (
                                                    <span className="text-[9px] text-gray-400 font-bold">
                                                        +{system.modules.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                            {locale === 'ar' ? "السعر" : "Price"}
                                        </span>
                                        <span className="text-lg font-black text-primary">
                                            {Number(system.price).toLocaleString()} <span className="text-xs font-bold opacity-70">SAR</span>
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/${locale}/admin/systems/${system.id}`)}
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        {t("editSystem")}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Settings2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t("noSystems")}</h3>
                        <p className="text-gray-500 mt-2">ابدأ بإضافة أول نظام تقني للمنصة</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={t("deleteConfirm")}
                message={t("deleteWarning")}
                confirmText={t("delete")}
                cancelText={t("cancel")}
                variant="danger"
                locale={locale}
            />
        </div>
    );
}
