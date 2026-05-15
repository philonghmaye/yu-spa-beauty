export const revalidate = 30;

import { getStaffList } from '@/actions/staff';
import { getServices } from '@/actions/services';
import prisma from '@/lib/prisma';
import StaffActions from './StaffActions';
import StaffImages from './StaffImages';
import { FiUser } from 'react-icons/fi';

export default async function StaffAdminPage() {
  const [staffList, services] = await Promise.all([getStaffList(), getServices()]);

  // Get images for all staff
  const allImages = await prisma.employeeImage.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  const imagesByEmployee = allImages.reduce((acc, img) => {
    (acc[img.employeeId] = acc[img.employeeId] || []).push(img);
    return acc;
  }, {} as Record<string, typeof allImages>);

  const allServices = services.filter(s => s.isActive).map(s => ({ id: s.id, name: s.name, category: s.category.name }));

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý nhân viên</h1>
        <StaffActions mode="header" allServices={allServices} />
      </div>

      <div className="grid grid-3">
        {staffList.map((emp) => {
          const empImages = imagesByEmployee[emp.id] || [];
          const firstImage = empImages[0]?.url || emp.user.avatar;

          return (
            <div key={emp.id} className="card" style={{ opacity: emp.user.isActive ? 1 : 0.5 }}>
              <div className="card-body" style={{ textAlign: 'center' }}>
                {/* Avatar / First Image */}
                <div style={{
                  width: 72, height: 72, margin: '0 auto 12px', borderRadius: '50%',
                  overflow: 'hidden', background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {firstImage ? (
                    <img src={firstImage} alt={emp.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiUser style={{ fontSize: '1.5rem', color: 'var(--primary)' }} />
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{emp.user.name}</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginBottom: '4px' }}>{emp.position || 'Nhân viên'}</p>
                <p style={{ color: 'var(--neutral-400)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {emp.user.phone} {emp.experience ? `• ${emp.experience} năm KN` : ''}
                </p>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                  {emp.skills.length > 0
                    ? emp.skills.map(sk => <span key={sk.service.id} className="badge badge-accent">{sk.service.name}</span>)
                    : <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>Chưa gán kỹ năng</span>
                  }
                </div>

                {/* Schedule summary */}
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginBottom: '12px' }}>
                  {emp.schedules.filter(s => s.isActive).length > 0
                    ? `Lịch làm: ${emp.schedules.filter(s => s.isActive).map(s => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][s.dayOfWeek]).join(', ')}`
                    : 'Chưa có lịch làm'}
                </div>

                {/* Actions row with images button */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                  <StaffImages
                    employeeId={emp.id}
                    images={empImages.map(img => ({ id: img.id, url: img.url, sortOrder: img.sortOrder }))}
                  />
                  <StaffActions
                    mode="card-actions"
                    employee={{
                      id: emp.id,
                      name: emp.user.name,
                      phone: emp.user.phone || '',
                      email: emp.user.email || '',
                      position: emp.position || '',
                      bio: emp.bio || '',
                      experience: emp.experience || 0,
                      isActive: emp.user.isActive,
                      skillIds: emp.skills.map(sk => sk.service.id),
                      schedules: emp.schedules,
                    }}
                    allServices={allServices}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {staffList.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--neutral-400)' }}>
            Chưa có nhân viên nào. Bấm &quot;Thêm nhân viên&quot; để bắt đầu.
          </div>
        )}
      </div>
    </>
  );
}
