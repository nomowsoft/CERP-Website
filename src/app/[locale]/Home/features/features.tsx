"use client";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';

const Features = () => {
  const t = useTranslations('features');
  const locale = useLocale();
  const l = [
    {
      id: 1,
      nameKey: 'dcHosting',
      image: '/hero/data-center1.png'
    },
    {
      id: 2,
      nameKey: 'processGovernance',
      image: '/hero/process1.png'
    },
    {
      id: 3,
      nameKey: 'financialGovernance',
      image: '/hero/security-system.png'
    },
    {
      id: 4,
      nameKey: 'cyberSecurity',
      image: '/hero/computer.png'
    },
    {
      id: 5,
      nameKey: 'supportMaintenance',
      image: '/hero/computer.png'
    },
    {
      id: 6,
      nameKey: 'periodicMaintenance',
      image: '/hero/optimize.png'
    },
    {
      id: 7,
      nameKey: 'liveChat',
      image: '/hero/continuous.png'
    },
    {
      id: 8,
      nameKey: 'backup',
      image: '/hero/chat-bubble.png'
    },
    {
      id: 9,
      nameKey: 'continuousDevelopment',
      image: '/hero/cloud-upload.png'
    },
    {
      id: 10,
      nameKey: 'systemIntegration',
      image: '/hero/continuous-improvement.png'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-screen-xl text-center">
        <h1 className="text-3xl xl:text-5xl font-bold tracking-tight leading-none text-success" data-aos="zoom-in">{t('title')}</h1>
      </div>
      <div className="mx-3 md:mx-auto max-w-screen-2xl" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="grid md:grid-cols-2 gap-y-2 py-12 md:py-24">
          <div className="flex">
            <div className="md:block hidden">
              <Image src="/features/Group1.svg" alt="..." width={50} height={20} />
            </div>
            <div className="mx-5">
              {l.slice(0, 5).map((item) => (
                <div className="flex items-center mt-8" key={item.id} data-aos="zoom-in">
                  <div className="flex-shrink-0">
                    <Image src="/features/Group3.svg" alt="..." width={30} height={20} />
                  </div>
                  <div className="mx-3">
                    <h1 className="text-xl">
                      {t(item.nameKey)}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="md:block hidden">
              <Image src="/features/Group2.svg" alt="..." width={50} height={20} />
            </div>
            <div className="mx-5">
              {l.slice(5, 10).map((item) => (
                <div className="flex items-center mt-8" key={item.id} data-aos="zoom-in">
                  <div className="flex-shrink-0">
                    <Image src="/features/Group3.svg" alt="..." width={30} height={20} />
                  </div>
                  <div className="mx-3">
                    <h1 className="text-xl">
                      {t(item.nameKey)}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Features