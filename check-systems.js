const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    const systems = await prisma.system.findMany({
        select: {
            id: true,
            name: true,
            name_ar: true,
            name_en: true,
            description: true,
            description_ar: true,
            description_en: true
        }
    });
    console.log(JSON.stringify(systems, null, 2));
    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
