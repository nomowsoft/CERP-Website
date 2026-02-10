import { useTranslations } from "next-intl";
import Image from "next/image";


export const ShowDownload = () => {
    const t = useTranslations('dashboard.common');
    return (
        <section className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
                    <Image
                        src="/admin/SVG2.svg"
                        alt="Play Store"
                        width={40}
                        height={50}
                    />
                    <h2 className="text-xl font-doto2 mt-4">{t('details')}</h2>
                    <p className="text-gray-500 mt-2">{t('currentInfo')}</p>
                </div>
                <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
                    <Image
                        src="/admin/SVG1.svg"
                        alt="Play Store"
                        width={40}
                        height={50}
                    />
                    <h2 className="text-xl font-doto2 mt-4">{t('allInvoices')}</h2>
                    <p className="text-gray-500 mt-2">{t('browseDownload')}</p>
                </div>
            </div>
        </section>
    )
}
