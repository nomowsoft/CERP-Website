"use client";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react";

export const ContactUs = () => {
    const t = useTranslations('contact');
    return (
        <section className="container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0 py-10">
            <Card
                className="mx-5 py-20 relative overflow-hidden group bg-info duration-300 rounded-3xl border border-primary/20"
            >
                <div className="absolute -top-30 -right-20 w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 bg-[#8B5CF6]/15 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 bg-[#8B5CF6]/15 rounded-full blur-3xl animate-float" />
                <section>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
                            {t.rich('ctaHeading', {
                                highlight: (chunks) => <span className="text-primary">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-xl text-gray-500 mb-8 text-end">
                            {t('ctaSubHeading')}
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-gradient-to-l from-primary/60 font-bold from-5% via-primary via-50% to-primary to-90% rounded-xl text-info glow-primary  text-xl px-6 py-7 text-center"
                        >
                            {t('ctaButton')}
                            <ArrowLeft className="me-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </section>
            </Card>
        </section>
    )
}
