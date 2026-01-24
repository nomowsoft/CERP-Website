import { useLocale, useTranslations } from "next-intl";
import { Invoicing } from "./snipptes/invoicing";
import { KpiCard } from "./snipptes/kpicard";
import { ShowDownload } from "./snipptes/show_download";

export default function AdminDashboard() {
    const locale = useLocale();
    const t = useTranslations('dashboard');

    return (
        <section className="space-y-8" dir={`${locale === "ar" ? "rtl" : "ltr"}`}>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                <p className="text-slate-500 mt-1">{t('subtitle')}</p>
            </div>
            <KpiCard />
            <Invoicing />
            <ShowDownload />
        </section>
    );
}
