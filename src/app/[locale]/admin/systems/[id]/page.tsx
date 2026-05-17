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
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SystemFormPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const t = useTranslations("admin.systems");
  const router = useRouter();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    name_en: "",
    description: "",
    description_ar: "",
    description_en: "",
    icon: "",
    price: 0,
    modules: [] as string[],
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [allSystems, setAllSystems] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAllSystems = async () => {
    try {
      const resp = await axios.get("/api/systems");
      setAllSystems(resp.data);
    } catch (err) {
      console.error("Failed to fetch all systems", err);
    }
  };

  const fetchSystem = async () => {
    try {
      const resp = await axios.get(`/api/systems/${id}`);
      setFormData(resp.data);
    } catch (err) {
      console.error("Failed to fetch system", err);
      toast.error("Failed to load system details");
      router.push(`/${locale}/admin/systems`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSystems();
    if (!isNew) {
      fetchSystem();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await axios.post("/api/systems", formData);
        toast.success(t("createSuccess"));
      } else {
        await axios.put(`/api/systems/${id}`, formData);
        toast.success(t("updateSuccess"));
      }
      router.push(`/${locale}/admin/systems`);
      router.refresh();
    } catch (err) {
      toast.error("Failed to save system");
    } finally {
      setSaving(false);
    }
  };

  const currentIndex = allSystems.findIndex((s) => s.id === parseInt(id));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allSystems.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      router.push(
        `/${locale}/admin/systems/${allSystems[currentIndex - 1].id}`,
      );
    }
  };

  const handleNext = () => {
    if (hasNext) {
      router.push(
        `/${locale}/admin/systems/${allSystems[currentIndex + 1].id}`,
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(locale === 'ar' ? "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" : "Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
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
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 space-y-4 shrink-0">
        <Link
          href={`/${locale}/admin/systems`}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft
            className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`}
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
            {allSystems.map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/admin/systems/${s.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${parseInt(id) === s.id ? "bg-primary/5 text-primary border-s-4 border-s-primary" : "text-gray-600"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${parseInt(id) === s.id ? "bg-primary/10" : "bg-gray-100"}`}
                >
                  {s.icon ? (
                    <img
                      src={s.icon}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layers className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="font-medium truncate flex-1 text-sm">
                  {locale === "ar" ? s.name_ar : s.name_en}
                </span>
                {locale === "ar" ? (
                  <ChevronLeft className="w-4 h-4 opacity-30" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-30" />
                )}
              </Link>
            ))}
          </div>
          <Link
            href={`/${locale}/admin/systems/new`}
            className="flex items-center justify-center gap-2 p-6 bg-gray-50 hover:bg-gray-100 text-primary font-bold transition-colors w-full rounded-none"
          >
            <PlusIcon size={18} />
            {t("newSystem")}
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
                  {isNew ? t("addSystem") : t("editSystem")}
                </h2>
                {!isNew && <p className="text-gray-500 text-sm">ID: #{id}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isNew && (
                <div className="flex items-center gap-1.5 mr-4 rtl:ml-4 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-gray-200 pr-4 rtl:pl-4 rtl:pr-0">
                  <button
                    type="button"
                    onClick={locale === "ar" ? handleNext : handlePrev}
                    disabled={locale === "ar" ? !hasNext : !hasPrev}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={locale === "ar" ? handlePrev : handleNext}
                    disabled={locale === "ar" ? !hasPrev : !hasNext}
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
                <span className="font-bold">{t("save")}</span>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2 mb-4">
                <Info className="w-5 h-5" />
                <span>{t("nameLabel")}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Name (Default)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="System Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                      {locale === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'}
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name_en}
                      onChange={(e) =>
                        setFormData({ ...formData, name_en: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="System English Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {locale === 'ar' ? 'أيقونة النظام' : 'System Icon'}
                  </label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-3xl hover:border-primary/50 transition-colors bg-gray-50/50 group">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                      {formData.icon ? (
                        <>
                          <img
                            src={formData.icon}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: "" })}
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
                        {locale === 'ar' ? 'اختر صورة' : 'Choose Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                    الاسم (بالعربية)
                  </label>
                  <input
                    required
                    dir="rtl"
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, name_ar: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                    placeholder="اسم النظام"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    {locale === 'ar' ? 'الوحدات / الموديولات (Addons)' : 'Modules / Units (Addons)'}
                  </label>
                  
                  <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    {formData.modules && formData.modules.length > 0 ? (
                      formData.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-white text-primary rounded-lg border border-primary/10 shadow-sm animate-in zoom-in-95 duration-200"
                        >
                          <span className="font-mono text-[11px] font-bold">{module}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newModules = [...formData.modules];
                              newModules.splice(index, 1);
                              setFormData({ ...formData, modules: newModules });
                            }}
                            className="hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic p-2 self-center">
                        {locale === 'ar' ? 'لم يتم إضافة موديولات' : 'No modules added'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newModuleInputMain"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const val = input.value.trim();
                          if (val && !formData.modules.includes(val)) {
                            setFormData({ ...formData, modules: [...formData.modules, val] });
                            input.value = "";
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder={locale === 'ar' ? "أضف موديول (Enter)" : "Add module (Enter)"}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newModuleInputMain') as HTMLInputElement;
                        const val = input.value.trim();
                        if (val && !formData.modules.includes(val)) {
                          setFormData({ ...formData, modules: [...formData.modules, val] });
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-xs"
                    >
                      {locale === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {locale === 'ar' ? 'السعر' : 'Price'}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold">
                      {locale === 'ar' ? 'ر.س' : 'SAR'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2 mb-4">
                <FileText className="w-5 h-5" />
                <span>{t("descLabel")}</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                    الوصف (بالعربية)
                  </label>
                  <textarea
                    dir="rtl"
                    rows={4}
                    value={formData.description_ar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description_ar: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right resize-none"
                    placeholder="اكتب وصفاً للنظام هنا..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                    Description (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description_en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description_en: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Write system description in English..."
                  />
                </div>
              </div>
            </section>
            
            {/* End of Section */}
          </div>
        </div>

        {!isNew && (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="text-red-900 font-bold">منطقة الخطر</h4>
              <p className="text-red-700 text-sm">
                حذف هذا النظام سيؤدي لإزالته من جميع الباقات المرتبطة به.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-bold"
            >
              {t("delete")}
            </button>
          </div>
        )}
      </form>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          try {
            await axios.delete(`/api/systems/${id}`);
            toast.success(t("deleteSuccess"));
            router.push(`/${locale}/admin/systems`);
            router.refresh();
          } catch (err) {
            toast.error("Failed to delete system");
          } finally {
            setShowDeleteModal(false);
          }
        }}
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

function Plus({ size }: { size: number }) {
  return <PlusIcon size={size} />;
}

import { Plus as PlusIcon, FileText } from "lucide-react";
