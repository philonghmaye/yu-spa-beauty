export const revalidate = 60;

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CategoryDetailContent from './CategoryDetailContent';

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

// Pre-render all active category pages at build time → instant load
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          discountPrice: true,
          duration: true,
          image: true,
          isFeatured: true,
          sortOrder: true,
          categoryId: true,
        },
      },
    },
  });

  if (!category) notFound();

  const heroImage = getCategoryImage(category.slug, category.image);

  return (
    <CategoryDetailContent
      category={{
        name: category.name,
        description: category.description,
        slug: category.slug,
        serviceCount: category.services.length,
      }}
      heroImage={heroImage}
      services={category.services}
    />
  );
}
