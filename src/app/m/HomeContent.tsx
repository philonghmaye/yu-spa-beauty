'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMessageCircle, FiArrowRight, FiStar, FiSettings } from 'react-icons/fi';
import PromoBanner from './PromoBanner';
import { useLang, LangSwitcher } from './LangContext';

interface StaffData {
  id: string;
  rating: number;
  reviewCount: number;
  user: { name: string; avatar: string | null };
  images: { url: string }[];
}

interface CategoryData {
  id: string; name: string; slug: string; icon: string | null;
}

interface HomeData {
  categories: CategoryData[];
  promoBanner: string | null;
  promoText: string;
  staffWithRating: StaffData[];
}

interface UserData {
  name: string;
  isAdmin: boolean;
}

const CACHE_KEY = 'home_cache';
const CACHE_TTL = 120000; // 2 phút

export default function HomeContent() {
  const { t, tn } = useLang();
  const router = useRouter();

  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [userData, setUserData] = useState<UserData>({ name: '', isAdmin: false });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch home data với sessionStorage cache
  const fetchHomeData = useCallback(async () => {
    // Check cache trước
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setHomeData(data);
          setIsLoading(false);
          // Vẫn fetch mới trong background (stale-while-revalidate pattern)
          fetch('/api/m/home')
            .then(r => r.json())
            .then(freshData => {
              setHomeData(freshData);
              sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: freshData, ts: Date.now() }));
            })
            .catch(() => {});
          return;
        }
      }
    } catch {}

    // Fetch mới
    try {
      const res = await fetch('/api/m/home');
      const data = await res.json();
      setHomeData(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // Nếu lỗi, dùng cache cũ nếu có
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data } = JSON.parse(cached);
          setHomeData(data);
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch song song: home data + user data
    fetchHomeData();
    fetch('/api/m/me')
      .then(r => r.json())
      .then(data => setUserData(data))
      .catch(() => {});
  }, [fetchHomeData]);

  // Prefetch các trang user hay vào nhất
  useEffect(() => {
    router.prefetch('/m/dich-vu');
    router.prefetch('/m/kham-pha');
    router.prefetch('/m/hoat-dong');
  }, [router]);

  // Skeleton loading state
  if (isLoading || !homeData) {
    return (
      <>
        {/* Header skeleton */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
            <div>
              <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          </div>
        </div>

        {/* Banner skeleton */}
        <div style={{ margin: '0 16px 16px' }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>

        {/* Hero skeleton */}
        <div style={{ padding: '0 16px' }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 16, marginBottom: 14 }} />
        </div>

        {/* Category chips skeleton */}
        <div style={{ padding: '20px 16px 8px' }}>
          <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 6, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[80, 100, 70, 90, 60].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 32, borderRadius: 20, flexShrink: 0 }} />
            ))}
          </div>
        </div>

        {/* Staff skeleton */}
        <div style={{ padding: '16px' }}>
          <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 6, marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: 130, textAlign: 'center', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 8px' }} />
                <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6, margin: '0 auto 4px' }} />
                <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 6, margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const { categories, promoBanner, promoText, staffWithRating } = homeData;
  const { name: userName, isAdmin } = userData;

  return (
    <>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)', fontSize: '1.1rem' }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {userName ? `${t.hello}, ${userName}` : `${t.hello}!`}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #a855f7)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>YURI SPA BEAUTY ✨</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <LangSwitcher />
          {isAdmin && (
            <Link href="/m/admin" style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.95rem' }} title="Admin">
              <FiSettings />
            </Link>
          )}
          <Link href="/m/hoat-dong" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-600)' }}>
            <FiMessageCircle />
          </Link>
        </div>
      </div>

      {/* Promo Banner */}
      <PromoBanner isAdmin={isAdmin} initialBanner={promoBanner} initialPromoText={promoText} />

      {/* Hero Service Cards */}
      <div style={{ padding: '0 16px' }}>
        <Link href="/m/dich-vu" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            position: 'relative', height: 220, marginBottom: 14,
          }}>
            <Image src="/uploads/banner-beauty.png" alt={t.beautyServices} width={828} height={440} priority style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px 24px', zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: 4, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {t.beautyServices}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', marginBottom: 14, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {t.chooseYourTechnician}
              </p>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
                <FiArrowRight />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Service Category Chips */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem' }}>{t.featuredServices}</h3>
          <Link href="/m/dich-vu" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>{t.viewAll}</Link>
        </div>
        <div className="m-filters" style={{ padding: 0 }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/m/dich-vu/${cat.slug}`} className="m-chip" style={{ textDecoration: 'none' }}>
              {cat.icon} {tn(cat.name)}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Staff */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.05rem' }}>{t.topTechnicians}</h3>
          <Link href="/m/kham-pha" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>{t.viewAll}</Link>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {staffWithRating.map((s) => (
            <Link key={s.id} href={`/m/nhan-vien/${s.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
              <div style={{ width: 130, textAlign: 'center' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', margin: '0 auto 8px',
                  overflow: 'hidden', background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid var(--primary-50)',
                }}>
                  {(s.images[0]?.url || s.user.avatar) ? (
                    <img
                      src={s.images[0]?.url || s.user.avatar || ''}
                      alt={s.user.name}
                      loading="lazy"
                      width={90}
                      height={90}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{s.user.name.charAt(0)}</span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{s.user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ color: 'var(--gold)' }}>★</span> {s.rating} ({s.reviewCount})
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Support FAB */}
      <Link
        href="/lien-he"
        style={{
          position: 'fixed', bottom: 80, right: 16, width: 48, height: 48,
          borderRadius: '50%', background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-md)', fontSize: '1.2rem', zIndex: 50,
        }}
      >
        💬
      </Link>
    </>
  );
}
