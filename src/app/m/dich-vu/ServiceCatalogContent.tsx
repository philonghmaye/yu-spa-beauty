'use client';

import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { useLang } from '../LangContext';

interface Category {
  id: string; name: string; slug: string; image: string;
}

export default function ServiceCatalogContent({ categories }: { categories: Category[] }) {
  const { t, tn } = useLang();

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar">
        <Link href="/m" className="m-topbar-back">
          <FiArrowLeft />
        </Link>
        <div className="m-topbar-title">{t.servicesCatalog}</div>
      </div>

      {/* Category Grid */}
      <div className="m-catalog-grid">
        {categories.map((cat, index) => (
          <Link
            key={cat.id}
            href={`/m/dich-vu/${cat.slug}`}
            className="m-catalog-card"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="m-catalog-card-header">
              <img src={cat.image} alt={tn(cat.name)} className="m-catalog-card-img" />
              <div className="m-catalog-card-overlay" />
            </div>
            <div className="m-catalog-card-body">
              <div className="m-catalog-card-name">{tn(cat.name)}</div>
              <div className="m-catalog-card-arrow">
                <FiChevronRight />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
