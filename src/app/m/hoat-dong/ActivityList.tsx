'use client';

import { useState } from 'react';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import { createReview } from '@/actions/account';
import toast from 'react-hot-toast';
import { FiStar, FiX } from 'react-icons/fi';

interface Activity {
  id: string; date: string; startTime: string; endTime: string;
  status: string; services: string[]; employeeName: string | null;
  employeeId: string | null; totalAmount: number;
  hasReview: boolean; reviewRating: number | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function ActivityList({ initialData, userId }: { initialData: Activity[]; userId: string }) {
  const [filter, setFilter] = useState('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const filtered = initialData.filter(a => {
    if (filter === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(a.status);
    if (filter === 'completed') return a.status === 'COMPLETED';
    return true;
  });

  const handleSubmitReview = async () => {
    if (!reviewingId) return;
    setSubmitting(true);
    try {
      await createReview({ appointmentId: reviewingId, userId, rating, comment: comment.trim() || undefined });
      toast.success('Đánh giá thành công! Cảm ơn bạn ❤️');
      setReviewedIds(prev => new Set(prev).add(reviewingId));
      setReviewingId(null);
      setRating(5);
      setComment('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      toast.error(message);
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="m-topbar">
        <span className="m-topbar-title" style={{ marginRight: 0 }}>Hoạt động</span>
      </div>

      <div className="m-filter-tabs">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'upcoming', label: 'Sắp tới' },
          { key: 'completed', label: 'Hoàn thành' },
        ].map(f => (
          <button key={f.key} className={`m-filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? filtered.map(a => {
        const isReviewed = a.hasReview || reviewedIds.has(a.id);
        const canReview = a.status === 'COMPLETED' && !isReviewed;

        return (
          <div key={a.id} className="m-activity-card">
            <div className="top">
              <span className="service-name">{a.services.join(', ')}</span>
              <span className={`badge badge-${getStatusColor(a.status)}`} style={{ fontSize: '0.72rem' }}>
                {getStatusLabel(a.status)}
              </span>
            </div>
            <div className="details">
              <div>📅 {a.date} | 🕐 {a.startTime} — {a.endTime}</div>
              {a.employeeName && <div>👤 {a.employeeName}</div>}
            </div>
            <div className="bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="price">{formatCurrency(a.totalAmount)}</span>
              {isReviewed && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiStar style={{ fill: '#f59e0b' }} /> Đã đánh giá
                </span>
              )}
              {canReview && (
                <button
                  onClick={() => { setReviewingId(a.id); setRating(5); setComment(''); }}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    color: '#fff', border: 'none', fontSize: '0.78rem',
                    fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <FiStar style={{ fontSize: '0.7rem' }} /> Đánh giá
                </button>
              )}
            </div>
          </div>
        );
      }) : (
        <div className="m-empty">
          <div className="icon">📋</div>
          <p>Chưa có hoạt động nào</p>
        </div>
      )}

      {/* Review Modal */}
      {reviewingId && (() => {
        const activity = initialData.find(a => a.id === reviewingId);
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }} onClick={() => setReviewingId(null)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: '20px 20px 0 0',
                width: '100%', maxWidth: 480, padding: '24px 20px 32px',
                animation: 'slideUp 0.3s ease',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>⭐ Đánh giá dịch vụ</h3>
                <button onClick={() => setReviewingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <FiX style={{ fontSize: '1.2rem', color: '#999' }} />
                </button>
              </div>

              {/* Service & Staff Info */}
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{activity?.services.join(', ')}</div>
                {activity?.employeeName && (
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>👤 {activity.employeeName}</div>
                )}
              </div>

              {/* Star Rating */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>Chạm để đánh giá</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '2rem', padding: 0,
                        color: star <= rating ? '#f59e0b' : '#e5e7eb',
                        transition: 'transform 0.15s',
                        transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginTop: 4 }}>
                  {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt!' : rating === 3 ? 'Tốt' : rating === 2 ? 'Bình thường' : 'Kém'}
                </div>
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn... (tùy chọn)"
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1px solid #e5e7eb', fontSize: '0.88rem',
                  resize: 'none', outline: 'none', fontFamily: 'inherit',
                  marginBottom: 16,
                }}
              />

              {/* Submit */}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px', borderRadius: 'var(--radius-full)',
                  background: submitting ? '#d1d5db' : 'linear-gradient(135deg, #f59e0b, #f97316)',
                  color: '#fff', border: 'none', fontSize: '0.9rem',
                  fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
