export default function StaffListLoading() {
  return (
    <>
      <div className="m-topbar">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 20, marginLeft: 8 }} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="m-staff-card" style={{ display: 'flex', gap: 14, padding: 14, marginBottom: 0 }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 14 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
