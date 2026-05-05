import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const systems = await prisma.system.findMany();
        console.log("SYSTEMS_START");
        console.log(JSON.stringify(systems, null, 2));
        console.log("SYSTEMS_END");
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
