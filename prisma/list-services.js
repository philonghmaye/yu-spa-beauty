const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.service.findMany({
  where: { isActive: true },
  select: { name: true, category: { select: { name: true, slug: true } } },
  orderBy: { category: { name: 'asc' } },
}).then(r => {
  const byCategory = {};
  r.forEach(s => {
    if (!byCategory[s.category.name]) byCategory[s.category.name] = [];
    byCategory[s.category.name].push(s.name);
  });
  // Show categories with untranslated-looking names
  for (const [cat, services] of Object.entries(byCategory)) {
    console.log(`\n=== ${cat} (${services.length} services) ===`);
    services.forEach(n => console.log(`  '${n}'`));
  }
}).finally(() => p.$disconnect());
