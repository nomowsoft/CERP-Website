"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";

const Slider = () => {
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
        <SwiperSlide>
          <div className="flex justify-center">
            <Image src="/slider/s1.svg" alt="..." height={20} width={5000} />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex justify-center">
            <Image src="/slider/s2.svg" alt="..." height={20} width={5000} />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex justify-center">
            <Image src="/slider/s3.svg" alt="..." height={20} width={5000} />
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
};

export default Slider;
