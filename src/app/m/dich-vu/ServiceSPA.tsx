'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiChevronRight, FiClock, FiSearch, FiChevronDown, FiTag, FiShare2 } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import { useLang } from '../LangContext';
import { shareService } from '@/lib/native';

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

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  services: Service[];
}

const PAGE_SIZE = 10;

function getCategoryImage(slug: string, dbImage: string | null): string {
  if (dbImage) return dbImage;
  return categoryImages[slug] || '/images/cat-default.png';
}

export default function ServiceSPA({ initialSlug }: { initialSlug?: string }) {
  const { t, tn } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug || null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const cacheKey = 'cats_services_cache';
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 120000) {
          setCategories(data);
          setLoading(false);
          // Background refresh
          fetch('/api/m/categories-with-services').then(r => r.json()).then(freshData => {
            setCategories(freshData);
            sessionStorage.setItem(cacheKey, JSON.stringify({ data: freshData, ts: Date.now() }));
          }).catch(() => {});
          return;
        }
      }
    } catch {}

    fetch('/api/m/categories-with-services')
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedCategory = useMemo(
    () => categories.find(c => c.slug === selectedSlug) || null,
    [categories, selectedSlug]
  );

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return [];
    if (!search.trim()) return selectedCategory.services;
    const q = search.trim().toLowerCase();
    return selectedCategory.services.filter(s => s.name.toLowerCase().includes(q));
  }, [selectedCategory, search]);

  const displayedServices = filteredServices.slice(0, visibleCount);
  const hasMore = visibleCount < filteredServices.length;

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setSearch('');
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    // Update URL without navigation
    window.history.pushState(null, '', `/m/dich-vu/${slug}`);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSlug(null);
    setSearch('');
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    window.history.pushState(null, '', '/m/dich-vu');
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/\/m\/dich-vu\/(.+)/);
      if (match) {
        setSelectedSlug(match[1]);
      } else {
        setSelectedSlug(null);
      }
      setSearch('');
      setVisibleCount(PAGE_SIZE);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Loading skeleton
  if (loading) {
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

  // ===== CATEGORY DETAIL VIEW =====
  if (selectedCategory) {
    const heroImage = getCategoryImage(selectedCategory.slug, selectedCategory.image);

    return (
      <>
        {/* Top bar */}
        <div className="m-topbar" style={{ background: 'transparent', borderBottom: 'none', position: 'absolute', zIndex: 10, justifyContent: 'space-between' }}>
          <button onClick={handleBack} className="m-topbar-back" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <button
            onClick={() => shareService(tn(selectedCategory.name), `${window.location.origin}/m/dich-vu/${selectedCategory.slug}`)}
            style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <FiShare2 />
          </button>
        </div>

        {/* Hero */}
        <div className="m-catdetail-hero">
          <Image src={heroImage} alt={tn(selectedCategory.name)} className="m-catdetail-hero-img" fill sizes="(max-width: 480px) 100vw, 480px" priority />
          <div className="m-catdetail-hero-overlay" />
          <div className="m-catdetail-hero-content">
            <div className="m-catdetail-hero-badge">
              <Image src={heroImage} alt={tn(selectedCategory.name)} className="m-catdetail-badge-img" width={64} height={64} style={{ objectFit: 'cover' }} />
            </div>
            <h1 className="m-catdetail-hero-title">{tn(selectedCategory.name)}</h1>
            {selectedCategory.description && (
              <p className="m-catdetail-hero-desc">{tn(selectedCategory.description)}</p>
            )}
            <div className="m-catdetail-hero-stats">
              <span className="m-catdetail-stat">
                <FiTag style={{ fontSize: '0.75rem' }} /> {selectedCategory.services.length} {t.serviceCount}
              </span>
            </div>
          </div>
        </div>

        {/* Service List */}
        <div className="m-catdetail-list">
          <div className="m-catdetail-list-header">
            <h2>{t.servicesCatalog}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
              {filteredServices.length} {t.serviceCount}
            </span>
          </div>

          {/* Search */}
          <div style={{ padding: '0 16px 12px', position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', fontSize: '0.9rem', marginTop: -6 }} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder={t.searchService}
              style={{
                width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--neutral-200)', fontSize: '0.88rem',
                outline: 'none', background: '#fff',
              }}
            />
          </div>

          {displayedServices.map(service => {
            const hasDiscount = service.discountPrice && service.discountPrice < service.price;
            return (
              <div key={service.id} className="m-catdetail-service">
                {service.image && (
                  <div className="m-catdetail-service-img-wrap">
                    <Image src={service.image} alt={service.name} className="m-catdetail-service-img" fill sizes="(max-width: 480px) 100vw, 480px" />
                    {hasDiscount && (
                      <div className="m-catdetail-discount-badge">
                        -{Math.round(((service.price - service.discountPrice!) / service.price) * 100)}%
                      </div>
                    )}
                  </div>
                )}
                <div className="m-catdetail-service-content">
                  <div className="m-catdetail-service-top">
                    <div className="m-catdetail-service-info">
                      <h3 className="m-catdetail-service-name">{tn(service.name)}</h3>
                      {service.description && (
                        <p className="m-catdetail-service-desc">{tn(service.description)}</p>
                      )}
                      <div className="m-catdetail-service-meta">
                        {service.duration > 0 && (
                          <span className="m-catdetail-meta-item">
                            <FiClock style={{ fontSize: '0.72rem' }} /> {service.duration} {t.minutes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="m-catdetail-service-bottom">
                    <div className="m-catdetail-price-wrap">
                      {hasDiscount ? (
                        <>
                          <span className="m-catdetail-price-old">{formatCurrency(service.price)}</span>
                          <span className="m-catdetail-price-current">{formatCurrency(service.discountPrice!)}</span>
                        </>
                      ) : (
                        <span className="m-catdetail-price-current">{formatCurrency(service.price)}</span>
                      )}
                    </div>
                    <Link href={`/m/kham-pha?service=${service.id}`} className="m-catdetail-book-btn">
                      {t.bookNow}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div style={{ padding: '12px 16px 20px', textAlign: 'center' }}>
              <button
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--primary)', background: 'var(--primary-50)',
                  color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Xem thêm ({filteredServices.length - visibleCount} còn lại) <FiChevronDown />
              </button>
            </div>
          )}

          {filteredServices.length === 0 && search.trim() && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--neutral-400)', fontSize: '0.88rem' }}>
              {t.noResults}
            </div>
          )}
        </div>
        <div style={{ height: 24 }} />
      </>
    );
  }

  // ===== CATEGORY GRID VIEW =====
  return (
    <>
      <div className="m-topbar">
        <Link href="/m" className="m-topbar-back">
          <FiArrowLeft />
        </Link>
        <div className="m-topbar-title">{t.servicesCatalog}</div>
      </div>

      <div className="m-catalog-grid">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.slug)}
            className="m-catalog-card"
            style={{ border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit', textDecoration: 'none' }}
          >
            <div className="m-catalog-card-header">
              <Image src={getCategoryImage(cat.slug, cat.image)} alt={tn(cat.name)} className="m-catalog-card-img" fill sizes="(max-width: 480px) 50vw, 240px" />
              <div className="m-catalog-card-overlay" />
            </div>
            <div className="m-catalog-card-body">
              <div className="m-catalog-card-name">{tn(cat.name)}</div>
              <div className="m-catalog-card-arrow">
                <FiChevronRight />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
