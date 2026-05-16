export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FiPhone, FiMail } from 'react-icons/fi';

export default async function AdminStaffMobilePage() {
  const staff = await prisma.employee.findMany({
    include: {
      user: { select: { name: true, phone: true, email: true, isActive: true, avatar: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      skills: { include: { service: { select: { name: true } } } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px', color: '#fff' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>👥 Quản lý nhân viên</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{staff.length} nhân viên</div>
      </div>

      <div style={{ padding: '16px' }}>
        {staff.map((emp) => {
          const avatar = emp.images[0]?.url || emp.user.avatar;
          return (
            <div key={emp.id} style={{
              background: '#fff', borderRadius: 12, padding: '14px 16px',
              marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              opacity: emp.user.isActive ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Avatar */}
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                  background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: '2px solid #e9d5ff',
                }}>
                  {avatar ? (
                    <img src={avatar} alt={emp.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.2rem', color: '#7c3aed', fontWeight: 600 }}>{emp.user.name.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emp.user.name}</span>
                    <span style={{
                      fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10,
                      background: emp.user.isActive ? '#dcfce7' : '#fee2e2',
                      color: emp.user.isActive ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                    }}>
                      {emp.user.isActive ? 'Đang làm' : 'Nghỉ'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
                    {emp.position || 'Nhân viên'} {emp.experience ? `• ${emp.experience} năm KN` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 4, display: 'flex', gap: 12 }}>
                    {emp.user.phone && <span><FiPhone style={{ verticalAlign: 'middle', marginRight: 2 }} size={11} />{emp.user.phone}</span>}
                    <span>📋 {emp._count.appointments} lịch hẹn</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {emp.skills.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                  {emp.skills.slice(0, 4).map(sk => (
                    <span key={sk.serviceId} style={{
                      fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6,
                      background: '#f3e8ff', color: '#7c3aed',
                    }}>
                      {sk.service.name}
                    </span>
                  ))}
                  {emp.skills.length > 4 && (
                    <span style={{ fontSize: '0.68rem', color: '#999' }}>+{emp.skills.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
