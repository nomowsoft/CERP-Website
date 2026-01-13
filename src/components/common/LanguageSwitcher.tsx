import { useLocale } from "next-intl";
import { usePathname, useRouter } from "../../i18n/navigation";
import { startTransition } from "react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === "ar" ? "en" : "ar";
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            className="text-primary font-bold cursor-pointer mx-5 border border-primary w-10 h-10 pt-1 rounded-full transition-all"
        >
            {locale === "ar" ? "EN" : "AR"}
        </button>
    );
}
