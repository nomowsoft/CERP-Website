"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const locale = useLocale();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const t = useTranslations('dashboard');

    return (
        <div className="flex bg-white min-h-screen relative overflow-x-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className={`fixed inset-y-0 z-40 transition-transform duration-300 ease-in-out ${locale === 'ar' ? 'right-0' : 'left-0'
                } ${isOpen ? 'translate-x-0' : (locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
                } ${isMobile ? 'shadow-2xl' : 'border-e border-gray-100'} overflow-hidden bg-white`}>
                <AdminSidebar onClose={() => isMobile && setIsOpen(false)} />
            </div>

            {/* Backdrop - Only for Mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isOpen && !isMobile ? (locale === 'ar' ? 'mr-70' : 'ml-70') : ''
                }`}>
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 bg-white/80 backdrop-blur-md px-4 lg:px-8">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 border border-primary text-primary"
                        title={isOpen ? t('hideSidebar') : t('showSidebar')}
                    >
                        {isOpen && (
                            locale === 'ar' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />
                        )}
                        {!isOpen && (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* User Info can go here */}
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-8 bg-gray-50/50 flex-1 min-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
