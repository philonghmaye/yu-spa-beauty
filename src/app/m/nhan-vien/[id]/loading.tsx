export default function StaffDetailLoading() {
  return (
    <>
      {/* Hero image */}
      <div className="skeleton" style={{ width: '100%', height: 320 }} />
      {/* Staff info */}
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ width: '50%', height: 24, borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '35%', height: 14, borderRadius: 6, marginBottom: 16 }} />
        {/* Guarantee card */}
        <div className="skeleton" style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 16 }} />
        {/* Bio */}
        <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 6, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 6, marginBottom: 20 }} />
      </div>
      {/* Services */}
      <div style={{ padding: '0 16px' }}>
        <div className="skeleton" style={{ width: 100, height: 18, borderRadius: 6, marginBottom: 12 }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, padding: 12, background: 'var(--white)', borderRadius: 12 }}>
            <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '30%', height: 14, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
