export default function ActivityLoading() {
  return (
    <>
      <div className="m-topbar">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 100, height: 18, borderRadius: 6 }} />
      </div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        {[60, 70, 80].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 32, borderRadius: 20 }} />
        ))}
      </div>
      {/* Activity cards */}
      <div style={{ padding: '0 16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: 16, padding: 16, background: 'var(--white)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 12 }} />
            </div>
            <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '60%', height: 12, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </>
  );
}
