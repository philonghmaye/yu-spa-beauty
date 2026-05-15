'use client';

import { FiTrash2 } from 'react-icons/fi';
import { deleteReview } from '@/actions/reviews';
import toast from 'react-hot-toast';

export default function ReviewAdminActions({ reviewId }: { reviewId: string }) {
  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('Đã xóa đánh giá');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <button
      className="btn btn-ghost btn-sm"
      style={{ padding: '4px 10px', color: 'var(--error)' }}
      onClick={handleDelete}
      title="Xóa đánh giá"
    >
      <FiTrash2 />
    </button>
  );
}
