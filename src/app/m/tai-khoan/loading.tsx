export default function AccountLoading() {
  return (
    <>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px' }} />
        <div className="skeleton" style={{ width: 120, height: 18, borderRadius: 6, margin: '0 auto 6px' }} />
        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6, margin: '0 auto' }} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--neutral-100)' }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: '60%', height: 14, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </>
  );
}
