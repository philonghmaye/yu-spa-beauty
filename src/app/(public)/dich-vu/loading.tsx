export default function ServicesLoading() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div style={{
            width: '300px', height: '36px', margin: '0 auto 12px',
            background: 'rgba(168,85,247,0.1)', borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '400px', height: '20px', margin: '0 auto',
            background: 'rgba(168,85,247,0.06)', borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div style={{
            width: '200px', height: '28px', marginBottom: '24px',
            background: 'var(--neutral-100)', borderRadius: '8px',
            borderBottom: '2px solid var(--primary-light)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div className="grid grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                  height: '200px', background: 'var(--neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div className="card-body">
                  <div style={{
                    width: '70%', height: '20px', marginBottom: '8px',
                    background: 'var(--neutral-100)', borderRadius: '6px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <div style={{
                    width: '90%', height: '14px', marginBottom: '16px',
                    background: 'var(--neutral-50)', borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '80px', height: '20px',
                      background: 'var(--primary-light)', borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                    <div style={{
                      width: '60px', height: '16px',
                      background: 'var(--neutral-50)', borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  </div>
                </div>
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
