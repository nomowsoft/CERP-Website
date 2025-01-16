"use client";
import Image from "next/image";
import Link from "next/link";

const SystemHealth = () => {

  return (
    <section className="bg-slate-100  bg-product bg-no-repeat bg-right-bottom">
      <div className="gap-8 items-center py-8 px-4 mx-32 xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
          <div className="block md:hidden" data-aos="zoom-in">
            <div className="flex justify-center">
              <Image className="w-full" width={250} height={20} src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg" alt="dashboard image" />
            </div>
          </div>
          <div className="mt-4 md:mt-0" data-aos="fade-left">
              <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-success">نظام سرب لجمعيات الخدمات الصحية</h2>
              <h2 className="mb-4 text-2xl tracking-tight font-extrabold text-success">رحلة المستفيد من التسجيل على البوابة او التطبيق وتقديم الطلب انتهاءا باكمال الخدمة من خلال اجراءت محوكمة  .</h2>
              <ul className="text-2xl text-success mb-8">
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">بوابة المستفيدين لتقديم طلب الخدمة</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">تطبيق جوال  المستفيدين.</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">ادارة الخدمات الصحية</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">ادارة مزودين الخدمة</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">ادارة الحسابات من خلال  ترابط نظام الموارد المالية والموازنات والنظام المالي في دورة عمل متكاملة ومحوكمه.</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">ادارة المساهمة  المالية للمستفيد ( دفع – استرداد )</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">الاشراف التربوي</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2">ادارة الاختبارات</span>
                </li>
                <li className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span className="mx-2"> ادارة الهبات العينية</span>
                </li>
              </ul>
              <Link href="#" className="mt-8 bg-success py-2 px-6 text-white border border-sucess rounded-lg text-2xl">
                  ابداء معنا 
              </Link>
          </div>
          <div className="hidden md:block" data-aos="fade-right">
            <div className="flex justify-center">
              <Image width={700} height={20} src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg" alt="dashboard image" />
            </div>
          </div>
      </div>
    </section>
  )
}

export default SystemHealth