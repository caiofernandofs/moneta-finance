import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { name: 'Salário', icon: 'Briefcase', color: '#10B981' },
    { name: 'Alimentação', icon: 'Utensils', color: '#EF4444' },
    { name: 'Transporte', icon: 'Car', color: '#3B82F6' },
    { name: 'Lazer', icon: 'Tv', color: '#F59E0B' },
    { name: 'Saúde', icon: 'Heart', color: '#EC4899' },
    { name: 'Outros', icon: 'CircleEllipsis', color: '#6B7280' },
  ];

  console.log('🌱 Alimentando o banco com categorias padrão...');

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categorias cadastradas com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });