export default function CategoryDetailLoading() {
  return (
    <>
      {/* Hero image */}
      <div className="skeleton" style={{ width: '100%', height: 200 }} />
      {/* Title */}
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ width: '60%', height: 22, borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 6, marginBottom: 20 }} />
        {/* Search bar */}
        <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 20, marginBottom: 20 }} />
        {/* Service list */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--neutral-100)' }}>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '75%', height: 16, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '30%', height: 14, borderRadius: 6 }} />
            </div>
            <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 16, alignSelf: 'center' }} />
          </div>
        ))}
      </div>
    </>
  );
}
