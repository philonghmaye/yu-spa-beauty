import { auth } from '@/lib/auth';
import { getMyReviews } from '@/actions/account';

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const reviews = await getMyReviews(session.user.id);

  return (
    <>
      <h2 style={{ marginBottom: '24px' }}>Đánh giá của tôi</h2>

      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ border: '1px solid var(--neutral-100)' }}>
              <div className="card-body" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {r.appointment.services.map((s) => s.service.name).join(', ')}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                      📅 {r.appointment.appointmentDate}
                    </div>
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                {r.comment && (
                  <p style={{
                    color: 'var(--neutral-600)', fontStyle: 'italic',
                    background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px', fontSize: '0.9rem', lineHeight: '1.7',
                  }}>
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '8px' }}>
                  Đánh giá lúc: {new Date(r.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '48px', color: 'var(--neutral-400)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Bạn chưa có đánh giá nào</p>
            <p style={{ fontSize: '0.9rem' }}>Hoàn thành dịch vụ để có thể đánh giá</p>
          </div>
        </div>
      )}
    </>
  );
}
