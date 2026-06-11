export default function CategoryDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="skeleton" style={{ width: '100%', height: 260 }} />
      
      {/* Service list skeleton */}
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 20, marginBottom: 16 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#fff', borderRadius: 12 }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 14 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
