import prisma from '../src/lib/prisma';

async function testDeletePromo() {
  try {
    const promo = await prisma.promotion.findFirst({
      include: { appointments: { select: { id: true } } },
    });
    
    if (!promo) {
      console.log('No promotions found');
      return;
    }

    console.log('Promo:', promo.id, promo.name, promo.code);
    console.log('Linked appointments:', promo.appointments.length);

    // Disconnect appointments
    await prisma.appointment.updateMany({
      where: { promotionId: promo.id },
      data: { promotionId: null },
    });
    console.log('✓ Appointments disconnected');

    // Delete
    await prisma.promotion.delete({ where: { id: promo.id } });
    console.log('✅ Promotion deleted!');
  } catch (e: any) {
    console.error('❌ Error:', e.message);
    console.error('Code:', e.code);
    console.error('Meta:', JSON.stringify(e.meta));
  } finally {
    await prisma.$disconnect();
  }
}

testDeletePromo();
