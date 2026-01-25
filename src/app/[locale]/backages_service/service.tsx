"use client";
import Image from 'next/image'
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getServices } from '@/app/store/slices/servicesSlice';
import { useEffect } from 'react';
import { ServiceDTO, ServiceTypeDto } from '@/utils/types';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from 'next-intl';


export const Service = () => {
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getServices());
  }, [dispatch]);

  const Services = useSelector((state: any) => state.services.services);
  return (
    <section className="container mx-auto pt-20">
      <div className="text-center my-10">
        <h1 className="text-4xl font-doto2">خدمات إضافية</h1>
        <p className="text-xl text-gray-500 mt-2">خدمات متخصصة لدعم عملياتك وتعزيز كفاءة مؤسستك</p>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-10 lg:mx-0 mx-10">
        {Services.map((service: ServiceDTO) => (
          <div key={service.id} className="shadow-xl rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-105 animate-slide-up">
            <div>
              <Image src={service.image} alt={service.name} width={120} height={20} />
              <h1 className="text-2xl font-doto2">{service.name}</h1>
              <p className="text-gray-500">{service.description}</p>
              <div className="grid grid-cols-4 gap-10 mt-5">
                {service.contents?.map((content: ServiceTypeDto) => (
                  <div className="flex bg-primary/10 p-2 rounded-3xl">
                    <div className="flex items-center">
                      <Image src="/backage_service/Vector.svg" alt="" width={20} height={20} />
                    </div>
                    <div>
                      <span className="ms-2 text-gray-700 text-[6px] md:text-[12px]">{content.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full">
              <a href={`/${locale}/subscription`} className="bg-info my-5 flex justify-center mx- w-full border border-gray-200 rounded-2xl py-3 hover:text-info  hover:bg-primary text-xl font-doto2">
                <span>اشترك الأن</span>
                <ArrowLeft />
              </a>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
