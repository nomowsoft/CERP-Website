
import { PrismaClient } from '../src/generated/prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const data = [
  {
    id: 1,
    img: "1.svg",
    nameKey: "coreSystems",
    descKey: "coreSystemsDesc"
  },
  {
    id: 2,
    img: "16.svg",
    nameKey: "financialAssets",
    descKey: "financialAssetsDesc"
  },
  {
    id: 3,
    img: "2.svg",
    nameKey: "financialResources",
    descKey: "financialResourcesDesc"
  },
  {
    id: 4,
    img: "3.svg",
    nameKey: "plansBudgets",
    descKey: "plansBudgetsDesc"
  },
  {
    id: 5,
    img: "4.svg",
    nameKey: "strategicPlan",
    descKey: "strategicPlanDesc"
  },
  {
    id: 6,
    img: "5.svg",
    nameKey: "volunteerManagement1",
    descKey: "volunteerManagementDesc1"
  },
  {
    id: 7,
    img: "6.svg",
    nameKey: "volunteerManagement",
    descKey: "volunteerManagementDesc"
  },
  {
    id: 8,
    img: "7.svg",
    nameKey: "assetsManagement",
    descKey: "assetsManagementDesc"
  },
  {
    id: 9,
    img: "8.svg",
    nameKey: "investmentPortfolioSystem",
    descKey: "investmentPortfolioSystemDesc"
  },
  {
    id: 10,
    img: "9.svg",
    nameKey: "inventorySystem",
    descKey: "inventorySystemDesc"
  },
  {
    id: 11,
    img: "10.svg",
    nameKey: "hrSaudiCompliant",
    descKey: "hrSaudiCompliantDesc"
  },
  {
    id: 12,
    img: "11.svg",
    nameKey: "selfServiceApp",
    descKey: "selfServiceAppDesc"
  },
  {
    id: 13,
    img: "12.svg",
    nameKey: "membershipSystem",
    descKey: "membershipSystemDesc"
  },
  {
    id: 14,
    img: "13.svg",
    nameKey: "fleetManagement",
    descKey: "fleetManagementDesc"
  },
  {
    id: 15,
    img: "14.svg",
    nameKey: "assistanceAndRequestsSystem",
    descKey: "assistanceDesc"
  },
  {
    id: 16,
    img: "15.svg",
    nameKey: "procurementSystem",
    descKey: "procurementSystemDesc"
  },
];

async function main() {
  const arJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages/ar.json'), 'utf8'));
  const enJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages/en.json'), 'utf8'));

  const programsAr = arJson.programs;
  const programsEn = enJson.programs;

  for (const item of data) {
    const nameAr = programsAr[item.nameKey] || item.nameKey;
    const nameEn = programsEn[item.nameKey] || item.nameKey;
    const descAr = programsAr[item.descKey] || "";
    const descEn = programsEn[item.descKey] || "";

    const iconPath = path.join(process.cwd(), 'public/programs', item.img);
    let iconBuffer = null;
    if (fs.existsSync(iconPath)) {
      iconBuffer = fs.readFileSync(iconPath);
    }

    // Use nameEn as a unique identifier for this seed
    const existing = await prisma.system.findFirst({
      where: { name_en: nameEn }
    });

    if (existing) {
      console.log(`Updating system: ${nameEn}`);
      await prisma.system.update({
        where: { id: existing.id },
        data: {
          name: nameAr,
          name_ar: nameAr,
          name_en: nameEn,
          description: descAr,
          description_ar: descAr,
          description_en: descEn,
          icon: iconBuffer,
        }
      });
    } else {
      console.log(`Creating system: ${nameEn}`);
      await prisma.system.create({
        data: {
          name: nameAr,
          name_ar: nameAr,
          name_en: nameEn,
          description: descAr,
          description_ar: descAr,
          description_en: descEn,
          icon: iconBuffer,
          price: 0,
        }
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
