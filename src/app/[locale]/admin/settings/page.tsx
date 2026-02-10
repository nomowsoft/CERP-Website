"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { getUser, updateUser } from "@/app/store/slices/userSlice";
import { motion } from "framer-motion";
import {
    User,
    Building2,
    ShieldCheck,
    Mail,
    Phone,
    Lock,
    Save,
    Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image";

export default function SettingsPage() {
    const t = useTranslations('settings');
    const locale = useLocale();
    const dispatch = useDispatch<AppDispatch>();
    const { userInfo, loading } = useSelector((state: any) => state.user);

    const [activeTab, setActiveTab] = useState("profile");
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        phone: "",
        charityName: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        dispatch(getUser());
    }, [dispatch]);

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || "",
                email: userInfo.email || "",
                phone: userInfo.phone || "",
                charityName: userInfo.charityName || "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [userInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (activeTab === "security" && formData.password) {
            if (formData.password !== formData.confirmPassword) {
                toast.error(t('passwordMismatch'));
                return;
            }
        }

        try {
            await dispatch(updateUser({ id: userInfo.id, data: formData })).unwrap();
            toast.success(t('successUpdate'));
        } catch (error: any) {
            toast.error(error || t('errorUpdate'));
        }
    };

    const tabs = [
        { id: "profile", label: t('profile'), icon: User },
        { id: "organization", label: t('organization'), icon: Building2 },
        { id: "security", label: t('security'), icon: ShieldCheck },
    ];

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{t('title')}</h1>
                <p className="text-gray-500 text-lg max-w-2xl">{t('subtitle')}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Tabs */}
                <div className="lg:w-80 shrink-0">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-3 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 sticky top-24">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 relative group mb-1 last:mb-0
                                    ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
                                `}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-white shadow-xl shadow-gray-200/50 rounded-[1.5rem]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className={`w-6 h-6 relative z-10 transition-all duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-extrabold relative z-10 text-base">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/60 p-10 md:p-16 relative overflow-hidden min-h-[600px] border border-gray-50"
                    >
                        {/* Premium Gradient Blobs */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 h-full flex flex-col">
                            {activeTab === "profile" && (
                                <div className="space-y-12">
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-50 border-8 border-white shadow-2xl transition-transform group-hover:scale-105 duration-500">
                                                <Image src="/admin/user.svg" alt="Avatar" width={160} height={160} className="object-cover" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-center md:text-start">
                                            <h3 className="text-3xl font-black text-gray-900 mb-1">{formData.name}</h3>
                                            <p className="text-primary font-bold text-lg">{t('personalInfo')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('fullName')}</label>
                                            <div className="relative group">
                                                <User className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('email')}</label>
                                            <div className="relative group">
                                                <Mail className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('phone')}</label>
                                            <div className="relative group">
                                                <Phone className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                                <Input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "organization" && (
                                <div className="space-y-12">
                                    <div className="bg-gradient-to-br from-primary/10 to-transparent p-10 rounded-[3rem] border border-primary/10 flex items-center gap-8">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-primary/5">
                                            <Building2 className="w-10 h-10 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-1">{formData.charityName}</h3>
                                            <p className="text-primary font-bold">{t('orgInfo')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-w-xl">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('charityName')}</label>
                                        <div className="relative group">
                                            <Building2 className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                            <Input
                                                name="charityName"
                                                value={formData.charityName}
                                                onChange={handleInputChange}
                                                className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="space-y-12">
                                    <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex gap-6 items-start">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <p className="text-blue-900 text-base font-bold leading-relaxed pt-2">
                                            {t('passwordHint')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('newPassword')}</label>
                                            <div className="relative group">
                                                <Lock className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('confirmPassword')}</label>
                                            <div className="relative group">
                                                <Lock className={`absolute ${locale === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors`} />
                                                <Input
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className={`py-8 ${locale === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-lg shadow-sm`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-auto pt-16 flex justify-end gap-6">
                                <Button
                                    variant="outline"
                                    onClick={() => dispatch(getUser())}
                                    className="px-10 py-8 rounded-[1.5rem] font-black border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-gray-500"
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-12 py-8 rounded-[1.5rem] font-black bg-primary text-white hover:opacity-90 shadow-2xl shadow-primary/30 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-6 h-6" />
                                            {t('saveChanges')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
