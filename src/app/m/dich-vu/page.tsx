// ISR: cache trang dịch vụ, revalidate mỗi 2 phút
export const revalidate = 120;

import prisma from '@/lib/prisma';
import ServiceCatalogContent from './ServiceCatalogContent';

// Category images mapped by slug
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
    orderBy: { sortOrder: 'asc' },
  });

  const categoryData = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: getCategoryImage(cat.slug, cat.image),
  }));

  return <ServiceCatalogContent categories={categoryData} />;
}
