import { getStaffForMobile } from '@/actions/mobile';
import prisma from '@/lib/prisma';
import StaffList from '../StaffList';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service: serviceId } = await searchParams;
  // Khởi chạy đồng thời các tác vụ lấy dữ liệu
  const staffPromise = getStaffForMobile();
  const servicePromise = serviceId
    ? prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, name: true, price: true, discountPrice: true, duration: true, category: { select: { name: true } } },
      })
    : Promise.resolve(null);

  const [staff, svc] = await Promise.all([staffPromise, servicePromise]);

  // Lấy thông tin dịch vụ nếu được yêu cầu
  let serviceInfo: { id: string; name: string; categoryName: string; price: number; discountPrice: number | null; duration: number } | null = null;
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


  return <StaffList initialStaff={staff} serviceFilter={serviceInfo} />;
}
