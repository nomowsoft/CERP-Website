"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations, useLocale } from "next-intl";

type FaqData = {
    id: string,
    qKey: string,
    aKey: string
}
const faqData: FaqData[] = [
    {
        id: "1",
        qKey: "q1",
        aKey: "a1",
    },
    {
        id: "2",
        qKey: "q2",
        aKey: "a2",
    },
    {
        id: "3",
        qKey: "q3",
        aKey: "a3",
    },
    {
        id: "4",
        qKey: "q4",
        aKey: "a4",
    },
];


export const FAQAccordion = () => {
    const t = useTranslations('faq');
    const locale = useLocale();
    return (
        <section className="mx-auto container py-20">
            <section>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
                        {t.rich('heading', {
                            highlight: (chunks) => <span className="
                                    bg-gradient-to-l from-primary/50 to-primary
                                    bg-clip-text text-transparent font-bold
                                    leading-tight
                                    py-1 inline-block
                                ">{chunks}</span>
                        })}
                    </h1>
                </div>
            </section>
            <div className="w-full max-w-4xl mx-auto">
                {/* Accordion */}
                <Accordion
                    type="single"
                    collapsible
                    defaultValue="1"
                    className="space-y-4"
                    dir={locale == 'ar' ? "rtl" : "ltr"}
                >
                    {faqData.map((item) => (
                        <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="
                                bg-card rounded-xl border-0 shadow-sm px-6 overflow-hidden
                                data-[state=open]:shadow-md transition-shadow duration-300
                            "
                        >
                            <AccordionTrigger
                                className={`
                                    text-lg font-semibold py-5 flex items-center justify-between gap-4
                                    ${locale === 'ar' ? "flex-row-reverse text-right" : "text-left"}
                                `}
                            >
                                {t(item.qKey)}
                            </AccordionTrigger>

                            <AccordionContent
                                className={`
                                    text-base leading-relaxed pb-5 text-gray-500
                                    ${locale === 'ar' ? "text-right" : "text-left"}
                                `}
                            >
                                {t(item.aKey)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

            </div>
        </section>
    );
}
