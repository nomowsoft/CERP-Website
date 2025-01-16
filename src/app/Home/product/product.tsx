"use client";
import Image from "next/image";
import Link from "next/link";

const l = [
  {
    id:1, 
    name:'النظام المالي والاصول',
    image: '/product/financial-strategy.png'
  },
  {
    id:2, 
    name:'نظام الموارد المالية',
    image: '/product/resources-management.png'
  },
  {
    id:3, 
    name:'الخطط والموازنات',
    image: '/product/accounting.png'
  },
  {
    id:4, 
    name:'الخطة الاستراتيجية',
    image: '/product/roadmap.png'
  },
  {
    id:5, 
    name:'الاتصالات الادارية ',
    image: '/product/administration.png'
  },
  {
    id:6, 
    name:'ادارة التطوع',
    image: '/product/volunteering.png'
  },
  {
    id:7, 
    name:'ادارة الاملاك',
    image: '/product/property-contract.png'
  },
  {
    id:8, 
    name:'نظام  المشتريات ',
    image: '/product/procurement.png'
  },
  {
    id:9, 
    name:'نظام  المخزون',
    image: '/product/inventory-management.png'
  },
  {
    id:10, 
    name:'تطبيق الخدمة الذاتية للموظفين',
    image: '/product/self-service.png'
  },
  {
    id:11, 
    name:'نظام العضويات',
    image: '/product/card.png'
  },
  {
    id:12, 
    name:'ادارة الاسطول',
    image: '/product/product-management.png'
  },
  {
    id:13, 
    name:'الموارد البشرية المتوافق مع انظمة العمل السعودي',
    image: '/product/hr.png'
  },
  {
    id:14, 
    name:'نظام ادارة المساعدة وادارة طلبات الادارات المختلفة',
    image: '/product/ticketing.png'
  },
]

const Product = () => {

  return (
    <section className="py-12 bg-product bg-no-repeat bg-right-bottom">
      <div className="mx-auto max-w-screen-xl text-center pb-4">
          <h1 className="mb-4 text-3xl md:text-4xl font-extralight tracking-tight leading-none text-success" data-aos="zoom-in">أنظمة سربCERP</h1>
      </div>
      <div className="mx-3 md:mx-32">
        <div className="grid md:grid-cols-5 md:grid-rows-2 gap-10">
          {l.map((item)=>(
            <Link key={item.id}  href="#" >
              <div data-aos="zoom-in" className="flex flex-col p-4 text-center text-success rounded-xl border border-success shadow h-52">
                <div className="text-center">
                  <div className="flex justify-center">
                    <Image src={item.image} width={100} height={20} alt="..." />
                  </div>
                  <h1 className="text-success text-2xl text-center mt-2" key={item.id} >
                    {item.name}
                  </h1>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Product