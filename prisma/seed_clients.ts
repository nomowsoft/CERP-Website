import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding clients...');

  // Delete existing clients to avoid duplicates
  await prisma.client.deleteMany({});

  const clientsData = [
    { name: 'Client 1', image: '/customer_partner/Feature.png' },
    { name: 'Client 2', image: '/customer_partner/Feature (1).png' },
    { name: 'Client 3', image: '/customer_partner/Feature (2).png' },
    { name: 'Client 4', image: '/customer_partner/Feature (3).png' },
    { name: 'Client 5', image: '/customer_partner/Feature (4).png' },
    { name: 'Client 6', image: '/customer_partner/Feature (5).png' },
    { name: 'Client 7', image: '/customer_partner/Feature (6).png' },
    { name: 'Client 8', image: '/customer_partner/Feature (7).png' },
    { name: 'Client 9', image: '/customer_partner/Feature (8).png' },
    { name: 'Client 10', image: '/customer_partner/Feature (9).png' },
    { name: 'Client 11', image: '/customer_partner/Feature (10).png' },
    { name: 'Client 12', image: '/customer_partner/Feature (11).png' },
  ];

  for (const client of clientsData) {
    await prisma.client.create({
      data: {
        name: client.name,
        image: client.image,
      },
    });
  }

  console.log('Clients seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
