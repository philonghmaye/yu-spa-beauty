const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.service.findMany({ where: { isActive: true }, select: { name: true } })
  .then(r => {
    r.filter(s => s.name.length > 35).forEach(s => console.log(`  '${s.name}',`));
  })
  .finally(() => p.$disconnect());
