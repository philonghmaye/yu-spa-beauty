export default function ServiceLoading() {
  return (
    <>
      <div className="m-topbar">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 6 }} />
      </div>
      <div style={{ padding: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <div className="skeleton" style={{ width: 100, height: 80, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
