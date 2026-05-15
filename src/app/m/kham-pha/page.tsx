import { getStaffForMobile } from '@/actions/mobile';
import StaffList from '../StaffList';

export default async function ExplorePage() {
  const staff = await getStaffForMobile();
  return <StaffList initialStaff={staff} />;
}
