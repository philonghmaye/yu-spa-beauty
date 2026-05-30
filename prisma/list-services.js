const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { name: true, slug: true } });
  console.log('=== CATEGORIES ===');
  cats.forEach(c => console.log(`  '${c.name}' (${c.slug})`));

  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { name: true, description: true } });
  console.log('\n=== SERVICES ===');
  services.forEach(s => console.log(`  '${s.name}' => '${s.description || ''}'`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
