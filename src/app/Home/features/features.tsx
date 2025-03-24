"use client";
import Image from "next/image";

const l = [
  {
    id: 1,
    name: 'استضافة الخوادم  داخل المملكة العربية السعودية',
    image: '/hero/data-center1.png'
  },
  {
    id: 2,
    name: 'حوكمة الاجراءت.',
    image: '/hero/process1.png'
  },
  {
    id: 3,
    name: 'الحوكمة المالية لتحقيق معيار السلامة المالية.',
    image: '/hero/security-system.png'
  },
  {
    id: 4,
    name: 'يحقق متطلبات الامن السبراني.',
    image: '/hero/computer.png'
  },
  {
    id: 5,
    name: 'الدعم الفني والصيانة.',
    image: '/hero/computer.png'
  },
  {
    id: 6,
    name: 'الصيانة الدورية لضمان استمرارية الاعمال.',
    image: '/hero/optimize.png'
  },
  {
    id: 7,
    name: 'المحادثة الفورية مع فريق الدعم الفني.',
    image: '/hero/continuous.png'
  },
  {
    id: 8,
    name: 'النسخ الاحتياطي.',
    image: '/hero/chat-bubble.png'
  },
  {
    id: 9,
    name: 'التطوير المستمر .',
    image: '/hero/cloud-upload.png'
  },
  {
    id: 10,
    name: 'التكامل بين الانظمة مع مركزية قاعدة البيانات.',
    image: '/hero/continuous-improvement.png'
  }
]
const Features = () => {

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-screen-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-none text-success" data-aos="zoom-in">مــا يميزنــــا</h1>
      </div>
      <div className="mx-3 md:mx-auto max-w-screen-2xl">
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
                      {item.name}
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
                      {item.name}
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