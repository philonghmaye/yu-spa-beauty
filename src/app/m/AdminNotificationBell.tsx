'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiBell, FiX, FiClock } from 'react-icons/fi';

interface NotificationItem {
  id: string;
  createdAt: string;
  appointment: {
    id: string;
    customerName: string;
    customerPhone: string;
    services: string[];
    appointmentDate: string;
    startTime: string;
    endTime: string;
    finalAmount: number;
  } | null;
}

export default function AdminNotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count || 0);
      setNotifications(data.notifications || []);

      // Play sound and vibrate when new notification arrives
      if (data.count > prevCount && prevCount >= 0) {
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      setPrevCount(data.count || 0);
    } catch {
      // silently fail
    }
  }, [prevCount]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleClearAll = async () => {
    try {
      await fetch('/api/admin/notifications', { method: 'POST' });
      setCount(0);
      setNotifications([]);
      setShowPanel(false);
    } catch {
      // silently fail
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          width: 38, height: 38, borderRadius: '50%',
          background: count > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.1rem', cursor: 'pointer',
        }}
      >
        <FiBell />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #7c3aed',
            animation: 'pulse-badge 2s ease-in-out infinite',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {showPanel && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 9999,
          }}
          onClick={() => setShowPanel(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 60, right: 12, left: 12,
              maxWidth: 400, margin: '0 auto',
              background: '#fff', borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              maxHeight: '70vh', overflow: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                🔔 Thông báo {count > 0 && <span style={{ color: '#ef4444' }}>({count})</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {count > 0 && (
                  <button
                    onClick={handleClearAll}
                    style={{
                      background: 'none', border: 'none', color: '#7c3aed',
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Đã đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999' }}
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Notification List */}
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} style={{
                padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                background: '#faf5ff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1f2937' }}>
                    📋 Lịch hẹn mới
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                {n.appointment && (
                  <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
                    <div>👤 <strong>{n.appointment.customerName}</strong></div>
                    <div><FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {n.appointment.appointmentDate} • {n.appointment.startTime} - {n.appointment.endTime}
                    </div>
                    <div>💅 {n.appointment.services.join(', ')}</div>
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                <div>Không có thông báo mới</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
