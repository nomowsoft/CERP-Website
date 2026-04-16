"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Programs } from "@/utils/types";
import { useTranslations } from "next-intl";
import { Layers, CheckCircle } from "lucide-react";

const data: Programs[] = [
  {
    id: 1,
    img: "/programs/1.svg",
    nameKey: "coreSystems",
    descKey: "coreSystemsDesc"
  },
  {
    id: 2,
    img: "/programs/16.svg",
    nameKey: "financialAssets",
    descKey: "financialAssetsDesc"
  },
  {
    id: 3,
    img: "/programs/2.svg",
    nameKey: "financialResources",
    descKey: "financialResourcesDesc"
  },
  {
    id: 4,
    img: "/programs/3.svg",
    nameKey: "plansBudgets",
    descKey: "plansBudgetsDesc"
  },
  {
    id: 5,
    img: "/programs/4.svg",
    nameKey: "strategicPlan",
    descKey: "strategicPlanDesc"
  },
  {
    id: 6,
    img: "/programs/5.svg",
    nameKey: "volunteerManagement1",
    descKey: "volunteerManagementDesc1"
  },
  {
    id: 7,
    img: "/programs/6.svg",
    nameKey: "volunteerManagement",
    descKey: "volunteerManagementDesc"
  },
  {
    id: 8,
    img: "/programs/7.svg",
    nameKey: "assetsManagement",
    descKey: "assetsManagementDesc"
  },
  {
    id: 9,
    img: "/programs/8.svg",
    nameKey: "investmentPortfolioSystem",
    descKey: "investmentPortfolioSystemDesc"
  },
  {
    id: 10,
    img: "/programs/9.svg",
    nameKey: "inventorySystem",
    descKey: "inventorySystemDesc"
  },
  {
    id: 11,
    img: "/programs/10.svg",
    nameKey: "hrSaudiCompliant",
    descKey: "hrSaudiCompliantDesc"
  },
  {
    id: 12,
    img: "/programs/11.svg",
    nameKey: "selfServiceApp",
    descKey: "selfServiceAppDesc"
  },
  {
    id: 13,
    img: "/programs/12.svg",
    nameKey: "membershipSystem",
    descKey: "membershipSystemDesc"
  },
  {
    id: 14,
    img: "/programs/13.svg",
    nameKey: "fleetManagement",
    descKey: "fleetManagementDesc"
  },
  {
    id: 15,
    img: "/programs/14.svg",
    nameKey: "assistanceAndRequestsSystem",
    descKey: "assistanceDesc"
  },
  {
    id: 16,
    img: "/programs/15.svg",
    nameKey: "procurementSystem",
    descKey: "procurementSystemDesc"
  },
]

export const Program = () => {
    const t = useTranslations('programs');
    return (
        <section className="py-16 lg:py-20 relative overflow-hidden bg-white z-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="mx-auto container px-4 lg:px-20 xl:px-20 2xl:px-0 relative z-10">
                <div className="flex flex-col items-center mb-12 text-center" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary font-bold mb-6 border border-primary/20">
                        <Layers className="w-5 h-5 drop-shadow-sm" />
                        <span>{t('systemsTag')}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-doto2 font-bold mb-6 text-gray-900 leading-tight">
                        {t.rich('programsHeading', {
                            highlight: (chunks) => <span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent inline-block pb-2 px-1">{chunks}</span>
                        })}
                    </h2>
                    
                    <p className="text-xl text-gray-500 mb-8 max-w-3xl leading-relaxed">
                        {t('programsSubHeading')}
                    </p>
                </div>

                {/* Core Systems Banner Feature */}
                <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
                    <div className="bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] p-[2px] shadow-[0_8px_30px_rgb(var(--primary-rgb),0.2)] overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
                        <div className="bg-white rounded-[calc(2.5rem-2px)] p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 auto-blur rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="bg-primary/5 p-6 rounded-3xl flex-shrink-0 border border-primary/10 shadow-inner group">
                                    <Image src={data[0].img} alt="" width={100} height={100} className="drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 text-center md:text-start">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary font-bold text-sm mb-4 border border-secondary/20">
                                        <CheckCircle className="w-4 h-4" /> 
                                        <span>نواة النظام الأساسية</span>
                                    </div>
                                    <h3 className="font-doto2 text-3xl md:text-4xl font-bold mb-4 text-gray-900">{t(data[0].nameKey)}</h3>
                                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl">{t(data[0].descKey)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid of Other Systems */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.slice(1).map((post, index) => (
                        <div 
                            key={post.id}
                            data-aos="fade-up"
                            data-aos-delay={50 + ((index % 4) * 50)}
                            className="h-full"
                        >
                            <div className="group h-full bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.12)] hover:-translate-y-2 hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                
                                <div className="flex flex-col items-start gap-5 relative z-10 flex-1">
                                    <div className="bg-gray-50/80 group-hover:bg-white group-hover:shadow-md border border-gray-100 p-4 rounded-[1.5rem] flex-shrink-0 transition-all duration-300">
                                        <Image
                                            src={post.img}
                                            alt={t(post.nameKey)}
                                            width={56}
                                            height={56}
                                            className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 drop-shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1 w-full text-start">
                                        <h4 className="font-doto2 font-bold text-xl text-gray-900 leading-snug mb-2 group-hover:text-primary transition-colors">
                                            {t(post.nameKey)}
                                        </h4>
                                        <p className="text-[15px] text-gray-500 leading-relaxed">
                                            {t(post.descKey)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
