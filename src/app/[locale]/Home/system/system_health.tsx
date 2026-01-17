"use client";
import Image from "next/image";
import { useState } from "react";
import { health } from "@/utils/data";
import { useTranslations, useLocale } from 'next-intl';

const SystemHealth = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('health');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0 mt-10">
      <div className="rounded-3xl" data-aos="zoom-in">
        <div className="flex flex-col md:flex-row">
          <div className="relative">
            <Image
              src="/system_health/New Project(2).svg"
              alt="System Image"
              height={200}
              width={800}
              className="rounded-3xl"
            />
            <div className="absolute -bottom-20">
              <Image
                src="/system_health/Component 14.svg"
                alt="System Image"
                height={200}
                width={150}
                className="rounded-3xl"
              />
            </div>
          </div>
          <div className="mt-6 md:mt-0  md:mr-10">
            <div className="flex justify-start">
              <span className="text-primary flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
                <span>{tCommon('specializedSolutions')}</span>
              </span>
            </div>
            <h1 className={`mt-5 text-2xl md:text-3xl font-doto2`}>
              {t('healthTitle')}
            </h1>
            <p className={`text-gray-500 mt-6 md:mt-10 text-md md:text-lg`}>
              {t('healthDescription')}
            </p>
            <button
              onClick={() => setIsOpen(!isOpen)}
              dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}
              className="bg-success font-semibold py-3 px-4 rounded-xl flex items-center justify-between w-full mt-10 mb-5 border border-primary bg-primary/10"
            >
              <p>{t('learnMore')}</p>
              <div className="rounded p-1 mr-2 flex justify-center items-center">
                <Image
                  src={isOpen ? "/system/Background (1).svg" : "/system/Background (1).svg"}
                  alt="Toggle Icon"
                  height={20}
                  width={20}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? "max-h-[1000px]" : "max-h-0"
          }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6" dir={useLocale() === 'ar' ? 'rtl' : 'ltr'}>
          <div className="md:col-span-5">
            {health.slice(0, 6).map((item) => (
              <div className="flex items-center mt-4" key={item.id}>
                <div className="flex-shrink-0">
                  <Image
                    src="/features/Group3.svg"
                    alt="Feature Icon"
                    width={30}
                    height={20}
                  />
                </div>
                <div className="ml-4 py-4">
                  <h1 className="text-lg md:text-xl text-success">{t(item.titleKey)}</h1>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex justify-center items-center md:col-span-1">
            <Image src="/system/Line 5.png" alt="Divider" width={4} height={200} />
          </div>

          <div className="md:col-span-6">
            {health.slice(6, 12).map((item) => (
              <div className="flex items-center mt-4" key={item.id}>
                <div className="flex-shrink-0">
                  <Image
                    src="/features/Group3.svg"
                    alt="Feature Icon"
                    width={30}
                    height={20}
                  />
                </div>
                <div className="ml-4 py-4">
                  <h1 className="text-lg md:text-xl text-success">{t(item.titleKey)}</h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;