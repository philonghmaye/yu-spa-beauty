export const revalidate = 30;

import { getServices, getCategories } from '@/actions/services';
import ServiceActions from './ServiceActions';
import ServiceList from './ServiceList';

export default async function ServicesAdminPage() {
  const [services, categories] = await Promise.all([getServices(), getCategories()]);

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý dịch vụ</h1>
        <ServiceActions services={services} categories={categories} mode="header" />
      </div>

      <ServiceList services={services} categories={categories} />
    </>
  );
}
