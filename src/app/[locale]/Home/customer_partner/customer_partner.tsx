"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Autoplay } from 'swiper/modules';
import { cutomerpartner } from "@/utils/data";
import { useTranslations } from 'next-intl';

const CustomerPartner = () => {
    const t = useTranslations('customerPartner');
    
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <style jsx global>{`
                .marquee-swiper .swiper-wrapper {
                    transition-timing-function: linear !important;
                }
            `}</style>

            <div className="container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0">
                <div className="flex flex-col items-center mb-16 text-center" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold mb-6 border border-primary/20">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                        {t('tag')}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-doto2 font-bold mb-8 text-gray-900 leading-snug">
                        {t.rich('heading', {
                            highlight: (chunks) => <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block px-2 pb-2">{chunks}</span>
                        })}
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                        {t.rich('subHeading', {
                            highlight: (chunks) => <span className="text-secondary font-bold text-3xl mx-1 bg-secondary/10 px-4 py-1.5 rounded-xl border border-secondary/20 shadow-sm">{chunks}</span>
                        })}
                    </p>
                </div>

                <div className="relative mt-8" data-aos="fade-up" data-aos-delay="100">
                    {/* Gradient Fade Edges for Marquee effect */}
                    <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <Swiper
                        className="marquee-swiper py-8"
                        modules={[Autoplay]}
                        speed={4000}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        loop={true}
                        spaceBetween={30}
                        slidesPerView={2}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 5 },
                        }}
                    >
                        {cutomerpartner?.map((cp) => (
                            <SwiperSlide key={cp.id}>
                                <div className="group bg-white p-3 md:p-4 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.12)] hover:-translate-y-1 transition-all duration-300 h-40 md:h-48 flex items-center justify-center cursor-pointer overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative w-[95%] h-[95%] flex items-center justify-center">
                                        <Image 
                                            src={cp.image} 
                                            alt={`Partner ${cp.id}`} 
                                            fill
                                            className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}

export default CustomerPartner;