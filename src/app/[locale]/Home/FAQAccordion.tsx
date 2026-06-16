"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations, useLocale } from "next-intl";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

type Faq = {
    id: number;
    question_ar: string;
    question_en: string;
    answer_ar: string;
    answer_en: string;
    order: number;
};

export const FAQAccordion = () => {
    const t = useTranslations('faq');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get('/api/faqs');
                setFaqs(response.data);
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    return (
        <section className="py-24 relative overflow-hidden bg-white z-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className={`absolute top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] transform ${locale === 'ar' ? 'translate-x-1/3' : '-translate-x-1/3'} -translate-y-1/3`}></div>
                <div className={`absolute bottom-0 ${locale === 'ar' ? 'left-0' : 'right-0'} w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] transform ${locale === 'ar' ? '-translate-x-1/3' : 'translate-x-1/3'} translate-y-1/3`}></div>
            </div>

            <div className="mx-auto container px-4 lg:px-20 xl:px-20 2xl:px-0">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    {/* Header Details */}
                    <div className="w-full lg:w-5/12 lg:sticky lg:top-32" data-aos={locale === 'ar' ? 'fade-left' : 'fade-right'}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold mb-6 border border-primary/20">
                            <HelpCircle className="w-5 h-5 drop-shadow-sm" />
                            <span>{t.has('tag') ? t('tag') : (locale === 'ar' ? 'أسئلة شائعة' : 'FAQs')}</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-doto2 font-bold mb-6 text-gray-900 leading-snug">
                            {t.rich('heading', {
                                highlight: (chunks) => <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">{chunks}</span>
                            })}
                        </h2>
                        
                        <p className="text-xl text-gray-500 mb-8 max-w-md leading-relaxed">
                            {locale === 'ar' 
                                ? "جمعنا لك أهم الأسئلة حول نظام سِرب، لمساعدتك في الحصول على الصورة الكاملة واتخاذ القرار الأفضل لجمعيتك." 
                                : "We've gathered the most important questions about CERP to help you get the complete picture and make the best decision for your association."}
                        </p>

                        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-3">
                            <span className="font-bold text-gray-900">
                                {locale === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Still have questions?'}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {locale === 'ar' ? 'فريق الدعم الفني لدينا متواجد للإجابة على كافة استفساراتك وتزويدك بالمساعدة اللازمة.' : 'Our support team is here to answer all your inquiries.'}
                            </span>
                        </div>
                    </div>

                    {/* Accordion Questions */}
                    <div className="w-full lg:w-7/12" data-aos="fade-up">
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="1"
                            className="space-y-5"
                            dir={locale === 'ar' ? "rtl" : "ltr"}
                        >
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-20 bg-gray-100/50 animate-pulse rounded-3xl" />
                                    ))}
                                </div>
                            ) : faqs.length > 0 ? faqs.map((item) => (
                                <AccordionItem
                                    key={item.id.toString()}
                                    value={item.id.toString()}
                                    className="
                                        group bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]
                                        data-[state=open]:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.08)] 
                                        data-[state=open]:border-primary/20
                                        transition-all duration-500 overflow-hidden relative
                                    "
                                >
                                    <div className={`absolute top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-secondary to-primary opacity-0 group-data-[state=open]:opacity-100 transition-opacity duration-500`}></div>
                                    
                                    <AccordionTrigger
                                        className="
                                            text-lg md:text-xl font-bold py-6 px-6 md:px-8 hover:no-underline
                                            hover:bg-gray-50/50 transition-colors
                                        "
                                    >
                                        <span className={`text-start group-data-[state=open]:text-primary transition-colors duration-300 leading-snug ${locale === 'ar' ? 'pl-4' : 'pr-4'}`}>
                                            {isAr ? item.question_ar : item.question_en}
                                        </span>
                                    </AccordionTrigger>

                                    <AccordionContent className="text-base md:text-lg leading-relaxed pb-8 px-6 md:px-8 text-gray-500">
                                        <div className="pt-2 border-t border-gray-50 mt-2">
                                            {isAr ? item.answer_ar : item.answer_en}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )) : (
                                <div className="text-center text-gray-500 p-8 border border-dashed rounded-3xl">
                                    {isAr ? 'لا توجد أسئلة شائعة حالياً.' : 'No FAQs currently available.'}
                                </div>
                            )}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
};
