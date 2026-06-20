"use client";
import Link from 'next/link';
import {
    LayoutDashboard,
    Globe,
    FileText,
    LogOut,
    X,
    Settings,
    Users,
    Package,
    Layers,
    Settings2,
    ShoppingBag,
    HelpCircle,
    ChevronDown
} from 'lucide-react';
import { motion } from "framer-motion";
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect, useState, useMemo } from 'react';
import { getUser } from '@/app/store/slices/userSlice';
import { logoutUser } from '@/app/store/slices/userSlice';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const locale = useLocale();
    const t = useTranslations('dashboard');
    const router = useRouter();
    const pathname = usePathname() || "";
    const dispatch = useDispatch<AppDispatch>();

    const activeTab = useMemo(() => {
        if (!pathname) return "profile";
        if (pathname.includes('/admin/invoice')) return "invoice";
        if (pathname.includes('/admin/subscription')) return "subscription";
        if (pathname.includes('/admin/packages')) return "packages";
        if (pathname.includes('/admin/services')) return "services";
        if (pathname.includes('/admin/systems')) return "systems";
        if (pathname.includes('/admin/servers')) return "servers";
        if (pathname.includes('/admin/users')) return "users";
        if (pathname.includes('/admin/clients')) return "clients";
        if (pathname.includes('/admin/faqs')) return "faqs";
        if (pathname.includes('/admin/hero-images')) return "hero-images";
        if (pathname.includes('/admin/settings')) return "settings";
        if (pathname === `/${locale}/admin` || pathname === `/admin`) return "profile";
        return "profile";
    }, [pathname, locale]);

    const [isWebsiteSettingsOpen, setIsWebsiteSettingsOpen] = useState(() => {
        return ["clients", "faqs", "hero-images"].some(tab => pathname.includes(`/admin/${tab}`));
    });

    useEffect(() => {
        dispatch(getUser());
    }, [dispatch]);

    useEffect(() => {
        if (["clients", "faqs", "hero-images"].includes(activeTab)) {
            setIsWebsiteSettingsOpen(true);
        }
    }, [activeTab]);

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
        { id: "packages", label: t('nav.packages' as any), href: '/admin/packages', icon: Package, adminOnly: true },
        { id: "services", label: t('nav.services' as any), href: '/admin/services', icon: Layers, adminOnly: true },
        { id: "systems", label: t('nav.systems' as any), href: '/admin/systems', icon: Settings2, adminOnly: true },
        { id: "servers", label: t('nav.servers' as any), href: '/admin/servers', icon: ShoppingBag, adminOnly: true },
        { id: "users", label: t('nav.users' as any), href: '/admin/users', icon: Users, adminOnly: true },
        {
            id: "website-settings",
            label: t('nav.websiteSettings' as any),
            icon: Settings,
            adminOnly: true,
            isDropdown: true,
            subItems: [
                { id: "clients", label: t('nav.clients' as any), href: '/admin/clients', icon: Users },
                { id: "faqs", label: t('nav.faqs' as any), href: '/admin/faqs', icon: HelpCircle },
                { id: "hero-images", label: t('nav.heroImages' as any), href: '/admin/hero-images', icon: Globe }
            ]
        },
        { id: "settings", label: t('nav.settings'), href: '/admin/settings', icon: Settings },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || userInfo?.role === 'ADMIN');

    return (
        <aside className={`w-70 text-white h-screen flex flex-col border-e border-white/10 bg-white shadow-xl lg:shadow-none`}>
            <div className="flex items-center justify-between px-6 pt-5 lg:block lg:text-center">
                <Link href="/" className="text-4xl font-doto2 text-gray-700" >
                    <span>
                        {t('systemName')}
                    </span>
                    <span className="bg-gradient-to-l mx-1 from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">
                        {t('systemTitle')}
                    </span>
                </Link>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-4 text-center bg-info shadow-lg m-5 rounded-3xl flex items-center">
                <div>
                    <Image src="/admin/user.svg" alt="..." width={80} height={50} />
                </div>
                <div className="w-40">
                    <h2 className="text-2xl font-bold  text-gray-700 truncate">
                        {userInfo?.name || t('loading')}
                    </h2>
                    <p className="text-gray-500 mt-2 truncate">
                        {userInfo?.charityName || t('loading')}
                    </p>
                </div>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
                {filteredNavItems.map((item) => {
                    if (item.isDropdown) {
                        const isOpen = isWebsiteSettingsOpen;
                        return (
                            <div key={item.id} className="space-y-1">
                                <button
                                    onClick={() => setIsWebsiteSettingsOpen(!isOpen)}
                                    className={`w-full flex items-center justify-between px-6 py-5 text-lg rounded-[1.5rem] transition-all duration-500 relative group mb-1
                                        ${["clients", "faqs", "hero-images"].includes(activeTab) ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                                        <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${locale === 'ar' ? 'mr-auto ml-0' : 'ml-auto mr-0'}`}
                                    />
                                </button>
                                
                                {isOpen && (
                                    <div className={`space-y-1 border-primary/20 ${locale === 'ar' ? 'border-r-2 pr-4 mr-4' : 'border-l-2 pl-4 ml-4'}`}>
                                        {item.subItems?.map((subItem: any) => (
                                            <Link
                                                key={subItem.id}
                                                href={`/${locale}${subItem.href}`}
                                                onClick={onClose}
                                                className={`w-full flex items-center gap-4 px-6 py-4 text-base rounded-[1.2rem] transition-all duration-300 relative group
                                                    ${activeTab === subItem.id ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/30'}
                                                `}
                                            >
                                                <subItem.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                <span className="group-hover:text-primary transition-colors">{subItem.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={`/${locale}${item.href}`}
                            onClick={onClose}
                            className={`w-full flex items-center gap-4 px-6 py-5 text-lg rounded-[1.5rem] transition-all duration-500 relative group mb-1 last:mb-0
                                ${activeTab === item.id ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
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
                    );
                })}
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
