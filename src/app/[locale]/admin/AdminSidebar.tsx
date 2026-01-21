"use client";
import Link from 'next/link';
import {
    LayoutDashboard,
    Globe,
    FileText,
    Menu as MenuIcon,
    LogOut,

} from 'lucide-react';
import { useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/store/store';
import { useEffect } from 'react';
import { getUser } from '@/app/store/slices/userSlice';
import { useSelector } from 'react-redux';
import { logoutUser } from '@/app/store/slices/userSlice';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
    const locale = useLocale();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(getUser());
    }, [dispatch]);

    const { userInfo } = useSelector((state : any) => state.user);
    const handleLogout = async () => {
        const result = await dispatch(logoutUser());
        if (logoutUser.fulfilled.match(result)) {
            router.push(`/${locale}/login`);
        }
    };

    const navItems = [
        { label: "لوحة المعلومات", href: '/admin', icon: LayoutDashboard },
        { label: "الفواتير", href: '/admin/websites', icon: Globe },
        { label: "الإشتراكات", href: '/admin/pages', icon: FileText },
        { label: "الإعدادات", href: '/admin/menus', icon: MenuIcon },
    ];

    return (
        <aside className={`w-64 text-white min-h-screen fixed inset-y-0 ${locale === "ar" ? "start-0" : ""} flex flex-col border-e border-white/10`}>
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-700 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 rounded-xs" style={{ backgroundColor: 'var(--primary-dark)' }} />
                    </div>
                    {userInfo.name || 'Admin'}
                </h2>
                <p className="text-gray-500 mt-2 truncate">
                    {userInfo.charityName || 'Admin'}
                </p>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={`/${locale}${item.href}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-600 group"
                    >
                        <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-4" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
                <LanguageSwitcher />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-red-50 text-red-500 transition-colors w-full group"
                >
                    <LogOut className="w-5 h-5 rtl:rotate-180" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
