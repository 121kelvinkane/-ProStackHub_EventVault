const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test event...');
  await prisma.event.create({
    data: {
      name: 'Tech Conference 2026',
      description: 'The biggest tech event of the year',
      date: new Date('2026-12-01T10:00:00Z'),
      location: 'Convention Center, NY',
      generalPrice: 5000,
      vipPrice: 15000,
      premiumPrice: 30000,
      generalStock: 100,
      vipStock: 50,
      premiumStock: 20,
    }
  });
  console.log('? Event seeded successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });