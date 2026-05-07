import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();
async function main() {
  const packages = await prisma.package.findMany({ select: { id: true, name_ar: true } });
  console.log('Current Packages:', packages);
  const systems = await prisma.system.findMany({ select: { id: true, name_ar: true }, take: 5 });
  console.log('Sample Systems:', systems);
}
main().finally(() => prisma.$disconnect());
