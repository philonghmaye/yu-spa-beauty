'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiBell, FiCheck, FiClock, FiUser, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  createdAt: string;
  appointment: {
    id: string;
    customerName: string;
    customerPhone: string | null;
    services: string[];
    appointmentDate: string;
    startTime: string;
    endTime: string;
    finalAmount: number;
  } | null;
}

function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Play two pleasant tones (like a doorbell)
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playTone(880, 0, 0.3);    // A5
    playTone(1100, 0.15, 0.4); // ~C#6
    playTone(1320, 0.3, 0.5);  // E6
  } catch {
    // Silent fail if audio not supported
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function formatCurrencyShort(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setCount(data.count || 0);

      // Play sound & ring animation when new notifications arrive
      if (data.count > prevCountRef.current && prevCountRef.current >= 0) {
        if (prevCountRef.current > 0 || data.count > 0) {
          // Only play sound if count increased (not on first load with existing notifications)
          if (prevCountRef.current > 0) {
            playNotificationSound();
          }
          setIsRinging(true);
          setTimeout(() => setIsRinging(false), 2000);
        }
      }
      prevCountRef.current = data.count;
    } catch {
      // Silent fail
    }
  }, []);

  // Poll every 15 seconds
  useEffect(() => {
    // Initial fetch
    prevCountRef.current = -1; // Mark as first load
    fetchNotifications().then(() => {
      // After first load, set prevCount properly so next poll can detect new
      // prevCountRef is already set in fetchNotifications
    });

    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/notifications', { method: 'POST' });
      if (res.ok) {
        setNotifications([]);
        setCount(0);
        prevCountRef.current = 0;
      }
    } catch {
      // Silent fail
    }
    setIsClearing(false);
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        className={`notification-bell-btn ${isRinging ? 'ringing' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
        title="Thông báo đặt lịch mới"
      >
        <FiBell />
        {count > 0 && (
          <span className="notification-badge">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Thông báo</h3>
            {count > 0 && (
              <button
                className="notification-mark-read-btn"
                onClick={handleMarkAllRead}
                disabled={isClearing}
              >
                <FiCheck />
                {isClearing ? 'Đang xóa...' : 'Đã đọc tất cả'}
              </button>
            )}
          </div>

          <div className="notification-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <FiBell style={{ fontSize: '2rem', color: 'var(--neutral-300)', marginBottom: '8px' }} />
                <p>Chưa có thông báo mới</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href="/admin/lich-hen"
                  className="notification-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="notification-item-icon">
                    <FiUser />
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-title">
                      <strong>{n.appointment?.customerName || 'Khách hàng'}</strong>
                      {' '}đặt lịch mới
                    </div>
                    {n.appointment && (
                      <>
                        <div className="notification-item-services">
                          {n.appointment.services.join(', ')}
                        </div>
                        <div className="notification-item-meta">
                          <span>
                            <FiClock style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                            {n.appointment.appointmentDate} • {n.appointment.startTime}
                          </span>
                          <span className="notification-item-amount">
                            {formatCurrencyShort(n.appointment.finalAmount)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="notification-item-time">{getRelativeTime(n.createdAt)}</div>
                  </div>
                  <div className="notification-item-arrow">
                    <FiExternalLink />
                  </div>
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown-footer">
              <Link href="/admin/lich-hen" onClick={() => setIsOpen(false)}>
                Xem tất cả lịch hẹn →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
