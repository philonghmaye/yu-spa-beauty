'use client';

import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { createReview } from '@/actions/account';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface Props {
  appointmentId: string;
  userId: string;
  serviceName: string;
}

export default function ReviewForm({ appointmentId, userId, serviceName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({ appointmentId, userId, rating, comment: comment || undefined });
      toast.success('Đánh giá thành công!');
      setShowModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      toast.error(message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => setShowModal(true)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
        <FiStar /> Đánh giá
      </button>

      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
              <h3 className="modal-title">Đánh giá dịch vụ</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', right: 0 }}>×</button>
            </div>
            <p style={{ color: 'var(--neutral-500)', marginBottom: '24px', fontSize: '0.9rem' }}>
              {serviceName}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div style={{ marginBottom: '24px' }}>
                <div className="review-stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '2.5rem', padding: '4px', transition: 'transform 0.15s',
                        color: (hoverRating || rating) >= star ? 'var(--gold)' : 'var(--neutral-200)',
                        transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginTop: '8px' }}>
                  {rating === 5 ? 'Tuyệt vời!' :
                   rating === 4 ? 'Rất tốt!' :
                   rating === 3 ? 'Bình thường' :
                   rating === 2 ? 'Chưa hài lòng' :
                   'Rất tệ'}
                </p>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Nhận xét (tùy chọn)</label>
                <textarea
                  className="form-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
