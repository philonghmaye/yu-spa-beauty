const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cats = await p.category.findMany({
    where: { isActive: true },
    select: { name: true, slug: true, image: true },
    orderBy: { sortOrder: 'asc' },
  });
  console.log(JSON.stringify(cats, null, 2));
  await p.$disconnect();
}

main();
