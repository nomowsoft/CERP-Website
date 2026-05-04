import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const systems = await prisma.system.findMany({
        select: {
            id: true,
            name: true,
            icon: true
        }
    });

    console.log("Systems Check:");
    systems.forEach(s => {
        if (s.icon) {
            const str = s.icon.toString('utf8');
            console.log(`ID: ${s.id}, Name: ${s.name}, Icon Length: ${s.icon.length}`);
            if (str.startsWith('http') || str.startsWith('data:image')) {
                console.log(`   WARNING: Icon looks like a string: ${str.substring(0, 50)}...`);
            } else {
                console.log(`   Icon looks like binary data (first 10 bytes): ${s.icon.slice(0, 10).toString('hex')}`);
            }
        } else {
            console.log(`ID: ${s.id}, Name: ${s.name}, Icon: null`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
