import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { startTransition } from "react";
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguagesidebar = () => {
        const nextLocale = locale === "ar" ? "en" : "ar";
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };
    return (
        <button
            onClick={toggleLanguagesidebar}
            className="flex w-full items-center gap-2 px-3 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors text-primary font-bold border border-primary/10"
            title={locale === 'en' ? 'Switch to Arabic' : 'تغيير للإنجليزية'}
        >
            <Languages className="w-5 h-5" />
            <span className="text-sm uppercase ">{locale === 'en' ? 'AR' : 'EN'}</span>
        </button>
    );
}
