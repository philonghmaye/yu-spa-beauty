'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

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

// Keyword-based auto-translation for unmapped names
// IMPORTANT: Multi-word phrases MUST come before single-word patterns
const keywordMap: [RegExp, string][] = [
  // Multi-word phrases first (order matters!)
  [/giảm béo/gi, 'Body Slimming'], [/tắm trắng/gi, 'Whitening Bath'],
  [/chăm sóc/gi, 'Care'], [/điều trị/gi, 'Treatment'],
  [/liệu trình/gi, 'Treatment'], [/công nghệ/gi, 'Technology'],
  [/thái dương/gi, 'Temple'], [/rãnh cười/gi, 'Smile Line'],
  [/hốc mắt/gi, 'Under Eye'], [/nọng cằm/gi, 'Double Chin'],
  [/nhũ hoa/gi, 'Areola'], [/bắp chân/gi, 'Calf'], [/bắp tay/gi, 'Upper Arm'],
  [/ria mép/gi, 'Mustache'], [/lăn kim/gi, 'Microneedling'],
  [/nếp nhăn/gi, 'Wrinkle'], [/mặt nạ/gi, 'Mask'],
  [/cao cấp/gi, 'Premium'], [/chuyên sâu/gi, 'Advanced'], [/cơ bản/gi, 'Basic'],
  [/khách tây/gi, ''], [/giá tết/gi, '(Holiday)'],
  [/10 buổi/gi, '10 Sessions'], [/5 buổi/gi, '5 Sessions'],
  [/1 buổi/gi, '1 Session'], [/3 lần/gi, '3 Sessions'], [/5 lần/gi, '5 Sessions'],
  [/1 bộ/gi, '(Full Set)'], [/1 ngón/gi, '(1 Nail)'],

  // Body parts & areas
  [/\bvùng\b/gi, 'Area'], [/\bmặt\b/gi, 'Face'], [/\bmắt\b/gi, 'Eye'],
  [/\bmôi\b/gi, 'Lip'], [/\bmũi\b/gi, 'Nose'], [/\bcằm\b/gi, 'Chin'],
  [/\btrán\b/gi, 'Forehead'], [/\bmá\b/gi, 'Cheek'], [/\btay\b/gi, 'Arm'],
  [/\bchân\b/gi, 'Leg'], [/\bnách\b/gi, 'Underarm'], [/\blưng\b/gi, 'Back'],
  [/\bbụng\b/gi, 'Belly'], [/\bcổ\b/gi, 'Neck'], [/\bvai\b/gi, 'Shoulder'],
  [/\bgáy\b/gi, 'Nape'], [/\bbikini\b/gi, 'Bikini'],
  [/\bhàm\b/gi, 'Jaw'], [/\btai\b/gi, 'Ear'], [/\bđầu\b/gi, 'Head'],

  // Actions & treatments
  [/\bmassage\b/gi, 'Massage'], [/\btiêm\b/gi, 'Injection'],
  [/\btriệt\b/gi, 'Hair Removal'], [/\bwax\b/gi, 'Wax'],
  [/\bphun\b/gi, 'Tattoo'], [/\bxăm\b/gi, 'Tattoo'],
  [/\bxóa\b/gi, 'Removal'], [/\btháo\b/gi, 'Remove'],
  [/\bđắp\b/gi, 'Apply'], [/\bsơn\b/gi, 'Polish'],
  [/\bnối\b/gi, 'Extension'], [/\buốn\b/gi, 'Perm/Lift'],
  [/\bnhuộm\b/gi, 'Color/Tint'], [/\bcắt\b/gi, 'Cut'],
  [/\bnặn\b/gi, 'Extract'], [/\bđốt\b/gi, 'Remove'],
  [/\btruyền\b/gi, 'IV Drip'], [/\btrị\b/gi, 'Treat'],
  [/\bgội\b/gi, 'Wash'], [/\bpeel\b/gi, 'Peel'],

  // Products & types
  [/\bgel\b/gi, 'Gel'], [/\bbột\b/gi, 'Acrylic'],
  [/\bmi\b/gi, 'Lashes'], [/\bmóng\b/gi, 'Nail'],
  [/\bda\b/gi, 'Skin'], [/\btóc\b/gi, 'Hair'],
  [/\bmụn\b/gi, 'Acne'], [/\bnám\b/gi, 'Melasma'],
  [/\bthâm\b/gi, 'Dark Spot'], [/\bsẹo\b/gi, 'Scar'],
  [/\bcollagen\b/gi, 'Collagen'], [/\bfiller\b/gi, 'Filler'],
  [/\bbotox\b/gi, 'Botox'], [/\bvitamin\b/gi, 'Vitamin'],

  // Qualifiers
  [/\bfull\b/gi, 'Full'], [/\bmới\b/gi, 'New'], [/\bcũ\b/gi, 'Old'],
  [/\blẻ\b/gi, 'Single'], [/\bphút\b/gi, 'min'], [/\bbuổi\b/gi, 'Session'],
];

type Translations = typeof translations.vi;

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
  const [nameTranslations, setNameTranslations] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Lang;
    if (saved && (saved === 'vi' || saved === 'en')) {
      setLangState(saved);
    }
  }, []);

  // Lazy-load name translations only when switching to English
  useEffect(() => {
    if (lang === 'en' && !nameTranslations) {
      import('./nameTranslations').then(mod => {
        setNameTranslations(mod.default);
      });
    }
  }, [lang, nameTranslations]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  }, []);

  // Memoized translate function
  const tn = useCallback((name: string) => {
    if (lang === 'vi') return name;
    if (!nameTranslations) return name; // Still loading

    // Try exact match first
    if (nameTranslations[name]) return nameTranslations[name];
    // Try case-insensitive match
    const lower = name.toLowerCase();
    for (const key of Object.keys(nameTranslations)) {
      if (key.toLowerCase() === lower) return nameTranslations[key];
    }
    // Auto-translate using keyword replacement — only for short names
    if (name.length > 50) return name;
    let result = name;
    for (const [pattern, replacement] of keywordMap) {
      result = result.replace(pattern, replacement);
    }
    // Clean up: remove extra spaces, trim
    result = result.replace(/\s+/g, ' ').trim();
    return result !== name ? result : name;
  }, [lang, nameTranslations]);

  const value = useMemo(() => ({
    lang, setLang, t: translations[lang], tn,
  }), [lang, setLang, tn]);

  return (
    <LangContext.Provider value={value}>
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
