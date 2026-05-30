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
  // ==================== CATEGORIES ====================
  'Nails': 'Nails',
  'Làm móng': 'Nail Art',
  'Nối mi': 'Eyelash Extensions',
  'Massage': 'Massage',
  'Massage & Spa': 'Massage & Spa',
  'Chăm sóc da': 'Skin Care',
  'Liệu trình': 'Treatment',
  'Chăm sóc tóc': 'Hair Care',
  'Trang điểm': 'Makeup',
  'Waxing': 'Waxing',
  'Spa': 'Spa',
  'Gội đầu': 'Head Wash',
  'Dịch vụ khác': 'Other Services',
  'Tiêm filler & Botox': 'Filler & Botox Injection',
  'Triệt lông': 'Hair Removal',
  'Giảm béo': 'Body Slimming',
  'Phun xăm': 'Permanent Makeup',
  'Tắm trắng & Dưỡng da': 'Whitening & Skin Care',
  'Trị liệu công nghệ cao': 'High-Tech Therapy',
  'Đặc trị da nhờn & Mụn': 'Oily Skin & Acne Treatment',
  'Wax lông': 'Waxing',
  'HIFU Therapy': 'HIFU Therapy',
  'Laser Pink': 'Laser Pink',
  'Thermage FLX': 'Thermage FLX',
  'Trị liệu vùng mắt': 'Eye Area Treatment',
  'Điều trị nám White HD': 'Melasma Treatment White HD',
  'Thuốc Juvederm': 'Juvederm',
  'Thuốc Neauvia': 'Neauvia',
  'Thuốc Korean': 'Korean Products',

  // ==================== SERVICES (from seed) ====================
  'Chăm sóc da mặt cơ bản': 'Basic Facial Care',
  'Chăm sóc da chuyên sâu': 'Advanced Skin Care',
  'Trị mụn chuyên sâu': 'Advanced Acne Treatment',
  'Làm móng gel cao cấp': 'Premium Gel Nails',
  'Sơn móng Ombre': 'Ombre Nail Polish',
  'Nối mi Classic': 'Classic Lash Extensions',
  'Nối mi Volume': 'Volume Lash Extensions',
  'Massage body thư giãn': 'Relaxing Body Massage',
  'Massage đá nóng': 'Hot Stone Massage',
  'Gội đầu dưỡng sinh': 'Herbal Head Wash',

  // ==================== NAIL SERVICES ====================
  'Massage đầu 30p khách tây': 'Head Massage 30min',
  'Massage body 60p': 'Body Massage 60min',
  'Massage body 90p': 'Body Massage 90min',
  'Massage mặt': 'Facial Massage',
  'Massage chân': 'Foot Massage',
  'Massage toàn thân': 'Full Body Massage',
  'Massage vai gáy': 'Shoulder & Neck Massage',
  'Massage lưng': 'Back Massage',
  'Cắt da sơn gel khách tây': 'Gel Manicure',
  'Sơn gel tay': 'Gel Nails - Hands',
  'Sơn gel chân': 'Gel Nails - Feet',
  'Sơn gel tay chân': 'Gel Nails - Hands & Feet',
  'Design đơn giản khách tây': 'Simple Nail Design',
  'Design phức tạp': 'Complex Nail Design',
  'Tháo gel': 'Gel Removal',
  'Cắt da': 'Cuticle Care',
  'Sơn thường': 'Regular Polish',
  'Đắp bột': 'Acrylic Nails',
  'Nối móng': 'Nail Extensions',

  // ==================== EYELASH SERVICES ====================
  'Nối mi cụm': 'Cluster Lash Extensions',
  'Nối mi sợi': 'Individual Lash Extensions',
  'Nối mi 1:1': '1:1 Lash Extensions',
  'Nối mi Mega Volume': 'Mega Volume Lashes',
  'Tháo mi': 'Lash Removal',
  'Uốn mi': 'Lash Lift',
  'Nhuộm mi': 'Lash Tint',

  // ==================== SKIN CARE SERVICES ====================
  'Chăm sóc da mặt': 'Facial Treatment',
  'Tẩy tế bào chết': 'Exfoliation',
  'Đắp mặt nạ': 'Face Mask Treatment',
  'Mở cửa da': 'Skin Opening Treatment',
  'Trị nám': 'Melasma Treatment',
  'Trị thâm': 'Dark Spot Treatment',
  'Căng bóng da': 'Skin Brightening',
  'Peel da': 'Chemical Peel',
  'Lăn kim': 'Microneedling',

  // ==================== HAIR SERVICES ====================
  'Uốn tóc': 'Hair Perming',
  'Nhuộm tóc': 'Hair Coloring',
  'Cắt tóc': 'Haircut',
  'Phục hồi tóc': 'Hair Restoration',
  'Ép tóc': 'Hair Straightening',
  'Hấp dầu': 'Hair Conditioning',

  // ==================== STAFF POSITIONS ====================
  'Chuyên viên': 'Specialist',
  'Chuyên viên da liễu': 'Dermatology Specialist',
  'Nail Artist': 'Nail Artist',
  'Chuyên viên Spa': 'Spa Specialist',

  // ==================== SERVICE DESCRIPTIONS ====================
  'Làm sạch sâu, tẩy tế bào chết, đắp mặt nạ dưỡng ẩm cao cấp': 'Deep cleansing, exfoliation, premium moisturizing mask',
  'Liệu trình trẻ hóa da với công nghệ hiện đại và sản phẩm cao cấp': 'Skin rejuvenation with modern technology and premium products',
  'Điều trị mụn hiệu quả, phục hồi da sạch khỏe': 'Effective acne treatment, restore clear and healthy skin',
  'Thiết kế móng nghệ thuật với gel bền đẹp lên đến 3-4 tuần': 'Artistic nail design with durable gel lasting 3-4 weeks',
  'Kỹ thuật sơn chuyển màu gradient thời thượng': 'Trendy gradient color technique',
  'Nối mi 1:1 tự nhiên, nhẹ nhàng, bền đẹp 3-4 tuần': 'Natural 1:1 lash extensions, lightweight, lasting 3-4 weeks',
  'Nối mi bung dày, quyến rũ cho đôi mắt cuốn hút': 'Full volume lashes, glamorous and captivating eyes',
  'Massage toàn thân kết hợp tinh dầu, giảm stress hiệu quả': 'Full body massage with essential oils, effective stress relief',
  'Liệu pháp đá nóng giúp thư giãn sâu, giảm đau nhức': 'Hot stone therapy for deep relaxation and pain relief',
  'Gội đầu kết hợp massage đầu, vai, cổ thư giãn': 'Head wash with relaxing head, shoulder and neck massage',

  // ==================== CATEGORY DESCRIPTIONS ====================
  'Các dịch vụ chăm sóc và điều trị da mặt': 'Facial care and treatment services',
  'Dịch vụ làm nail nghệ thuật': 'Artistic nail services',
  'Nối mi chuyên nghiệp': 'Professional eyelash extensions',
  'Massage thư giãn toàn thân': 'Full body relaxation massage',
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
