"use client";
import Image from "next/image";

const l = [
  {
    id:1, 
    name:'الخوادم داخل المملكة',
    image: '/hero/data-center1.png'
  },
  {
    id:2, 
    name:'حوكمة الاجراءت',
    image: '/hero/process1.png'
  },
  {
    id:3, 
    name:'الحوكمة معيار السلامة المالية',
    image: '/hero/security-system.png'
  },
  {
    id:4, 
    name:'يحقق متطلبات الامن السبراني',
    image: '/hero/computer.png'
  },
  {
    id:5, 
    name:'الدعم الفني والصيانة',
    image: '/hero/optimize.png'
  },
  {
    id:6, 
    name:'استمرارية الاعمال',
    image: '/hero/continuous.png'
  },
  {
    id:7, 
    name:'المحادثة الفورية مع فريق الدعم الفني',
    image: '/hero/chat-bubble.png'
  },
  {
    id:8, 
    name:'النسخ الاحتياطي',
    image: '/hero/cloud-upload.png'
  },
  {
    id:9, 
    name:'التطوير المستمر',
    image: '/hero/continuous-improvement.png'
  },
  {
    id:10, 
    name:'التكامل بين الانظمة',
    image: '/hero/engineering.png'
  },
]
const Features = () => {

  return (
    <section className="lg:mx-20 pb-12">
      <div className="mx-auto max-w-screen-xl text-center">
          <h1 className="mb-4 text-xl md:text-4xl font-bold tracking-tight leading-none text-success" data-aos="zoom-in">ما يميز سربCERP</h1>
      </div>
      <div className="mx-3 md:mx-32">
        <div className="grid md:grid-cols-5 md:grid-rows-2 gap-y-2">
          {l.map((item)=>(
            <div className="text-center" key={item.id}>
              <div className="flex justify-center" data-aos="zoom-in">
                <Image src={item.image} width={100} height={20} alt="..." />
              </div>
              <h1 className="text-success font-bold text-lg text-center md:mx-0 mx-12 mt-1" key={item.id} data-aos="zoom-in">
                {item.name}
              </h1>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features