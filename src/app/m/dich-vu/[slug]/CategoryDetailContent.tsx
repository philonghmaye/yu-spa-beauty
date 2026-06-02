'use client';

import Link from 'next/link';
import { FiArrowLeft, FiTag, FiShare2 } from 'react-icons/fi';
import CategoryServiceList from './CategoryServiceList';
import { useLang } from '../../LangContext';
import { shareService } from '@/lib/native';

interface ServiceData {
  id: string; name: string; slug: string; description: string | null;
  price: number; discountPrice: number | null; duration: number;
  image: string | null; isFeatured: boolean; sortOrder: number;
  categoryId: string;
}

interface Props {
  category: { name: string; description: string | null; slug: string; serviceCount: number };
  heroImage: string;
  services: ServiceData[];
}

export default function CategoryDetailContent({ category, heroImage, services }: Props) {
  const { t, tn } = useLang();

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar" style={{ background: 'transparent', borderBottom: 'none', position: 'absolute', zIndex: 10, justifyContent: 'space-between' }}>
        <Link href="/m/dich-vu" className="m-topbar-back" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <FiArrowLeft />
        </Link>
        <button
          onClick={() => shareService(tn(category.name), `${window.location.origin}/m/dich-vu/${category.slug}`)}
          style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <FiShare2 />
        </button>
      </div>

      {/* Category Hero */}
      <div className="m-catdetail-hero">
        <img src={heroImage} alt={tn(category.name)} className="m-catdetail-hero-img" />
        <div className="m-catdetail-hero-overlay" />
        <div className="m-catdetail-hero-content">
          <div className="m-catdetail-hero-badge">
            <img src={heroImage} alt={tn(category.name)} className="m-catdetail-badge-img" />
          </div>
          <h1 className="m-catdetail-hero-title">{tn(category.name)}</h1>
          {category.description && (
            <p className="m-catdetail-hero-desc">{tn(category.description)}</p>
          )}
          <div className="m-catdetail-hero-stats">
            <span className="m-catdetail-stat">
              <FiTag style={{ fontSize: '0.75rem' }} /> {category.serviceCount} {t.serviceCount}
            </span>
          </div>
        </div>
      </div>

      {/* Service List with Search */}
      <CategoryServiceList services={services} categorySlug={category.slug} />

      <div style={{ height: 24 }} />
    </>
  );
}
