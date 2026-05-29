export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';

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

export default async function ServiceCatalogPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, price: true, duration: true, image: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar">
        <Link href="/m" className="m-topbar-back">
          <FiArrowLeft />
        </Link>
        <div className="m-topbar-title">Dịch vụ & Sản phẩm</div>
      </div>

      {/* Category Grid */}
      <div className="m-catalog-grid">
        {categories.map((cat, index) => {
          const image = getCategoryImage(cat.slug, cat.image);

          return (
            <Link
              key={cat.id}
              href={`/m/dich-vu/${cat.slug}`}
              className="m-catalog-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Card with image */}
              <div className="m-catalog-card-header">
                <img
                  src={image}
                  alt={cat.name}
                  className="m-catalog-card-img"
                />
                <div className="m-catalog-card-overlay" />
              </div>

              {/* Card Name */}
              <div className="m-catalog-card-body">
                <div className="m-catalog-card-name">{cat.name}</div>
                <div className="m-catalog-card-arrow">
                  <FiChevronRight />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: 24 }} />
    </>
  );
}
