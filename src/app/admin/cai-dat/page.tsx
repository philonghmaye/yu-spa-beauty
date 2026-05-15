export const revalidate = 30;

import { getBusinessHours } from '@/actions/settings';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const businessHours = await getBusinessHours();

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Cài đặt</h1>
      </div>

      <SettingsForm initialData={businessHours} />
    </>
  );
}
