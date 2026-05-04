"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getPackages, createPackage, updatePackage, deletePackage, Package } from "@/app/store/slices/packagesSlice";
import { getSystems } from "@/app/store/slices/systemsSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    Package as PackageIcon,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Image as ImageIcon,
    List,
    Settings2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function PackagesManagement() {
    const t = useTranslations('admin.packages');
    const td = useTranslations('dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { packages, loading } = useSelector((state: RootState) => state.packages);
    const { systems } = useSelector((state: RootState) => state.systems);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        type: "STARTER",
        description: "",
        description_en: "",
        image: "",
        price: "",
        currency: "SAR",
        features: [{ text: "", text_en: "" }],
        systemIds: [] as number[]
    });

    useEffect(() => {
        dispatch(getPackages());
        dispatch(getSystems());
    }, [dispatch]);

    const resetForm = () => {
        setFormData({
            name: "",
            name_en: "",
            type: "STARTER",
            description: "",
            description_en: "",
            image: "",
            price: "",
            currency: "SAR",
            features: [{ text: "", text_en: "" }],
            systemIds: []
        });
        setIsEditing(false);
        setSelectedPackage(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setViewMode('FORM');
    };

    const handleOpenEdit = (pkg: Package) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            name_en: pkg.name_en || "",
            type: pkg.type,
            description: pkg.description,
            description_en: pkg.description_en || "",
            image: pkg.image,
            price: pkg.price.toString(),
            currency: pkg.currency || "SAR",
            features: (pkg.features && pkg.features.length > 0) ? pkg.features.map(f => ({ text: f.text, text_en: f.text_en || "" })) : [{ text: "", text_en: "" }],
            systemIds: pkg.systems ? pkg.systems.map(s => s.id) : []
        });
        setIsEditing(true);
        setViewMode('FORM');
    };

    const currentIndex = selectedPackage ? packages.findIndex((p: any) => p.id === selectedPackage.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < packages.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            handleOpenEdit(packages[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            handleOpenEdit(packages[currentIndex + 1]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Filter empty features
            const cleanFeatures = formData.features.filter(f => f.text.trim() !== "");
            const payload = { ...formData, features: cleanFeatures };

            if (isEditing && selectedPackage) {
                await dispatch(updatePackage({ id: selectedPackage.id, data: payload })).unwrap();
                toast.success(isAr ? "تم تحديث الباقة بنجاح" : "Package updated successfully");
            } else {
                await dispatch(createPackage(payload)).unwrap();
                toast.success(isAr ? "تم إنشاء الباقة بنجاح" : "Package created successfully");
            }
            setViewMode('LIST');
            resetForm();
        } catch (error: any) {
            toast.error(error || (isAr ? "حدث خطأ ما" : "Something went wrong"));
        }
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
        }
    };

    const handleFeatureChange = (index: number, field: 'text' | 'text_en', value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, { text: "", text_en: "" }] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    if (userInfo?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">{isAr ? "وصول غير مصرح" : "Access Denied"}</div>;
    }

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={isAr ? 'rtl' : 'ltr'}>

            {viewMode === 'LIST' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
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
                        {packages.map((pkg) => (
                            <div 
                                key={pkg.id} 
                                onClick={() => handleOpenEdit(pkg)}
                                className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col"
                            >
                                <div className="relative h-56 bg-gray-50 overflow-hidden shrink-0">
                                    {/* Image with zoom effect */}
                                    {pkg.image ? (
                                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:bg-primary/5 transition-colors duration-500">
                                            <ImageIcon className="w-16 h-16 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {/* Price Badge */}
                                    <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-black shadow-lg transform group-hover:-translate-y-1 transition-transform duration-500">
                                        <span className="text-primary mr-1">{pkg.currency}</span> {pkg.price}
                                    </div>
                                </div>
                                
                                <div className="p-8 flex flex-col flex-1 relative bg-white">
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors">{pkg.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{pkg.description}</p>

                                    <div className="space-y-4 mb-8 flex-1">
                                        {pkg.features.slice(0, 3).map((f) => (
                                            <div key={f.id} className="flex items-start gap-3 text-sm text-gray-600">
                                                <div className="p-1.5 bg-green-50 rounded-full mt-0.5 group-hover:bg-green-100 transition-colors shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                </div>
                                                <span className="font-semibold leading-snug">{f.text}</span>
                                            </div>
                                        ))}
                                        {pkg.features.length > 3 && (
                                            <div className="text-xs text-primary font-black px-9 pt-2">
                                                +{pkg.features.length - 3} {isAr ? "مميزات أخرى" : "more features"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons (Reveal on Hover) */}
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
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col lg:flex-row gap-8"
                >
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-80 shrink-0 space-y-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => { setViewMode('LIST'); resetForm(); }} 
                            className="flex items-center gap-2 text-gray-500 hover:text-primary hover:bg-transparent px-0 transition-colors mb-2 group w-full justify-start"
                        >
                            <ArrowLeft className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
                            <span className="font-medium text-lg">{isAr ? "العودة للقائمة" : "Back to List"}</span>
                        </Button>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-primary" />
                                    {isAr ? "إدارة الباقات" : "Manage Packages"}
                                </h3>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                {packages.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleOpenEdit(p)}
                                        className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${selectedPackage?.id === p.id ? 'bg-primary/5 text-primary border-s-4 border-s-primary' : 'text-gray-600'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${selectedPackage?.id === p.id ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 opacity-50" />}
                                        </div>
                                        <span className="font-medium truncate flex-1 text-sm">
                                            {p.name}
                                        </span>
                                        {locale === 'ar' ? <ChevronLeft className="w-4 h-4 opacity-30" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => { resetForm(); setViewMode('FORM'); }}
                                className="flex items-center justify-center gap-2 p-6 bg-gray-50 hover:bg-gray-100 text-primary font-bold transition-colors w-full rounded-none"
                            >
                                <Plus size={18} />
                                {isAr ? "باقة جديدة" : "New Package"}
                            </Button>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex-1">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">
                                        {isEditing ? (isAr ? "تعديل الباقة" : "Edit Package") : (isAr ? "إضافة باقة جديدة" : "Add New Package")}
                                    </h3>
                                    {isEditing && selectedPackage && (
                                        <p className="text-gray-500 text-sm font-bold mt-1">
                                            {selectedPackage.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {isEditing && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button 
                                        variant="outline" 
                                        onClick={isAr ? handleNext : handlePrev} 
                                        disabled={isAr ? !hasNext : !hasPrev}
                                        className="p-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={isAr ? handlePrev : handleNext} 
                                        disabled={isAr ? !hasPrev : !hasNext}
                                        className="p-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "الاسم بالعربية" : "Name (Arabic)"}</label>
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الاسم بالإنجليزية" : "Name (English)"}</label>
                                        <Input value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "نوع الباقة" : "Package Type"}</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full py-3 px-4 rounded-2xl bg-gray-50 border-none font-bold outline-none">
                                            <option value="STARTER">Starter</option>
                                            <option value="BUSINESS">Business</option>
                                            <option value="ENTERPRISE">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "السعر" : "Price"}</label>
                                        <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "العملة" : "Currency"}</label>
                                        <Input value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "صورة الباقة" : "Package Image"}</label>
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
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الوصف بالإنجليزية" : "Description (English)"}</label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[80px] outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 flex justify-between items-center">
                                        {isAr ? "المميزات" : "Features"}
                                        <button type="button" onClick={addFeature} className="text-primary text-xs hover:underline flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> {isAr ? "إضافة ميزة" : "Add Feature"}
                                        </button>
                                    </label>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="border border-gray-200 rounded-2xl p-4 space-y-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-gray-400">{isAr ? `ميزة ${index + 1}` : `Feature ${index + 1}`}</span>
                                                    <button type="button" onClick={() => removeFeature(index)} className="p-1 text-red-400 hover:text-red-600">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <Input
                                                    value={feature.text}
                                                    onChange={e => handleFeatureChange(index, 'text', e.target.value)}
                                                    className="rounded-xl bg-gray-50 border-none font-bold text-sm"
                                                    placeholder={isAr ? "النص بالعربية 🇸🇦" : "Arabic text"}
                                                    dir="rtl"
                                                />
                                                <div className="grid grid-cols-1 gap-2">
                                                    <Input
                                                        value={feature.text_en}
                                                        onChange={e => handleFeatureChange(index, 'text_en', e.target.value)}
                                                        className="rounded-xl bg-gray-50 border-none font-bold text-xs"
                                                        placeholder="🇬🇧 English"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <Settings2 className="w-4 h-4" />
                                        {isAr ? "الأنظمة المرتبطة" : "Associated Systems"}
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                        {systems.map((system) => (
                                            <label key={system.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/30 cursor-pointer transition-all group">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.systemIds.includes(system.id)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            systemIds: checked
                                                                ? [...prev.systemIds, system.id]
                                                                : prev.systemIds.filter(id => id !== system.id)
                                                        }));
                                                    }}
                                                    className="w-5 h-5 accent-primary cursor-pointer"
                                                />
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                                                    {isAr ? system.name_ar || system.name : system.name_en || system.name}
                                                </span>
                                            </label>
                                        ))}
                                        {systems.length === 0 && (
                                            <div className="col-span-full py-4 text-center text-gray-400 font-bold text-sm italic">
                                                {isAr ? "لا يوجد أنظمة متاحة حالياً" : "No systems available currently"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <Button type="submit" className="flex-1 py-8 rounded-2xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                                        {isAr ? "حفظ" : "Save"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => { setViewMode('LIST'); resetForm(); }} className="flex-1 py-8 rounded-2xl text-lg font-black border-2 border-gray-100 hover:bg-gray-50">
                                        {isAr ? "إلغاء" : "Cancel"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                </motion.div>
            )}

            {/* Delete Confirmation Dialog */}
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
