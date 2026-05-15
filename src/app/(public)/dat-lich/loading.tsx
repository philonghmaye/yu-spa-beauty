export default function BookingLoading() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div style={{
            width: '250px', height: '36px', margin: '0 auto 12px',
            background: 'rgba(168,85,247,0.1)', borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '350px', height: '20px', margin: '0 auto',
            background: 'rgba(168,85,247,0.06)', borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Steps skeleton */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: '120px', height: '42px',
                background: i === 1 ? 'var(--primary-light)' : 'var(--neutral-100)',
                borderRadius: '20px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
          {/* Content skeleton */}
          <div className="card" style={{ padding: '32px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ marginBottom: '24px' }}>
                <div style={{
                  width: '120px', height: '16px', marginBottom: '8px',
                  background: 'var(--neutral-100)', borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  height: '48px', background: 'var(--neutral-50)',
                  borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
