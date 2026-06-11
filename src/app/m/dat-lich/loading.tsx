export default function BookingLoading() {
  return (
    <>
      <div className="m-topbar">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 6, marginLeft: 8 }} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {/* Service card skeleton */}
        <div style={{ background: 'var(--white)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 6, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 6, marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div>
              <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 6 }} />
            </div>
          </div>
        </div>
        {/* Date picker skeleton */}
        <div style={{ background: 'var(--white)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 6, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '100%', height: 44, borderRadius: 10 }} />
        </div>
      </div>
    </>
  );
}
