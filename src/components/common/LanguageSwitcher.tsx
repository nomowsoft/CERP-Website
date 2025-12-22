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
            className="text-success font-bold cursor-pointer mx-5 border border-success px-2.5 py-2 rounded-full hover:bg-success hover:text-white transition-all"
        >
            {locale === "ar" ? "EN" : "AR"}
        </button>
    );
}
