"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { useState, useEffect } from "react";

interface HeroImage {
    id: number;
    image: string;
}

export const HeroDashboardAnimation = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [images, setImages] = useState<HeroImage[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/hero-images', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setImages(data);
                }
            } catch (error) {
                console.error("Error fetching hero images:", error);
            }
        };
        fetchImages();
    }, []);

    const activeSlides = images.length > 0
        ? images.map((img, idx) => ({ id: img.id, image: img.image, name: `Slide ${idx + 1}` }))
        : [
            { id: 1, image: "/hero/cerp2.png", name: "Slide 1" },
            { id: 2, image: "/hero/cerpnew.jpeg", name: "Slide 2" },
        ];

    // Ensure we have at least 8 slides to avoid Swiper Loop Warnings, especially with effect: 'cards'
    let finalSlides = [...activeSlides];
    while (finalSlides.length < 8 && finalSlides.length > 0) {
        finalSlides = [
            ...finalSlides,
            ...activeSlides.map((slide, idx) => ({
                ...slide,
                id: slide.id + (finalSlides.length + idx + 1) * 1000
            }))
        ];
    }

    if (!isMounted) {
        const firstImage = activeSlides[0]?.image || "/hero/2.png";
        return (
            <div className="relative w-full flex flex-col items-center justify-center p-4 lg:p-8 select-none">
                <div className="w-full max-w-[320px] sm:max-w-md md:max-w-xl lg:max-w-2xl aspect-[16/10] relative z-10 mb-8 rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl bg-white">
                    <div className="relative w-full h-full">
                        <Image 
                            src={firstImage} 
                            fill 
                            alt="Hero Dashboard Animation Preview" 
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
                    speed={1500}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    modules={[EffectCards, Autoplay, Pagination]}
                    loop={true}
                    className="w-full h-full !overflow-visible"
                >
                    {finalSlides.map((slide, i) => (
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
                                    priority={i === 0}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.div>
        </div>
    );
};
