"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { useState, useEffect } from "react";

const slides = [
    { id: 1, image: "/hero/cerp.png", name: "Slide 1" },
    { id: 2, image: "/hero/cerpnew.jpeg", name: "Slide 2" },
];

export const HeroDashboardAnimation = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Duplicate slides to ensure smooth loop for EffectCards (which requires a larger pool of slides to clone)
    const loopedSlides = [...slides, ...slides, ...slides];

    if (!isMounted) {
        return (
            <div className="relative w-full flex flex-col items-center justify-center p-4 lg:p-8 select-none">
                <div className="w-full max-w-[320px] sm:max-w-md md:max-w-xl lg:max-w-2xl aspect-[16/10] relative z-10 mb-8 rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl bg-white">
                    <div className="relative w-full h-full">
                        <Image 
                            src={slides[0].image} 
                            fill 
                            alt={slides[0].name} 
                            className="object-cover" 
                            priority
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full flex flex-col items-center justify-center p-4 lg:pt-8 select-none">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-full max-w-[320px] sm:max-w-md md:max-w-xl lg:max-w-2xl aspect-[16/10] relative z-10"
            >
                <Swiper
                    effect={'cards'}
                    grabCursor={true}
                    speed={2000}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    modules={[EffectCards, Autoplay, Pagination]}
                    loop={true}
                    className="w-full h-full !overflow-visible"
                >
                    {loopedSlides.map((slide, i) => (
                        <SwiperSlide 
                            key={`${slide.id}-${i}`} 
                            className="rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl bg-white"
                        >
                            <div className="relative w-full h-full">
                                <Image 
                                    src={slide.image} 
                                    fill 
                                    alt={slide.name} 
                                    className="object-cover" 
                                    priority={i < 3}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.div>
        </div>
    );
};
