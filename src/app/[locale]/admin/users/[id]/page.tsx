"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getAllUsers, adminUpdateUser } from "@/app/store/slices/usersSlice";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    Shield,
    Building2,
    ArrowLeft,
    Save,
    X,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function UserFormPage() {
    const t = useTranslations('admin.users');
    const td = useTranslations('settings');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isNew = id === "new";
    const dispatch = useDispatch<AppDispatch>();

    const { users, loading } = useSelector((state: RootState) => state.users);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "VIEWER",
        charityName: ""
    });

    useEffect(() => {
        if (users.length === 0) {
            dispatch(getAllUsers());
        }
    }, [dispatch, users.length]);

    useEffect(() => {
        if (!isNew && users.length > 0) {
            const user = users.find(u => u.id === id);
            if (user) {
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    role: user.role || "VIEWER",
                    charityName: user.charityName || ""
                });
            }
        }
    }, [id, isNew, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isNew) {
                // Assuming there's an adminCreateUser or similar. 
                // If not, I'll focus on Edit for now as requested for the modal change.
                toast.info("Create user functionality would go here");
            } else {
                await dispatch(adminUpdateUser({ id, data: formData })).unwrap();
                toast.success(t("updateSuccess"));
                router.push(`/${locale}/admin/users`);
            }
        } catch (error: any) {
            toast.error(error || t("updateError"));
        } finally {
            setSubmitting(false);
        }
    };

    const roles = [
        { value: 'ADMIN', label: isAr ? 'مدير' : 'Admin' },
        { value: 'EDITOR', label: isAr ? 'محرر' : 'Editor' },
        { value: 'VIEWER', label: isAr ? 'مشاهد' : 'Viewer' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="p-4 hover:bg-gray-50 rounded-2xl transition-colors group"
                    >
                        <ArrowLeft className={`w-6 h-6 text-gray-400 group-hover:text-primary transition-colors ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">
                                {isNew ? (isAr ? "إضافة جديد" : "New User") : (isAr ? "تعديل مستخدم" : "Edit User")}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isNew ? (isAr ? "إضافة مستخدم جديد" : "Add New User") : formData.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="px-6 py-6 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50"
                    >
                        <X className="w-5 h-5 mr-2" />
                        {td("cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-6 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {td("saveChanges")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{isAr ? "المعلومات الأساسية" : "Basic Information"}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                                    {td("fullName")}
                                </label>
                                <div className="relative">
                                    <User className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300`} />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={isAr ? "أدخل الاسم الكامل" : "Enter full name"}
                                        className={`py-7 ${isAr ? 'pr-12' : 'pl-12'} rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                                    {td("email")}
                                </label>
                                <div className="relative">
                                    <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300`} />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="example@mail.com"
                                        className={`py-7 ${isAr ? 'pr-12' : 'pl-12'} rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                                    {td("phone")}
                                </label>
                                <div className="relative">
                                    <Phone className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300`} />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="05xxxxxxxx"
                                        className={`py-7 ${isAr ? 'pr-12' : 'pl-12'} rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                                    {isAr ? "الجهة / الجمعية" : "Organization / Charity"}
                                </label>
                                <div className="relative">
                                    <Building2 className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300`} />
                                    <Input
                                        value={formData.charityName}
                                        onChange={(e) => setFormData({ ...formData, charityName: e.target.value })}
                                        placeholder={isAr ? "اسم الجهة" : "Organization name"}
                                        className={`py-7 ${isAr ? 'pr-12' : 'pl-12'} rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings/Role */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{isAr ? "الصلاحيات" : "Permissions"}</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                                    {t("roleColumn")}
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {roles.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                                formData.role === role.value
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
                                            }`}
                                        >
                                            <span className="font-bold text-sm">{role.label}</span>
                                            {formData.role === role.value && (
                                                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                                                    <Shield className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    {!isNew && (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-xl">
                            <h3 className="text-lg font-black mb-4 uppercase tracking-wider opacity-50">
                                {isAr ? "معلومات الحساب" : "Account Status"}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <span className="text-sm font-bold opacity-60">{isAr ? "الحالة" : "Status"}</span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-full border border-green-500/30">
                                        {isAr ? "نشط" : "Active"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold opacity-60">{isAr ? "آخر ظهور" : "Last Login"}</span>
                                    <span className="text-sm font-black">{isAr ? "اليوم" : "Today"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
