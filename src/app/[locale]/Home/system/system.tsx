"use client";
import SystemHalaqat from "./system_halaqat";
import SystemHealth from "./system_health";
import { useTranslations } from 'next-intl';

const System = () => {
  const t = useTranslations('common');
  return (
    <section>
      <section>
        <div className="px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
              {t.rich('specializedSystemsHeading', {
                highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
              })}
            </h1>
            <p className="text-xl mb-8 text-gray-500">
              {t('specializedSystemsSubHeading')}
            </p>
          </div>
        </div>
      </section>
      <SystemHealth />
      <SystemHalaqat />
    </section>
  );
}

export default System