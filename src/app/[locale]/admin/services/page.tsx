"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getServices, createService, updateService, deleteService, Service } from "@/app/store/slices/servicesSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Image as ImageIcon,
    List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ServicesManagement() {
    const t = useTranslations('admin.services');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { services, loading } = useSelector((state: RootState) => state.services);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        description: "",
        description_en: "",
        image: "",
        contents: [{ name: "", name_en: "" }]
    });

    useEffect(() => {
        dispatch(getServices());
    }, [dispatch]);

    const resetForm = () => {
        setFormData({
            name: "",
            name_en: "",
            description: "",
            description_en: "",
            image: "",
            contents: [{ name: "", name_en: "" }]
        });
        setIsEditing(false);
        setSelectedService(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (svc: Service) => {
        setSelectedService(svc);
        setFormData({
            name: svc.name,
            name_en: svc.name_en || "",
            description: svc.description,
            description_en: svc.description_en || "",
            image: svc.image,
            contents: (svc.contents && svc.contents.length > 0) ? svc.contents.map(c => ({ name: c.name, name_en: c.name_en || "" })) : [{ name: "", name_en: "" }]
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cleanContents = formData.contents.filter(c => c.name.trim() !== "");
            const payload = { ...formData, contents: cleanContents };

            if (isEditing && selectedService) {
                await dispatch(updateService({ id: selectedService.id, data: payload })).unwrap();
                toast.success(isAr ? "تم تحديث الخدمة بنجاح" : "Service updated successfully");
            } else {
                await dispatch(createService(payload)).unwrap();
                toast.success(isAr ? "تم إنشاء الخدمة بنجاح" : "Service created successfully");
            }
            setShowModal(false);
            resetForm();
        } catch (error: any) {
            toast.error(error || (isAr ? "حدث خطأ ما" : "Something went wrong"));
        }
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
        }
    };

    const handleContentChange = (index: number, field: 'name' | 'name_en', value: string) => {
        const newContents = [...formData.contents];
        newContents[index] = { ...newContents[index], [field]: value };
        setFormData({ ...formData, contents: newContents });
    };

    const addContent = () => {
        setFormData({ ...formData, contents: [...formData.contents, { name: "", name_en: "" }] });
    };

    const removeContent = (index: number) => {
        const newContents = formData.contents.filter((_, i) => i !== index);
        setFormData({ ...formData, contents: newContents });
    };

    if (userInfo?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">{isAr ? "وصول غير مصرح" : "Access Denied"}</div>;
    }

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={isAr ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Layers className="w-8 h-8 text-primary" />
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
                    {isAr ? "إضافة خدمة جديدة" : "Add New Service"}
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((svc) => (
                    <div key={svc.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                        <div className="relative h-48 bg-gray-100">
                            {/* Use simple placeholder if image URL is invalid */}
                            {svc.image ? (
                                <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-black text-gray-900 mb-2">{svc.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{svc.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isAr ? "محتويات الخدمة" : "Service Contents"}</div>
                                {svc.contents.slice(0, 3).map((c) => (
                                    <div key={c.id} className="flex items-start gap-2 text-sm text-gray-600">
                                        <List className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span>{c.name}</span>
                                    </div>
                                ))}
                                {svc.contents.length > 3 && (
                                    <div className="text-xs text-primary font-bold px-6">
                                        +{svc.contents.length - 3} {isAr ? "أخرى" : "more"}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <Button onClick={() => handleOpenEdit(svc)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => handleDelete(svc.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-6">
                                {isEditing ? (isAr ? "تعديل الخدمة" : "Edit Service") : (isAr ? "إضافة خدمة جديدة" : "Add New Service")}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "اسم الخدمة بالعربية" : "Service Name (Arabic)"}</label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الاسم بالإنجليزية" : "Name (English)"}</label>
                                        <Input value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "صورة الخدمة" : "Service Image"}</label>
                                    <div className="flex gap-4 items-center">
                                        {formData.image && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="relative flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full py-4 px-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold hover:bg-gray-100 hover:border-primary/50 transition-all flex items-center justify-center gap-2">
                                                <ImageIcon className="w-5 h-5" />
                                                <span>{isAr ? "اختر صورة..." : "Choose image..."}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "الوصف بالعربية" : "Description (Arabic)"}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[100px] outline-none resize-none"
                                        required
                                        dir="rtl"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الوصف بالإنجليزية" : "Description (English)"}</label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[80px] outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 flex justify-between items-center">
                                        {isAr ? "محتويات الخدمة (أنواع الخدمات)" : "Service Contents (Service Types)"}
                                        <button type="button" onClick={addContent} className="text-primary text-xs hover:underline flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> {isAr ? "إضافة محتوى" : "Add Content"}
                                        </button>
                                    </label>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.contents.map((content, index) => (
                                            <div key={index} className="border border-gray-200 rounded-2xl p-4 space-y-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-gray-400">{isAr ? `محتوى ${index + 1}` : `Content ${index + 1}`}</span>
                                                    <button type="button" onClick={() => removeContent(index)} className="p-1 text-red-400 hover:text-red-600">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <Input
                                                    value={content.name}
                                                    onChange={e => handleContentChange(index, 'name', e.target.value)}
                                                    className="rounded-xl bg-gray-50 border-none font-bold text-sm"
                                                    placeholder={isAr ? "النص بالعربية" : "Arabic text"}
                                                    dir="rtl"
                                                />
                                                <div className="grid grid-cols-1 gap-2">
                                                    <Input
                                                        value={content.name_en}
                                                        onChange={e => handleContentChange(index, 'name_en', e.target.value)}
                                                        className="rounded-xl bg-gray-50 border-none font-bold text-xs"
                                                        placeholder="🇬🇧 English"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button type="submit" className="flex-1 py-8 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                                        {isAr ? "حفظ" : "Save"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 py-8 rounded-2xl font-black border-2 border-gray-100">
                                        {isAr ? "إلغاء" : "Cancel"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </section>
    );
}
