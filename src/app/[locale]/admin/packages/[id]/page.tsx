"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getPackages, createPackage, updatePackage, Package } from "@/app/store/slices/packagesSlice";
import { getSystems } from "@/app/store/slices/systemsSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    ArrowLeft,
    Save,
    X,
    Package as PackageIcon,
    Check,
    Plus,
    Image as ImageIcon,
    Settings2,
    Layers,
    Info,
    LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function PackageFormPage() {
    const { id, locale } = useParams();
    const isNew = id === "new";
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const t = useTranslations('admin.packages');
    const isAr = locale === 'ar';

    const { packages } = useSelector((state: RootState) => state.packages);
    const { systems } = useSelector((state: RootState) => state.systems);
    const { userInfo } = useSelector((state: RootState) => state.user);

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

    useEffect(() => {
        if (!isNew && packages.length > 0) {
            const pkg = packages.find(p => p.id === Number(id));
            if (pkg) {
                setFormData({
                    name: pkg.name,
                    name_en: pkg.name_en || "",
                    type: pkg.type,
                    description: pkg.description,
                    description_en: pkg.description_en || "",
                    image: pkg.image,
                    price: pkg.price.toString(),
                    currency: pkg.currency || "SAR",
                    features: (pkg.features && pkg.features.length > 0) 
                        ? pkg.features.map(f => ({ text: f.text, text_en: f.text_en || "" })) 
                        : [{ text: "", text_en: "" }],
                    systemIds: pkg.systems ? pkg.systems.map(s => s.id) : []
                });
            }
        }
    }, [id, isNew, packages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cleanFeatures = formData.features.filter(f => f.text.trim() !== "");
            const payload = { ...formData, features: cleanFeatures };

            if (isNew) {
                await dispatch(createPackage(payload)).unwrap();
                toast.success(isAr ? "تم إنشاء الباقة بنجاح" : "Package created successfully");
            } else {
                await dispatch(updatePackage({ id: Number(id), data: payload })).unwrap();
                toast.success(isAr ? "تم تحديث الباقة بنجاح" : "Package updated successfully");
            }
            router.push(`/${locale}/admin/packages`);
        } catch (error: any) {
            toast.error(error || (isAr ? "حدث خطأ ما" : "Something went wrong"));
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
        <section className="container mx-auto p-4 lg:p-8 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-primary transition-all group"
                    >
                        <ArrowLeft className={`w-6 h-6 ${isAr ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <PackageIcon className="w-8 h-8 text-primary" />
                            {isNew ? (isAr ? "باقة جديدة" : "New Package") : (isAr ? "تعديل الباقة" : "Edit Package")}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            {isNew ? (isAr ? "أضف تفاصيل الباقة الجديدة هنا" : "Add new package details here") : (isAr ? "قم بتحديث بيانات الباقة" : "Update package details")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => router.back()}
                        className="px-6 py-6 rounded-2xl border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
                    >
                        {isAr ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className="px-8 py-6 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {isAr ? "حفظ التغييرات" : "Save Changes"}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Info className="w-6 h-6 text-primary" />
                            {isAr ? "المعلومات الأساسية" : "Basic Information"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "الاسم بالعربية" : "Name (Arabic)"}</label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الاسم بالإنجليزية" : "Name (English)"}</label>
                                <Input value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "نوع الباقة" : "Package Type"}</label>
                                <select 
                                    value={formData.type} 
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full py-3 px-4 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all h-[52px]"
                                >
                                    <option value="STARTER">Starter</option>
                                    <option value="BUSINESS">Business</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "السعر" : "Price"}</label>
                                    <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "العملة" : "Currency"}</label>
                                    <Input value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold" required />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "الوصف بالعربية" : "Description (Arabic)"}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[120px] outline-none resize-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    required
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الوصف بالإنجليزية" : "Description (English)"}</label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[100px] outline-none resize-none focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Check className="w-6 h-6 text-primary" />
                                {isAr ? "المميزات والخصائص" : "Features & Characteristics"}
                            </h2>
                            <button 
                                type="button" 
                                onClick={addFeature}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {isAr ? "إضافة ميزة" : "Add Feature"}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.features.map((feature, index) => (
                                <motion.div 
                                    layout
                                    key={index} 
                                    className="group relative bg-gray-50 p-5 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
                                >
                                    <button 
                                        type="button" 
                                        onClick={() => removeFeature(index)}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-400 rounded-full shadow-lg border border-red-50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">🇸🇦 {isAr ? "النص بالعربية" : "Arabic Text"}</label>
                                            <Input
                                                value={feature.text}
                                                onChange={e => handleFeatureChange(index, 'text', e.target.value)}
                                                className="rounded-xl bg-white border-gray-100 font-bold text-sm"
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">🇬🇧 {isAr ? "النص بالإنجليزية" : "English Text"}</label>
                                            <Input
                                                value={feature.text_en}
                                                onChange={e => handleFeatureChange(index, 'text_en', e.target.value)}
                                                className="rounded-xl bg-white border-gray-100 font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Content (Right) */}
                <div className="space-y-8">
                    {/* Media Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-primary" />
                            {isAr ? "صورة الباقة" : "Package Image"}
                        </h2>
                        <div className="space-y-4">
                            <div className="aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group cursor-pointer">
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-bold text-sm">{isAr ? "تغيير الصورة" : "Change Image"}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                                        <ImageIcon className="w-12 h-12" />
                                        <p className="text-xs font-bold px-4 text-center">{isAr ? "اضغط لرفع صورة الباقة" : "Click to upload package image"}</p>
                                    </div>
                                )}
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
                            </div>
                            {formData.image && (
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({ ...formData, image: "" })}
                                    className="w-full py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    {isAr ? "حذف الصورة" : "Delete Image"}
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Associated Systems Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Settings2 className="w-6 h-6 text-primary" />
                            {isAr ? "الأنظمة المرتبطة" : "Associated Systems"}
                        </h2>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {systems.map((system) => (
                                <label 
                                    key={system.id} 
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${formData.systemIds.includes(system.id) ? 'bg-primary/5 border-primary shadow-sm shadow-primary/10' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-lg'}`}
                                >
                                    <div className="relative flex items-center justify-center">
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
                                            className="w-6 h-6 rounded-lg accent-primary cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-black truncate ${formData.systemIds.includes(system.id) ? 'text-primary' : 'text-gray-700'}`}>
                                            {isAr ? system.name_ar : system.name_en}
                                        </p>
                                    </div>
                                </label>
                            ))}
                            {systems.length === 0 && (
                                <div className="text-center py-8 text-gray-400 italic text-sm">
                                    {isAr ? "لا توجد أنظمة" : "No systems found"}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </form>
        </section>
    );
}
