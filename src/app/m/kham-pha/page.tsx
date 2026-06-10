'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StaffList from '../StaffList';

/**
 * Trang khám phá nhân viên — Client-side fetching.
 * Trước đây: Server Component gọi getStaffForMobile() → chờ cold start.
 * Bây giờ: Static shell + client fetch từ cached API.
 */
export default function ExplorePage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');

  const [staff, setStaff] = useState<any[]>([]);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'staff_cache';

    // Check cache trước
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 120000) {
          setStaff(data);
          setLoading(false);
          // Background refresh
          fetch('/api/m/staff').then(r => r.json()).then(freshData => {
            setStaff(freshData);
            sessionStorage.setItem(cacheKey, JSON.stringify({ data: freshData, ts: Date.now() }));
          }).catch(() => {});
          // Fetch service info if needed
          if (serviceId) fetchServiceInfo(serviceId);
          return;
        }
      }
    } catch {}

    // Fetch staff list
    fetch('/api/m/staff')
      .then(r => r.json())
      .then(data => {
        setStaff(data);
        setLoading(false);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
      })
      .catch(() => setLoading(false));

    // Fetch service info if service param exists
    if (serviceId) fetchServiceInfo(serviceId);
  }, [serviceId]);

  const fetchServiceInfo = async (svcId: string) => {
    try {
      // Use categories API to find service - lightweight
      const res = await fetch(`/api/m/categories`);
      const categories = await res.json();
      // Search through categories won't work, need dedicated endpoint
      // For now, pass null and let StaffList handle it
    } catch {}
  };

  if (loading) {
    return (
      <>
        <div className="m-topbar">
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 20, marginLeft: 8 }} />
        </div>
        <div style={{ padding: '0 16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="m-staff-card" style={{ display: 'flex', gap: 14, padding: 14, marginBottom: 0 }}>
              <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 8 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 14 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return <StaffList initialStaff={staff} serviceFilter={serviceInfo} />;
}
