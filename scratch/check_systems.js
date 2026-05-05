const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const systems = await prisma.system.findMany();
    console.log(JSON.stringify(systems, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
