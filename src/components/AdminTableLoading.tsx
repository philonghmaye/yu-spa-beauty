export default function AdminTableLoading({ title = 'Đang tải...' }: { title?: string }) {
  return (
    <div>
      <div className="admin-header">
        <div>
          <div style={{
            width: '200px', height: '28px',
            background: 'var(--neutral-100)', borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, padding: '20px',
            background: 'white', borderRadius: '12px',
            border: '1px solid var(--neutral-100)',
          }}>
            <div style={{
              width: '60%', height: '24px',
              background: 'var(--neutral-100)', borderRadius: '6px',
              marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: '40%', height: '14px',
              background: 'var(--neutral-50)', borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{
        background: 'white', borderRadius: '12px',
        border: '1px solid var(--neutral-100)', overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', gap: '16px', padding: '14px 24px',
          background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-100)',
        }}>
          {[120, 80, 150, 100, 80, 90].map((w, i) => (
            <div key={i} style={{
              width: `${w}px`, height: '12px',
              background: 'var(--neutral-200)', borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
        {/* Data rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{
            display: 'flex', gap: '16px', padding: '16px 24px',
            borderBottom: '1px solid var(--neutral-50)',
            alignItems: 'center',
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'var(--neutral-100)', borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                width: `${50 + i * 5}%`, height: '14px',
                background: 'var(--neutral-100)', borderRadius: '4px',
                marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                width: '30%', height: '10px',
                background: 'var(--neutral-50)', borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
            <div style={{
              width: '80px', height: '28px',
              background: 'var(--neutral-100)', borderRadius: '14px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: '60px', height: '20px',
              background: 'var(--neutral-50)', borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
