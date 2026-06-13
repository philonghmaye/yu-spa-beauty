/**
 * Loading skeleton cho trang chủ mobile — hiển thị ngay lập tức
 * trong khi chờ dữ liệu từ DB (giải quyết Neon cold start)
 */
export default function MobileHomeLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
          <div>
            <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        </div>
      </div>

      {/* Promo Banner skeleton */}
      <div style={{ margin: '0 16px 16px' }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
      </div>

      {/* Hero Card skeleton */}
      <div style={{ padding: '0 16px' }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 16, marginBottom: 14 }} />
      </div>

      {/* Category chips skeleton */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 6, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {[80, 100, 70, 90, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 32, borderRadius: 20, flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Staff skeleton */}
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 6, marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: 130, textAlign: 'center', flexShrink: 0 }}>
              <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 8px' }} />
              <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6, margin: '0 auto 4px' }} />
              <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 6, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
