"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';

const Slider = () => {

  return (
    <section>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        spaceBetween={0}
        slidesPerView={1}
        breakpoints={{
          "@0.00": {
            slidesPerView: 1,
          },
          "@0.75": {
            slidesPerView: 1,
          },
          "@1.00": {
            slidesPerView: 1,
          },
          "@1.50": {
            slidesPerView: 1,
          },
        }}
      >
          <SwiperSlide>
            <div className="flex justify-center">
              <Image src="/slider/slider1.jpg" alt="..." height={20} width={5000} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
              <div className="flex justify-center">
                <Image src="/slider/slider2.jpg" alt="..." height={20} width={5000} />
              </div>
          </SwiperSlide>
          <SwiperSlide className="flex justify-center items-center">
            <div className="flex justify-center">
              <Image src="/slider/slider3.jpg" alt="..." height={20} width={5000} />
            </div>
          </SwiperSlide>
      </Swiper>
    </section>
  )
}

export default Slider