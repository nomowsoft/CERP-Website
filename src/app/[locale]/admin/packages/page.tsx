"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getPackages, deletePackage, Package } from "@/app/store/slices/packagesSlice";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
    Package as PackageIcon,
    Plus,
    Edit2,
    Trash2,
    Check,
    Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";

export default function PackagesManagement() {
    const t = useTranslations('admin.packages');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { packages, loading } = useSelector((state: RootState) => state.packages);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<number | null>(null);

    useEffect(() => {
        dispatch(getPackages());
    }, [dispatch]);

    const handleOpenCreate = () => {
        router.push(`/${locale}/admin/packages/new`);
    };

    const handleOpenEdit = (pkg: Package) => {
        router.push(`/${locale}/admin/packages/${pkg.id}`);
    };

    const handleDelete = async (id: number) => {
        setPackageToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (packageToDelete === null) return;
        try {
            await dispatch(deletePackage(packageToDelete)).unwrap();
            toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
        } catch (error: any) {
            toast.error(error || (isAr ? "فشل الحذف" : "Deletion failed"));
        } finally {
            setPackageToDelete(null);
            setShowDeleteDialog(false);
        }
    };

    if (userInfo?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">{isAr ? "وصول غير مصرح" : "Access Denied"}</div>;
    }

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={isAr ? 'rtl' : 'ltr'}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <PackageIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                                {t('title')}
                            </h2>
                            <p className="text-gray-500 mt-1 font-medium">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleOpenCreate} className="bg-primary text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {isAr ? "إضافة باقة جديدة" : "Add New Package"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-96 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : packages.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            onClick={() => handleOpenEdit(pkg)}
                            className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col"
                        >
                            <div className="relative h-56 bg-gray-50 overflow-hidden shrink-0">
                                {pkg.image ? (
                                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:bg-primary/5 transition-colors duration-500">
                                        <ImageIcon className="w-16 h-16 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-black shadow-lg transform group-hover:-translate-y-1 transition-transform duration-500">
                                    <span className="text-primary mr-1 flex items-center gap-1">{isAr ? <SaudiRiyalIcon size={12} /> : pkg.currency}</span> {pkg.price}
                                </div>
                            </div>
                            
                            <div className="p-8 flex flex-col flex-1 relative bg-white">
                                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors">{isAr ? pkg.name_ar : pkg.name_en}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{isAr ? pkg.description_ar : pkg.description_en}</p>

                                <div className="space-y-4 mb-8 flex-1">
                                    {pkg.features.slice(0, 3).map((f) => (
                                        <div key={f.id} className="flex items-start gap-3 text-sm text-gray-600">
                                            <div className="p-1.5 bg-green-50 rounded-full mt-0.5 group-hover:bg-green-100 transition-colors shrink-0">
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <span className="font-semibold leading-snug">{isAr ? f.text : f.text_en}</span>
                                        </div>
                                    ))}
                                    {pkg.features.length > 3 && (
                                        <div className="text-xs text-primary font-black px-9 pt-2">
                                            +{pkg.features.length - 3} {isAr ? "مميزات أخرى" : "more features"}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-100 mt-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transform lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500">
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(pkg); }} 
                                        className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold py-6 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-5 h-5" /> 
                                        {isAr ? "عرض وتعديل" : "View & Edit"}
                                    </Button>
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(pkg.id); }} 
                                        variant="outline"
                                        className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white rounded-2xl font-bold p-6 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title={isAr ? "تأكيد الحذف" : "Confirm Delete"}
                message={isAr ? "هل أنت متأكد من حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this package? This action cannot be undone."}
                confirmText={isAr ? "حذف" : "Delete"}
                cancelText={isAr ? "إلغاء" : "Cancel"}
                locale={locale}
                variant="danger"
            />
        </section>
    );
}

