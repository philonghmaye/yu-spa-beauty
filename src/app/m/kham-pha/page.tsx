import { getStaffForMobile } from '@/actions/mobile';
import prisma from '@/lib/prisma';
import StaffList from '../StaffList';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service: serviceId } = await searchParams;
  const staff = await getStaffForMobile();

  // If a specific service is requested, get its full info
  let serviceInfo: { id: string; name: string; categoryName: string; price: number; discountPrice: number | null; duration: number } | null = null;
  if (serviceId) {
    const svc = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, price: true, discountPrice: true, duration: true, category: { select: { name: true } } },
    });
    if (svc) {
      serviceInfo = {
        id: svc.id,
        name: svc.name,
        categoryName: svc.category.name,
        price: svc.price,
        discountPrice: svc.discountPrice,
        duration: svc.duration,
      };
    }
  }

  return <StaffList initialStaff={staff} serviceFilter={serviceInfo} />;
}
