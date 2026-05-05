"use client";
import { useEffect, useState, use } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  Save,
  Trash2,
  Layers,
  Settings2,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Info,
  ImageIcon,
  Plus,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ServiceFormPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const t = useTranslations("admin.services");
  const tc = useTranslations("dashboard.common");
  const router = useRouter();
  const isNew = id === "new";
  const isAr = locale === "ar";

  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    price: "",
    currency: "SAR",
    description: "",
    description_en: "",
    image: "",
    contents: [{ name: "", name_en: "" }]
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [allServices, setAllServices] = useState<any[]>([]);

  const fetchAllServices = async () => {
    try {
      const resp = await axios.get("/api/services");
      setAllServices(resp.data);
    } catch (err) {
      console.error("Failed to fetch all services", err);
    }
  };

  const fetchService = async () => {
    try {
      const resp = await axios.get(`/api/services/${id}`);
      const data = resp.data;
      setFormData({
        name: data.name || "",
        name_en: data.name_en || "",
        price: data.price ? data.price.toString() : "",
        currency: data.currency || "SAR",
        description: data.description || "",
        description_en: data.description_en || "",
        image: data.image || "",
        contents: (data.contents && data.contents.length > 0) 
          ? data.contents.map((c: any) => ({ name: c.name, name_en: c.name_en || "" })) 
          : [{ name: "", name_en: "" }]
      });
    } catch (err) {
      console.error("Failed to fetch service", err);
      toast.error(isAr ? "فشل تحميل تفاصيل الخدمة" : "Failed to load service details");
      router.push(`/${locale}/admin/services`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllServices();
    if (!isNew) {
      fetchService();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanContents = formData.contents.filter(c => c.name.trim() !== "");
      const payload = { ...formData, contents: cleanContents };

      if (isNew) {
        await axios.post("/api/services", payload);
        toast.success(isAr ? "تم إنشاء الخدمة بنجاح" : "Service created successfully");
      } else {
        await axios.put(`/api/services/${id}`, payload);
        toast.success(isAr ? "تم تحديث الخدمة بنجاح" : "Service updated successfully");
      }
      router.push(`/${locale}/admin/services`);
      router.refresh();
    } catch (err) {
      toast.error(isAr ? "فشل حفظ الخدمة" : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(isAr ? "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" : "Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
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

  const currentIndex = allServices.findIndex((s) => s.id === parseInt(id));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allServices.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      router.push(`/${locale}/admin/services/${allServices[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      router.push(`/${locale}/admin/services/${allServices[currentIndex + 1].id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 space-y-4 shrink-0">
        <Link
          href={`/${locale}/admin/services`}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft
            className={`w-5 h-5 ${isAr ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`}
          />
          <span className="font-medium">{t("title")}</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              {t("title")}
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {allServices.map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/admin/services/${s.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${parseInt(id) === s.id ? "bg-primary/5 text-primary border-s-4 border-s-primary" : "text-gray-600"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${parseInt(id) === s.id ? "bg-primary/10" : "bg-gray-100"}`}
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layers className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="font-medium truncate flex-1 text-sm">
                  {isAr ? s.name : s.name_en || s.name}
                </span>
                {isAr ? (
                  <ChevronLeft className="w-4 h-4 opacity-30" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-30" />
                )}
              </Link>
            ))}
          </div>
          <Link
            href={`/${locale}/admin/services/new`}
            className="flex items-center justify-center gap-2 p-6 bg-gray-50 hover:bg-gray-100 text-primary font-bold transition-colors w-full rounded-none"
          >
            <Plus size={18} />
            {isAr ? "خدمة جديدة" : "New Service"}
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isNew ? (isAr ? "إضافة خدمة جديدة" : "Add New Service") : (isAr ? "تعديل الخدمة" : "Edit Service")}
                </h2>
                {!isNew && <p className="text-gray-500 text-sm">ID: #{id}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isNew && (
                <div className="flex items-center gap-1.5 mr-4 rtl:ml-4 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-gray-200 pr-4 rtl:pl-4 rtl:pr-0">
                  <button
                    type="button"
                    onClick={isAr ? handleNext : handlePrev}
                    disabled={isAr ? !hasNext : !hasPrev}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={isAr ? handlePrev : handleNext}
                    disabled={isAr ? !hasPrev : !hasNext}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="font-bold">{isAr ? "حفظ" : "Save"}</span>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2 mb-4">
                <Info className="w-5 h-5" />
                <span>{isAr ? "المعلومات الأساسية" : "Basic Information"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                      {isAr ? "اسم الخدمة بالعربية" : "Service Name (Arabic)"}
                    </label>
                    <Input
                      required
                      dir="rtl"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                      {isAr ? "الاسم بالإنجليزية" : "Name (English)"}
                    </label>
                    <Input
                      dir="ltr"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-4 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {isAr ? "صورة الخدمة" : "Service Image"}
                  </label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-3xl hover:border-primary/50 transition-colors bg-gray-50/50 group">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-6 h-6 text-white" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">PNG, JPG (Max 2MB)</p>
                      <label className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-all block">
                        {isAr ? "اختر صورة..." : "Choose image..."}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {isAr ? "السعر" : "Price"}
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                    <div className={`absolute inset-y-0 ${isAr ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none text-gray-400 font-bold`}>
                      {formData.currency}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {isAr ? "العملة" : "Currency"}
                  </label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2 mb-4">
                <FileText className="w-5 h-5" />
                <span>{isAr ? "الوصف" : "Description"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                    {isAr ? "الوصف بالعربية" : "Description (Arabic)"}
                  </label>
                  <textarea
                    dir="rtl"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold resize-none min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                    {isAr ? "الوصف بالإنجليزية" : "Description (English)"}
                  </label>
                  <textarea
                    dir="ltr"
                    rows={4}
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold resize-none min-h-[120px]"
                  />
                </div>
              </div>
            </section>

            {/* Contents Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-primary/10 pb-2 mb-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Layers className="w-5 h-5" />
                  <span>{isAr ? "محتويات الخدمة (أنواع الخدمات)" : "Service Contents (Service Types)"}</span>
                </div>
                <button
                  type="button"
                  onClick={addContent}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {isAr ? "إضافة محتوى" : "Add Content"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {formData.contents.map((content, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeContent(index)}
                        className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {isAr ? `محتوى ${index + 1}` : `Content ${index + 1}`}
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 px-1">{isAr ? "النص بالعربية 🇸🇦" : "Arabic Text 🇸🇦"}</label>
                            <Input
                              value={content.name}
                              onChange={(e) => handleContentChange(index, 'name', e.target.value)}
                              className="bg-white border-none rounded-xl font-bold text-sm h-12"
                              dir="rtl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 px-1">{isAr ? "النص بالإنجليزية 🇬🇧" : "English Text 🇬🇧"}</label>
                            <Input
                              value={content.name_en}
                              onChange={(e) => handleContentChange(index, 'name_en', e.target.value)}
                              className="bg-white border-none rounded-xl font-bold text-sm h-12"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>

        {!isNew && (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="text-red-900 font-bold">{isAr ? "منطقة الخطر" : "Danger Zone"}</h4>
              <p className="text-red-700 text-sm">
                {isAr ? "حذف هذه الخدمة سيؤدي لإزالتها بشكل نهائي من المنصة." : "Deleting this service will permanently remove it from the platform."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm(isAr ? "هل أنت متأكد من حذف هذه الخدمة؟" : "Are you sure you want to delete this service?")) {
                  axios.delete(`/api/services/${id}`).then(() => {
                    toast.success(isAr ? "تم حذف الخدمة بنجاح" : "Service deleted successfully");
                    router.push(`/${locale}/admin/services`);
                  });
                }
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-bold"
            >
              {isAr ? "حذف الخدمة" : "Delete Service"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
