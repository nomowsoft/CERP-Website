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

const CustomerPartner = () => {
    const t = useTranslations('customerPartner');
    return (
        <section className="pb-12 lg:pb-52 bg-white">
            <div className="max-w-screen-2xl mx-auto">
                <h1 className="text-center text-3xl lg:text-5xl text-success font-semibold">{t('title')}</h1>
            </div>
            <div className="max-w-screen-2xl mx-auto flex flex-wrap gap-2 items-center mt-2 lg:mt-16" data-aos="fade-up">
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    spaceBetween={5}
                    slidesPerView={1}
                    navigation={{
                        nextEl: ".custom-swiper-button-prev",
                        prevEl: ".custom-swiper-button-next",
                    }}
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
                            <div className="flex justify-center">
                                <Image src={cp.image} alt=""  width={300} height={20} />
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="custom-swiper-navigation flex justify-center">
                        <button className="custom-swiper-button-prev py-2 rounded-lg text-success text-5xl">→</button>
                        <button className="custom-swiper-button-next py-2 rounded-lg text-success text-5xl">←</button>
                    </div>
                </Swiper>
            </div>
        </section>
    )
}

export default CustomerPartner