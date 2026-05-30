'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// Vietnamese → English name mapping for categories & services
const nameTranslations: Record<string, string> = {
  // Categories
  'Nails': 'Nails',
  'Nối mi': 'Eyelash Extensions',
  'Massage': 'Massage',
  'Chăm sóc da': 'Skin Care',
  'Liệu trình': 'Treatment',
  'Chăm sóc tóc': 'Hair Care',
  'Trang điểm': 'Makeup',
  'Waxing': 'Waxing',
  'Spa': 'Spa',
  // Common services
  'Massage đầu 30p khách tây': 'Head Massage 30min (Tourist)',
  'Massage body 60p': 'Body Massage 60min',
  'Massage mặt': 'Facial Massage',
  'Massage chân': 'Foot Massage',
  'Massage toàn thân': 'Full Body Massage',
  'Cắt da sơn gel khách tây': 'Gel Manicure (Tourist)',
  'Sơn gel tay': 'Gel Nails - Hands',
  'Sơn gel chân': 'Gel Nails - Feet',
  'Design đơn giản khách tây': 'Simple Nail Design (Tourist)',
  'Nối mi cụm': 'Cluster Lash Extensions',
  'Nối mi sợi': 'Individual Lash Extensions',
  'Nối mi 1:1': '1:1 Lash Extensions',
  'Chăm sóc da mặt': 'Facial Treatment',
  'Tẩy tế bào chết': 'Exfoliation',
  'Đắp mặt nạ': 'Face Mask Treatment',
  'Mở cửa da': 'Skin Opening Treatment',
  'Gội đầu dưỡng sinh': 'Herbal Head Wash',
  'Uốn tóc': 'Hair Perming',
  'Nhuộm tóc': 'Hair Coloring',
  'Cắt tóc': 'Haircut',
};


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

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Lang;
    if (saved && (saved === 'vi' || saved === 'en')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  // Translate service/category name
  const tn = (name: string) => {
    if (lang === 'vi') return name;
    return nameTranslations[name] || name;
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
