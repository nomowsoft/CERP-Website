"use client";
import Link from 'next/link';
import {
    LayoutDashboard,
    Globe,
    FileText,
    LogOut,
    X,
    Settings,
    Users

} from 'lucide-react';
import { motion } from "framer-motion";
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState } from 'react';
import { getUser } from '@/app/store/slices/userSlice';
import { logoutUser } from '@/app/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const [activeTab, setActiveTab] = useState("profile");
    const locale = useLocale();
    const t = useTranslations('dashboard');
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(getUser());
    }, [dispatch]);

    const { userInfo } = useSelector((state: any) => state.user);
    const handleLogout = async () => {
        const result = await dispatch(logoutUser());
        if (logoutUser.fulfilled.match(result)) {
            router.push(`/${locale}/login`);
        }
    };

    const navItems = [
        { id: "profile", label: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard },
        { id: "invoice", label: t('nav.invoices'), href: '/admin/invoice', icon: Globe },
        { id: "subscription", label: t('nav.subscriptions'), href: '/admin/subscription', icon: FileText },
        { id: "users", label: t('nav.users' as any), href: '/admin/users', icon: Users, adminOnly: true },
        { id: "settings", label: t('nav.settings'), href: '/admin/settings', icon: Settings },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || userInfo?.role === 'ADMIN');

    return (
        <aside className={`w-70 text-white h-screen flex flex-col border-e border-white/10 bg-white shadow-xl lg:shadow-none`}>
            <div className="flex items-center justify-between px-6 pt-5 lg:block lg:text-center">
                <Link href="/" className="text-4xl font-doto2 text-gray-700" >
                    <span>
                        نظام 
                    </span>
                    <span className="bg-gradient-to-l mx-1 from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">
                        سِرب
                    </span>
                </Link>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-4 text-center bg-info shadow-2xl m-5 rounded-3xl flex items-center">
                <div>
                    <Image src="/admin/user.svg" alt="..." width={100} height={50} />
                </div>
                <div className="w-40">
                    <h2 className="text-2xl font-bold  text-gray-700 ">
                        {userInfo.name || (locale === 'ar' ? 'جاري التحميل...' : 'loading...')}
                    </h2>
                    <p className="text-gray-500 mt-2 truncate">
                        {userInfo.charityName || (locale === 'ar' ? 'جاري التحميل...' : 'loading...')}
                    </p>
                </div>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
                {filteredNavItems.map((item) => (
                    <Link
                        key={item.label}
                        href={`/${locale}${item.href}`}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-5 text-lg font-doto2 rounded-[1.5rem] transition-all duration-500 relative group mb-1 last:mb-0
                            ${activeTab === item.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
                        `}
                    >
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="activeTabGlow"
                                className="absolute inset-0 shadow-xl shadow-gray-200/50 rounded-[1.5rem]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-4" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
                <LanguageSwitcher />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-100 hover:bg-red-500 hover:text-red-50 text-red-500 transition-colors w-full group"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('logout')}</span>
                </button>
            </div>
        </aside>
    );
}
