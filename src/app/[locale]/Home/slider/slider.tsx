"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";

interface HeroImage {
  id: number;
  image: string;
}

const Slider = () => {
  const [images, setImages] = useState<HeroImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/hero-images', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        }
      } catch (error) {
        console.error("Error fetching slider images:", error);
      }
    };
    fetchImages();
  }, []);

  // Fallback default images if no images are stored in the database
  const displayImages = images.length > 0 
    ? images.map(img => img.image)
    : ["/slider/s1.svg", "/slider/s2.svg", "/slider/s3.svg"];

  return (
    <section className="py-32 bg-hero bg-no-repeat bg-cover w-full ">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        slidesPerView="auto"
        spaceBetween={0}
        speed={1000}
        centeredSlides={true}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
          1440: { slidesPerView: 1 },
        }}
      >
        {displayImages.map((imgSrc, index) => (
          <SwiperSlide key={index}>
            <div className="flex justify-center h-full w-full relative">
              <Image 
                src={imgSrc} 
                alt={`Hero Slider ${index + 1}`} 
                height={500} 
                width={5000} 
                className="object-contain max-h-[500px]"
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Slider;
