import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "use-intl";
import Image from "next/image";

type dataType = {
    id: number;
    src: string;
    number?: string;
    nameKey?: string;
    altKey: string;
};

const data: dataType[] = [
    {
        id: 1,
        src: "/hero/icon3.svg",
        altKey: "statAssociation",
        number: "50+",
        nameKey: "statAssociation"
    },
    {
        id: 2,
        src: "/hero/icon1.svg",
        altKey: "statSystem",
        number: "20+",
        nameKey: "statSystem"
    },
    {
        id: 3,
        src: "/hero/icon2.svg",
        altKey: "statSupport",
        number: "24/7",
        nameKey: "statSupport"
    },
];
export const Hero = () => {
    const t = useTranslations('hero');
    const locale = useLocale();
    return (
        <section className="bg-gray-100 flex items-center py-20 lg:py-40 relative">
            <video
                className="absolute inset-0 w-full h-full object-cover opacity-5"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/hero/video1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Right side: Text & Buttons */}
                    <div className="w-full lg:w-1/2">
                        <div className="text-primary flex items-center gap-2 w-60 mb-4 justify-center  border border-primary rounded-3xl px-2 py-2 bg-gradient-to-l from-primary/20 font-bold from-5% via-primary/50 via-50% to-primary/20 to-90%">
                            <Image src="/hero/Vector.svg" height={40} width={20} alt="..." />
                            <div>{t('integratedSystem')}</div>
                        </div>
                        <h1 className={`font-doto text-4xl text-center lg:text-start ${locale === 'ar' ? 'md:text-7xl lg:text-5xl xl:text-6xl 2xl:text-7xl' : 'md:text-7xl lg:text-4xl xl:text-5xl 2xl:text-6xl'} font-bold mb-4 leading-snug`}>
                            {t.rich('erpSystemTitle', {
                                highlight: (chunks) => <span className={`${locale === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-secondary to-primary bg-clip-text text-transparent font-bold`}>{chunks}</span>
                            })}
                        </h1>
                        <p className="text-lg md:text-xl font-bold mb-8 text-gray-500 mt-10">
                            {t('erpDescription')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 w-full">
                            {/* Primary Button */}
                            <Button
                                size="lg"
                                className={`w-full sm:w-auto ${locale === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-secondary font-bold from-5% via-primary via-50% to-primary to-90% rounded-xl text-info glow-primary  text-xl px-6 py-7 text-center`}
                            >
                                {t('startNow')}
                                <ArrowLeft className={`me-2 h-7 w-7 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'block' : 'hidden'}`} />
                                <ArrowRight className={`me-2 h-7 w-7 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'hidden' : 'block'}`} />
                            </Button>

                            {/* Outline Button */}
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full font-bold sm:w-auto bg-white border border-white  rounded-xl hover:bg-primary/10 hover:text-primary text-base sm:text-lg py-7"
                            >
                                <Image src="/hero/buttonshow.svg" height={24} width={40} alt="Play" className="ms-2" />
                                {t('watchDemo')}
                            </Button>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">
                                {t('trustedBy')}
                            </p>
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-6 mt-6">
                                {data.map((item) => (
                                    <div key={item.id} className="flex items-center">
                                        <div className="flex items-center">
                                            <Image src={item.src} height={60} width={70} alt={t(item.altKey)} />
                                        </div>
                                        <div>
                                            {item.number && <p className="text-xl text-primary font-bold">{item.number}</p>}
                                            {item.nameKey && <p className="text-gray-600">{t(item.nameKey)}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Left side: Demo */}
                    <div className="w-full lg:w-1/2 mb-8 lg:mb-0 flex justify-center">
                        <div className="w-full">
                            <Image src="/hero/heroimage.svg" height={500} width={700} alt="..." />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
