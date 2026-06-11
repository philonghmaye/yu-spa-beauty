'use client';

import { useState, useEffect } from 'react';
import HomeContent from './HomeContent';

interface HomeData {
  categories: { id: string; name: string; slug: string; icon: string | null }[];
  promoBanner: string | null;
  promoText: string;
  staffWithRating: {
    id: string;
    rating: number;
    reviewCount: number;
    user: { name: string; avatar: string | null };
    images: { url: string }[];
  }[];
}

interface SessionData {
  userName: string;
  isAdmin: boolean;
}

export default function HomeClientWrapper() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [session, setSession] = useState<SessionData>({ userName: '', isAdmin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'home_data_cache';

    // Fetch session and home data in parallel
    const fetchAll = async (useCache: boolean) => {
      try {
        // Check cache first
        if (useCache) {
          try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
              const { data, ts } = JSON.parse(cached);
              if (Date.now() - ts < 120000) {
                setHomeData(data);
                setLoading(false);
                // Background refresh
                fetch('/api/m/home').then(r => r.json()).then(freshData => {
                  setHomeData(freshData);
                  sessionStorage.setItem(cacheKey, JSON.stringify({ data: freshData, ts: Date.now() }));
                }).catch(() => {});
                return;
              }
            }
          } catch {}
        }

        const [homeRes, sessionRes] = await Promise.all([
          fetch('/api/m/home'),
          fetch('/api/auth/session'),
        ]);

        const [data, sess] = await Promise.all([
          homeRes.json(),
          sessionRes.json().catch(() => null),
        ]);

        setHomeData(data);
        if (sess?.user) {
          setSession({
            userName: sess.user.name || '',
            isAdmin: sess.user.role === 'ADMIN',
          });
        }
        setLoading(false);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
      } catch {
        setLoading(false);
      }
    };

    fetchAll(true);
  }, []);

  if (loading || !homeData) {
    return null; // loading.tsx skeleton handles this
  }

  return (
    <HomeContent
      userName={session.userName}
      isAdmin={session.isAdmin}
      promoBanner={homeData.promoBanner}
      promoText={homeData.promoText}
      categories={homeData.categories}
      staffWithRating={homeData.staffWithRating}
    />
  );
}
