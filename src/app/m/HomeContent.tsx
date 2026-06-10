'use client';

import { useEffect } from 'react';
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

interface Props {
  userName: string;
  isAdmin: boolean;
  promoBanner: string | null;
  promoText: string;
  categories: CategoryData[];
  staffWithRating: StaffData[];
}

export default function HomeContent({ userName, isAdmin, promoBanner, promoText, categories, staffWithRating }: Props) {
  const { t, tn } = useLang();
  const router = useRouter();

  // Prefetch các trang user hay vào nhất — load trước khi họ tap
  useEffect(() => {
    router.prefetch('/m/dich-vu');
    router.prefetch('/m/kham-pha');
    router.prefetch('/m/hoat-dong');
  }, [router]);

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
                    <img src={s.images[0]?.url || s.user.avatar || ''} alt={s.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
