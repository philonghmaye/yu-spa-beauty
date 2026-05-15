export default function PublicLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div style={{
        marginTop: 'var(--header-height)',
        minHeight: '85vh',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-light) 50%, var(--primary-light) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '600px' }}>
          <div style={{
            width: '200px', height: '28px', margin: '0 auto 24px',
            background: 'rgba(168,85,247,0.1)', borderRadius: '20px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '80%', height: '48px', margin: '0 auto 16px',
            background: 'rgba(168,85,247,0.08)', borderRadius: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '60%', height: '20px', margin: '0 auto 32px',
            background: 'rgba(168,85,247,0.06)', borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <div style={{
              width: '160px', height: '52px',
              background: 'rgba(168,85,247,0.15)', borderRadius: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: '140px', height: '52px',
              background: 'rgba(168,85,247,0.08)', borderRadius: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
