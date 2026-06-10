'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CategoryDetailContent from './CategoryDetailContent';

// Category images mapped by slug
const categoryImages: Record<string, string> = {
  'nails': '/images/cat-nails.png',
  'noi-mi': '/images/cat-eyelash.png',
  'massage': '/images/cat-massage.png',
  'cham-soc-da': '/images/cat-skincare.png',
  'lieu-trinh': '/images/cat-lieu-trinh.png',
  'cham-soc-toc': '/images/cat-hair.png',
  'dich-vu-khac': '/images/cat-other.png',
  'tiem-filler-botox': '/images/cat-filler-botox.png',
  'triet-long': '/images/cat-hair-removal.png',
  'giam-beo': '/images/cat-slimming.png',
  'phun-xam': '/images/cat-tattoo.png',
  'tam-trang-duong-da': '/images/cat-whitening.png',
  'tri-lieu-cong-nghe-cao': '/images/cat-high-tech.png',
  'dac-tri-da-nhon-mun': '/images/cat-acne.png',
  'wax-long': '/images/cat-waxing.png',
  'hifu-therapy': '/images/cat-hifu.png',
  'laser-pink': '/images/cat-laser-pink.png',
  'thermage-flx': '/images/cat-thermage.png',
  'tri-lieu-vung-mat': '/images/cat-eye-treatment.png',
  'dieu-tri-nam-white-hd': '/images/cat-melasma.png',
  'thuoc-juvederm': '/images/cat-juvederm.png',
  'thuoc-neauvia': '/images/cat-neauvia.png',
  'thuoc-korean': '/images/cat-korean.png',
};

function getCategoryImage(slug: string, dbImage: string | null): string {
  if (dbImage) return dbImage;
  return categoryImages[slug] || '/images/cat-default.png';
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  services: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
    duration: number;
    image: string | null;
    description: string | null;
  }[];
}

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Check sessionStorage cache
    const cacheKey = `cat_${slug}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data: cachedData, ts } = JSON.parse(cached);
        if (Date.now() - ts < 120000) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      } catch {}
    }

    fetch(`/api/m/categories/${slug}`)
      .then(r => r.json())
      .then(result => {
        if (result.error) {
          setLoading(false);
          return;
        }
        setData(result);
        setLoading(false);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, ts: Date.now() }));
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <div className="skeleton" style={{ width: '100%', height: 200 }} />
        <div style={{ padding: 16 }}>
          <div className="skeleton" style={{ width: '60%', height: 22, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 6, marginBottom: 20 }} />
          <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 20, marginBottom: 20 }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--neutral-100)' }}>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '75%', height: 16, borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '30%', height: 14, borderRadius: 6 }} />
              </div>
              <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 16, alignSelf: 'center' }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!data) {
    return <div className="m-empty"><div className="icon">🔍</div><p>Không tìm thấy danh mục</p></div>;
  }

  const heroImage = getCategoryImage(data.slug, data.image);

  return (
    <CategoryDetailContent
      category={{
        name: data.name,
        description: data.description,
        slug: data.slug,
        serviceCount: data.services.length,
      }}
      heroImage={heroImage}
      services={data.services.map(s => ({
        ...s,
        slug: '',
        isFeatured: false,
        sortOrder: 0,
        categoryId: data.id,
      }))}
    />
  );
}
