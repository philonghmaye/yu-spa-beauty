export default function AdminLoading() {
  return (
    <div style={{ padding: '24px' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ width: '200px', height: '28px', background: 'var(--neutral-100)', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>

      {/* Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--neutral-100)' }}>
            <div style={{ width: '60%', height: '24px', background: 'var(--neutral-100)', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '40%', height: '14px', background: 'var(--neutral-50)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--neutral-100)', overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--neutral-50)', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--neutral-100)', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: `${50 + i * 8}%`, height: '14px', background: 'var(--neutral-100)', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ width: '30%', height: '10px', background: 'var(--neutral-50)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <div style={{ width: '80px', height: '28px', background: 'var(--neutral-100)', borderRadius: '14px', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
