import SystemHalaqat from "./system_halaqat";
import SystemHealth from "./system_health";
import { useTranslations } from 'next-intl';

const System = () => {
  const t = useTranslations('common');
  return (
    <section className="py-20 lg:py-32 bg-system bg-cover bg-no-repeat bg-white">
        <div data-aos="zoom-in">
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold text-center text-success">
                {t('systemCerp')}
            </h1>
        </div>
        <SystemHealth />
        <SystemHalaqat />
    </section>
  );
}

export default System