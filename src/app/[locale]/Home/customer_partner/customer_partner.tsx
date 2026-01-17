"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { cutomerpartner } from "@/utils/data";
import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";

const CustomerPartner = () => {
    const t = useTranslations('customerPartner');
    return (
        <section className="py-30 container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0">
            <section>
                <div className="flex justify-center">
                    <span className="text-primary flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
                        <span>{t('tag')}</span>
                    </span>
                </div>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
                        {t.rich('heading', {
                            highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-xl text-gray-500 mb-8">
                        {t('subHeading')}
                    </p>
                </div>
            </section>
            <div className="mt-2 lg:mt-16" data-aos="fade-up">
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    spaceBetween={5}
                    slidesPerView={1}
                    speed={1500}
                    breakpoints={{
                        "@0.00": {
                            slidesPerView: 1,
                        },
                        "@0.75": {
                            slidesPerView: 2,
                        },
                        "@1.00": {
                            slidesPerView: 5,
                        },
                        "@1.50": {
                            slidesPerView: 6,
                        },
                    }}
                >
                    {cutomerpartner?.map((cp) => (
                        <SwiperSlide key={cp.id}>
                            <Card
                                className="mx-5 overflow-hidden group bg-info  transition-all duration-300 rounded-3xl border border-primary/20 hover:scale-105"
                            >
                                <div className="flex justify-center">
                                    <Image src={cp.image} alt="" width={300} height={20} />
                                </div>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}

export default CustomerPartner