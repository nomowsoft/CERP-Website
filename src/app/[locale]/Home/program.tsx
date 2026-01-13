"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Programs } from "@/utils/types";
import { useTranslations } from "next-intl";

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
    <section className="py-40 container mx-auto">
      <section>
        <div className="px-4">
          <div className="flex justify-center">
            <span className="text-primary flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
              <span>{t('systemsTag')}</span>
            </span>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
              {t.rich('programsHeading', {
                highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
              })}
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              {t('programsSubHeading')}
            </p>
          </div>
        </div>
      </section>
      <section>
        <Card
          className="overflow-hidden group border-0 shadow-2xl transition-all duration-300 rounded-3xl bg-info p-10"
        >
          <div className="flex mt-5 items-center">
            <div>
              <Image src={data[0].img} alt="" width={120} height={20} />
            </div>
            <div>
              <h1 className="font-doto text-xl">{t(data[0].nameKey)}</h1>
              <p className="text-gray-500">{t(data[0].descKey)}</p>
            </div>
          </div>
          <hr className="text-gray-400 py-10" />
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8">
            {data.slice(1).map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden group border-0 shadow-xl transition-all duration-300 rounded-xl bg-info hover:scale-105 hover:bg-primary/10"
              >
                <div className="flex mt-5 p-2 items-center gap-3">
                  <div>
                    <Image
                      src={post.img}
                      alt=""
                      width={90}
                      height={40}
                    />
                  </div>

                  <div className="flex-1">
                    <h1 className="font-doto text-xl leading-tight">
                      {t(post.nameKey)}
                    </h1>
                    <p className="text-gray-500 leading-relaxed">
                      {t(post.descKey)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </section>
    </section>
  )
}
