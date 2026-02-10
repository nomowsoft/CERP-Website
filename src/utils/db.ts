// Forced reload at 2026-02-08T14:35:00
import { PrismaClient } from "@/generated/prisma/client";

const prismaClientSingleton = () => {
    // console.log("Initializing new PrismaClient instance"); 
    return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

// Forced reset at 2026-02-08T14:40:00
if (globalThis && (globalThis as any).prisma) {
    (globalThis as any).prisma.$disconnect?.();
    (globalThis as any).prisma = undefined;
}

const prisma = prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}