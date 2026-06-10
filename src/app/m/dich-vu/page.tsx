'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { useLang } from '../LangContext';

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

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
}

export default function ServiceCatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, tn } = useLang();

  useEffect(() => {
    // Kiểm tra cache trong sessionStorage trước
    const cached = sessionStorage.getItem('cat_cache');
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        // Cache valid trong 2 phút
        if (Date.now() - ts < 120000) {
          setCategories(data);
          setLoading(false);
          return;
        }
      } catch {}
    }

    fetch('/api/m/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
        // Lưu cache
        sessionStorage.setItem('cat_cache', JSON.stringify({ data, ts: Date.now() }));
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar">
        <Link href="/m" className="m-topbar-back">
          <FiArrowLeft />
        </Link>
        <div className="m-topbar-title">{t.servicesCatalog}</div>
      </div>

      {loading ? (
        <div className="m-catalog-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="m-catalog-card">
              <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: '12px 12px 0 0' }} />
              <div style={{ padding: '10px 12px' }}>
                <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="m-catalog-grid">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/m/dich-vu/${cat.slug}`}
              className="m-catalog-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="m-catalog-card-header">
                <img src={getCategoryImage(cat.slug, cat.image)} alt={tn(cat.name)} className="m-catalog-card-img" />
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
      )}

      <div style={{ height: 24 }} />
    </>
  );
}
