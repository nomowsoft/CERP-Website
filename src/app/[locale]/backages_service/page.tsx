import { Backages } from './backages'
import { Service } from './service'
import { useLocale } from 'next-intl'
import Image from 'next/image';

export default function BackagesService() {
  const locale = useLocale();
  return (
    <section dir={`${locale === "ar" ? "rtl" : "ltr"}`} className="py-10">
      <section className="pt-20">
        <div className="flex justify-center">
          <span className="bg-gradient-to-r from-primary/10 to-secondary/10  text-transparent flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
            <Image src="/backage_service/Component.svg" height={40} width={20} alt="..." />
            <span className="text-primary">الخدمات والباقات</span>
          </span>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
             <span>اختر </span>
             <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">الباقة المناسبة</span>
             <span> لاحتياجاتك</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            نقدم لك مجموعة متنوعة من الباقات والخدمات المصممة لتلبية احتياجات مؤسستك
          </p>
        </div>
      </section>
      <Backages />
      <Service />
    </section>
  )
}
