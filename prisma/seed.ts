import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.tenant.upsert({
    where: { slug: 'gozellik-merkezi' },
    update: {},
    create: {
      name: 'Gözəllik və Estetik Mərkəzi',
      slug: 'gozellik-merkezi',
      sector: 'Gözəllik & Qulluq',
      medicalEnabled: false,
      phone: '+994 50 222 33 44',
      address: 'Bakı şəh., Nizami küç. 45'
    }
  });

  await prisma.tenant.upsert({
    where: { slug: 'modern-klinika' },
    update: {},
    create: {
      name: 'Modern Klinika & Stomatologiya',
      slug: 'modern-klinika',
      sector: 'Səhiyyə & Klinika',
      medicalEnabled: true,
      phone: '+994 12 444 55 66',
      address: 'Bakı şəh., Azadlıq pr. 102'
    }
  });

  console.log('Hostinger üçün ilkin məlumatlar (Seeds) bazaya yazıldı.');
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
