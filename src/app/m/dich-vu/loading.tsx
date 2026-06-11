export default function ServiceCatalogLoading() {
  return (
    <>
      <div className="m-topbar">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 6 }} />
      </div>
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
        ))}
      </div>
    </>
  );
}
