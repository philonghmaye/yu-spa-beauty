export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiClock, FiTag } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import CategoryServiceList from './CategoryServiceList';

// Category images mapped by slug — all 23 categories
const categoryImages: Record<string, string> = {
  'nails':                  '/images/cat-nails.png',
  'noi-mi':                 '/images/cat-eyelash.png',
  'massage':                '/images/cat-massage.png',
  'cham-soc-da':            '/images/cat-skincare.png',
  'lieu-trinh':             '/images/cat-lieu-trinh.png',
  'cham-soc-toc':           '/images/cat-hair.png',
  'dich-vu-khac':           '/images/cat-other.png',
  'tiem-filler-botox':      '/images/cat-filler-botox.png',
  'triet-long':             '/images/cat-hair-removal.png',
  'giam-beo':               '/images/cat-slimming.png',
  'phun-xam':               '/images/cat-tattoo.png',
  'tam-trang-duong-da':     '/images/cat-whitening.png',
  'tri-lieu-cong-nghe-cao': '/images/cat-high-tech.png',
  'dac-tri-da-nhon-mun':    '/images/cat-acne.png',
  'wax-long':               '/images/cat-waxing.png',
  'hifu-therapy':           '/images/cat-hifu.png',
  'laser-pink':             '/images/cat-laser-pink.png',
  'thermage-flx':           '/images/cat-thermage.png',
  'tri-lieu-vung-mat':      '/images/cat-eye-treatment.png',
  'dieu-tri-nam-white-hd':  '/images/cat-melasma.png',
  'thuoc-juvederm':         '/images/cat-juvederm.png',
  'thuoc-neauvia':          '/images/cat-neauvia.png',
  'thuoc-korean':           '/images/cat-korean.png',
};

function getCategoryImage(slug: string, dbImage: string | null): string {
  if (dbImage) return dbImage;
  return categoryImages[slug] || '/images/cat-default.png';
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!category) notFound();

  const heroImage = getCategoryImage(category.slug, category.image);

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar" style={{ background: 'transparent', borderBottom: 'none', position: 'absolute', zIndex: 10 }}>
        <Link href="/m/dich-vu" className="m-topbar-back" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <FiArrowLeft />
        </Link>
      </div>

      {/* Category Hero */}
      <div className="m-catdetail-hero">
        <img src={heroImage} alt={category.name} className="m-catdetail-hero-img" />
        <div className="m-catdetail-hero-overlay" />
        <div className="m-catdetail-hero-content">
          <div className="m-catdetail-hero-badge">
            <img src={heroImage} alt={category.name} className="m-catdetail-badge-img" />
          </div>
          <h1 className="m-catdetail-hero-title">{category.name}</h1>
          {category.description && (
            <p className="m-catdetail-hero-desc">{category.description}</p>
          )}
          <div className="m-catdetail-hero-stats">
            <span className="m-catdetail-stat">
              <FiTag style={{ fontSize: '0.75rem' }} /> {category.services.length} dịch vụ
            </span>
          </div>
        </div>
      </div>

      {/* Service List with Search */}
      <CategoryServiceList services={category.services} categorySlug={category.slug} />

      {/* Bottom Spacing */}
      <div style={{ height: 24 }} />
    </>
  );
}
