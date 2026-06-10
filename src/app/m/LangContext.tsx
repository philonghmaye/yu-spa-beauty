'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

type Lang = 'vi' | 'en';

const translations = {
  vi: {
    // Header
    hello: 'Xin chào',
    // Promo
    specialOffer: '🎉 Ưu đãi đặc biệt',
    firstBookingDiscount: 'Giảm <strong>20%</strong> cho lần đặt lịch đầu tiên!',
    uploadBanner: 'Tải ảnh banner lên',
    // Hero
    beautyServices: 'Dịch vụ làm đẹp & Spa',
    chooseYourTechnician: 'Chọn kỹ thuật viên yêu thích của bạn',
    // Sections
    featuredServices: 'Dịch vụ nổi bật',
    viewAll: 'Xem tất cả →',
    topTechnicians: 'Kỹ thuật viên hàng đầu',
    reviews: 'đánh giá',
    // Nav
    home: 'Trang chủ',
    services: 'Dịch vụ',
    activity: 'Hoạt động',
    account: 'Tài khoản',
    // Booking
    bookNow: 'Đặt lịch ngay',
    // Staff
    experience: 'năm KN',
    serviceCount: 'dịch vụ',
    // Service pages
    servicesCatalog: 'Dịch vụ & Sản phẩm',
    searchService: 'Tìm kiếm dịch vụ...',
    minutes: 'phút',
    noResults: 'Không tìm thấy dịch vụ nào',
    allActivities: 'Tất cả',
    upcoming: 'Sắp tới',
    completed: 'Hoàn thành',
    noActivity: 'Chưa có hoạt động nào',
    rate: 'Đánh giá',
    rated: 'Đã đánh giá',
    rateService: '⭐ Đánh giá dịch vụ',
    tapToRate: 'Chạm để đánh giá',
    shareExperience: 'Chia sẻ trải nghiệm của bạn... (tùy chọn)',
    submitReview: 'Gửi đánh giá',
    submitting: 'Đang gửi...',
    excellent: 'Tuyệt vời!',
    veryGood: 'Rất tốt!',
    good: 'Tốt',
    average: 'Bình thường',
    poor: 'Kém',
  },
  en: {
    // Header
    hello: 'Hello',
    // Promo
    specialOffer: '🎉 Special Offer',
    firstBookingDiscount: '<strong>20% OFF</strong> your first booking!',
    uploadBanner: 'Upload banner image',
    // Hero
    beautyServices: 'Beauty & Spa Services',
    chooseYourTechnician: 'Choose your favorite technician',
    // Sections
    featuredServices: 'Featured Services',
    viewAll: 'View all →',
    topTechnicians: 'Top Technicians',
    reviews: 'reviews',
    // Nav
    home: 'Home',
    services: 'Services',
    activity: 'Activity',
    account: 'Account',
    // Booking
    bookNow: 'Book now',
    // Staff
    experience: 'yrs exp',
    serviceCount: 'services',
    // Service pages
    servicesCatalog: 'Services & Products',
    searchService: 'Search services...',
    minutes: 'min',
    noResults: 'No services found',
    allActivities: 'All',
    upcoming: 'Upcoming',
    completed: 'Completed',
    noActivity: 'No activities yet',
    rate: 'Rate',
    rated: 'Rated',
    rateService: '⭐ Rate Service',
    tapToRate: 'Tap to rate',
    shareExperience: 'Share your experience... (optional)',
    submitReview: 'Submit Review',
    submitting: 'Submitting...',
    excellent: 'Excellent!',
    veryGood: 'Very good!',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
  },
};

type Translations = typeof translations.vi;

interface TranslationData {
  nameTranslations: Record<string, string>;
  keywordMap: [RegExp, string][];
}

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  tn: (name: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'vi',
  setLang: () => {},
  t: translations.vi,
  tn: (name: string) => name,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');
  // Lazy-loaded translation data (chỉ load khi chuyển sang EN)
  const translationDataRef = useRef<TranslationData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Lang;
    if (saved && (saved === 'vi' || saved === 'en')) {
      setLangState(saved);
      // Pre-load translations nếu đã chọn EN trước đó
      if (saved === 'en') {
        import('./translations').then(mod => {
          translationDataRef.current = {
            nameTranslations: mod.nameTranslations,
            keywordMap: mod.keywordMap,
          };
        });
      }
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
    // Lazy load translations khi chuyển sang EN
    if (newLang === 'en' && !translationDataRef.current) {
      import('./translations').then(mod => {
        translationDataRef.current = {
          nameTranslations: mod.nameTranslations,
          keywordMap: mod.keywordMap,
        };
      });
    }
  };

  // Translate service/category name
  const tn = (name: string) => {
    if (lang === 'vi') return name;

    const data = translationDataRef.current;
    if (!data) return name; // Translations chưa load xong

    // Try exact match first
    if (data.nameTranslations[name]) return data.nameTranslations[name];
    // Try case-insensitive match
    const lower = name.toLowerCase();
    for (const key of Object.keys(data.nameTranslations)) {
      if (key.toLowerCase() === lower) return data.nameTranslations[key];
    }
    // Auto-translate using keyword replacement — only for short names
    if (name.length > 50) return name;
    let result = name;
    for (const [pattern, replacement] of data.keywordMap) {
      result = result.replace(pattern, replacement);
    }
    // Clean up: remove extra spaces, trim
    result = result.replace(/\s+/g, ' ').trim();
    return result !== name ? result : name;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang], tn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--neutral-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-600)',
      }}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      {lang === 'vi' ? 'EN' : 'VI'}
    </button>
  );
}
