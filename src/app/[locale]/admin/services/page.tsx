"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getServices, deleteService, Service } from "@/app/store/slices/servicesSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";

export default function ServicesManagement() {
    const t = useTranslations('admin.services');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { services, loading } = useSelector((state: RootState) => state.services);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

    useEffect(() => {
        dispatch(getServices());
    }, [dispatch]);

    const handleOpenCreate = () => {
        router.push(`/${locale}/admin/services/new`);
    };

    const handleOpenEdit = (svc: Service) => {
        router.push(`/${locale}/admin/services/${svc.id}`);
    };

    const handleDelete = async (id: number) => {
        setServiceToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (serviceToDelete === null) return;

        try {
            await dispatch(deleteService(serviceToDelete)).unwrap();
            toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
        } catch (error: any) {
            toast.error(error || (isAr ? "فشل الحذف" : "Deletion failed"));
        } finally {
            setServiceToDelete(null);
            setShowDeleteDialog(false);
        }
    };

    if (userInfo?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">{isAr ? "وصول غير مصرح" : "Access Denied"}</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
                    </div>
                </div>
                <Button 
                    onClick={handleOpenCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 group h-auto"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="font-semibold">{isAr ? "إضافة خدمة جديدة" : "Add New Service"}</span>
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                    ))
                ) : services.length > 0 ? (
                    <AnimatePresence>
                        {services.map((svc) => (
                            <motion.div
                                key={svc.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Floating Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleOpenEdit(svc)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(svc.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 cursor-pointer" onClick={() => handleOpenEdit(svc)}>
                                    <div className="w-full h-40 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                        {svc.image ? (
                                            <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-gray-300" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 truncate">
                                            {svc.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mt-1 min-h-[40px]">
                                            {svc.description}
                                        </p>
                                    </div>

                                    {/* Contents Preview */}
                                    <div className="space-y-1.5">
                                        {svc.contents?.slice(0, 2).map((c: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                <span className="truncate">{c.name}</span>
                                            </div>
                                        ))}
                                        {svc.contents?.length > 2 && (
                                            <div className="text-[10px] text-primary font-bold px-3">
                                                +{svc.contents.length - 2} {isAr ? "أخرى" : "more"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                                                {isAr ? "السعر" : "Price"}
                                            </span>
                                            <span className="text-lg font-black text-primary">
                                                {Number(svc.price).toLocaleString()} <span className="text-xs font-bold opacity-70">{svc.currency || "SAR"}</span>
                                            </span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(svc); }}
                                            className="text-sm font-semibold text-primary hover:underline"
                                        >
                                            {isAr ? "تعديل" : "Edit"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Layers className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{isAr ? "لا توجد خدمات" : "No Services"}</h3>
                        <p className="text-gray-500 mt-2">{isAr ? "ابدأ بإضافة أول خدمة للمنصة" : "Start by adding the first service to the platform"}</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title={isAr ? "تأكيد الحذف" : "Confirm Delete"}
                message={isAr ? "هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this service? This action cannot be undone."}
                confirmText={isAr ? "حذف" : "Delete"}
                cancelText={isAr ? "إلغاء" : "Cancel"}
                locale={locale}
                variant="danger"
            />
        </div>
    );
}
