"use client";
import Image from "next/image";
import Features from "../features/features";

const Hero = () => {

  return (
    <section className="py-3 bg-hero bg-no-repeat bg-contain">
      <div className="py-4 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
          <div className="flex justify-center">
            <Image src="/hero/cerp.svg" alt="..." width={250} height={20} />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight leading-none text-success" data-aos="zoom-in">Charity ERP (CERP)</h1>
          {/* <h1 className="mb-4 text-3xl md:text-4xl font-extralight tracking-tight leading-none text-success" data-aos="zoom-in">لنجعل التقنية اسهل مايمكن</h1> */}
          <div className="text-success mx-5 md:mx-12">
            <h1 className="xl:text-2xl" data-aos="fade-down">
            نظام متكامل لادارة الجمعيات الخيرية يوفر الكثير من المزايا التي تساعد الجمعية على تحقيق الحوكمة والتحول الرقمي  اعتمادا على نظام سرب .
            يمكن تنفيذ نظام سرب في جميع مجالات الجمعيات الخيرية مع امكانية اضافة التعديلات  التي تناسب مجال تخصص الجمعية  ولاسيما الاختلافات في رحلة العميل             </h1>
          </div>
      </div>
      <Features />
    </section>
  )
}

export default Hero