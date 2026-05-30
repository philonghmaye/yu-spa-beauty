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
  'Nails': 'Nails', 'Làm móng': 'Nail Art', 'Nối mi': 'Eyelash Extensions',
  'Massage': 'Massage', 'Massage & Spa': 'Massage & Spa',
  'Chăm sóc da': 'Skin Care', 'Liệu trình': 'Treatment',
  'Chăm sóc tóc': 'Hair Care', 'Trang điểm': 'Makeup',
  'Waxing': 'Waxing', 'Spa': 'Spa', 'Gội đầu': 'Head Wash',
  'Dịch vụ khác': 'Other Services',
  'Tiêm filler & Botox': 'Filler & Botox',
  'Triệt lông': 'Hair Removal', 'Giảm béo': 'Body Slimming',
  'Phun xăm': 'Permanent Makeup',
  'Tắm trắng & Dưỡng da': 'Whitening & Skin Care',
  'Trị liệu công nghệ cao': 'High-Tech Therapy',
  'Đặc trị da nhờn & Mụn': 'Oily Skin & Acne Treatment',
  'Wax lông': 'Waxing', 'HIFU Therapy': 'HIFU Therapy',
  'Laser Pink': 'Laser Pink', 'Thermage FLX': 'Thermage FLX',
  'Trị liệu vùng mắt': 'Eye Area Treatment',
  'Điều trị nám White HD': 'Melasma Treatment White HD',
  'Thuốc Juvederm': 'Juvederm', 'Thuốc Neauvia': 'Neauvia',
  'Thuốc Korean': 'Korean Products',

  // ==================== SEED SERVICES ====================
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

  // ==================== MASSAGE ====================
  'Massage đầu 30p khách tây': 'Head Massage 30min',
  'MASSAGE ĐẦU 30P KHÁCH TÂY': 'Head Massage 30min',
  'Massage body 60p': 'Body Massage 60min',
  'MASSAGE BODY 60P KHÁCH TÂY': 'Body Massage 60min',
  'Massage body 90p': 'Body Massage 90min',
  'MASSAGE BODY 90P KHÁCH TÂY': 'Body Massage 90min',
  'MASSAGE BODY GIÁ TẾT': 'Body Massage (Holiday)',
  'Massage body đá nóng 60p': 'Hot Stone Body Massage 60min',
  'MASSAGE BODY ĐÁ NÓNG 60P KHÁCH TÂY': 'Hot Stone Body Massage 60min',
  'Massage body đá nóng 90p': 'Hot Stone Body Massage 90min',
  'MASSAGE BODY ĐÁ NÓNG 90P KHÁCH TÂY': 'Hot Stone Body Massage 90min',
  'Massage chân 30p': 'Foot Massage 30min',
  'MASSAGE CHÂN 30P KHÁCH TÂY': 'Foot Massage 30min',
  'Massage chân 60p': 'Foot Massage 60min',
  'Massage chân 90p': 'Foot Massage 90min',
  'MASSAGE CHÂN 90P GIÁ TẾT': 'Foot Massage 90min (Holiday)',
  'MASSAGE CỔ VAI GÁY': 'Neck & Shoulder Massage',
  'MASSAGE THÊM 30P': 'Extra 30min Massage',
  'Massage bụng': 'Belly Massage',
  'Massage chải thông kinh lạc hút độc tố 60p': 'Meridian Detox Massage 60min',
  'Massage chải thông kinh lạc hút độc tố 90p': 'Meridian Detox Massage 90min',
  'Massage nến dưỡng da 60p': 'Candle Skin Care Massage 60min',
  'Massage nến dưỡng da 90p': 'Candle Skin Care Massage 90min',
  'Massage mặt': 'Facial Massage',
  'Massage toàn thân': 'Full Body Massage',
  'Massage vai gáy': 'Shoulder & Neck Massage',
  'Massage lưng': 'Back Massage',

  // ==================== NAILS ====================
  'Cắt da sơn gel khách tây': 'Gel Manicure',
  'cắt da sơn gel 5 lần': 'Gel Manicure 5 Sessions',
  'Sơn gel': 'Gel Polish',
  'Sơn gel tay': 'Gel Nails - Hands',
  'Sơn gel chân': 'Gel Nails - Feet',
  'SƠN GEL KHÁCH TÂY': 'Gel Polish',
  'SƠN GEL KHÔNG CẮT DA': 'Gel Polish (No Cuticle Cut)',
  'SƠN GEL MẮT MÈO GIÁ TẾT': 'Cat Eye Gel (Holiday)',
  'Sơn gel mắt mèo': 'Cat Eye Gel Nails',
  'MẮT MÈO': 'Cat Eye',
  'Mắt ướt': 'Wet Look Nails',
  'Sơn gel tráng gương': 'Mirror Gel Nails',
  'TRÁNG GƯƠNG': 'Mirror Nails',
  'Sơn Opi': 'OPI Polish',
  'SƠN CỨNG MÓNG': 'Nail Hardener Polish',
  'Design đơn giản khách tây': 'Simple Nail Design',
  'Design phức tạp': 'Complex Nail Design',
  'Tháo gel 1 bộ': 'Gel Removal (Full Set)',
  'THÁO GEL KHÁCH TÂY': 'Gel Removal',
  'THÁO MÓNG': 'Nail Removal',
  'THÁO MÓNG UP': 'Press-On Nail Removal',
  'Tháo bột': 'Acrylic Removal',
  'Cắt da': 'Cuticle Care',
  'Đắp bột': 'Acrylic Nails',
  'Đắp bột 1 ngón': 'Acrylic - 1 Nail',
  'Đắp gel 1 bộ': 'Gel Overlay (Full Set)',
  'Đắp gel 1 ngón': 'Gel Overlay - 1 Nail',
  'Đắp paraffin chân': 'Paraffin Wax - Feet',
  'Đắp paraffin tay': 'Paraffin Wax - Hands',
  'MÓNG UP 1 NGÓN': 'Press-On - 1 Nail',
  'Móng úp 1 bộ': 'Press-On Nails (Full Set)',
  'Úp móng': 'Press-On Nails',
  'Nối móng': 'Nail Extensions',
  'ombre 1 ngón': 'Ombre - 1 Nail',

  // ==================== EYELASH ====================
  'Mi Classic': 'Classic Lashes', 'Mi Anime': 'Anime Lashes',
  'Mi Anime Mix Mi M': 'Anime Mix M Lashes',
  'Mi Baby Doll': 'Baby Doll Lashes', 'Mi Bồ Công Anh': 'Dandelion Lashes',
  'Mi Foxy': 'Foxy Lashes', 'Mi LB douyin': 'LB Douyin Lashes',
  'Mi LD Mix Nâu': 'LD Mix Brown Lashes', 'Mi Lông Thỏ': 'Bunny Lashes',
  'Mi Manhua': 'Manhua Lashes', 'Mi Rối Đa Tầng': 'Multi-Layer Lashes',
  'Mi Sole': 'Sole Lashes', 'Mi Sole Thái': 'Thai Sole Lashes',
  'Mi ULzzang': 'Ulzzang Lashes', 'Mi Wispy': 'Wispy Lashes',
  'Mi Xéo': 'Slanted Lashes', 'Mi Đuôi Cá': 'Fishtail Lashes',
  'MI DƯỚI': 'Lower Lashes', 'THÁO MI': 'Lash Removal',
  'UỐN MI': 'Lash Lift', 'Uốn mi': 'Lash Lift',

  // ==================== SKIN CARE ====================
  'Chăm sóc da mặt': 'Facial Treatment',
  'MỞ CỬA DA': 'Skin Opening', 'MỞ CỬA DA KHÁCH TÂY': 'Skin Opening',
  'Mở cửa da': 'Skin Opening', 'MESO CĂNG BÓNG': 'Meso Skin Glow',
  'PEEL CĂNG BÓNG': 'Glow Peel', 'PEEL ICON SKIN': 'Icon Skin Peel',
  'PEEL IMACE': 'Imace Peel', 'PEEL RETINOL': 'Retinol Peel',
  'Nặn mụn': 'Acne Extraction',
  'MẶT NẠ MATCHA': 'Matcha Face Mask', 'MẶT NẠ ĐẤT SÉT': 'Clay Face Mask',
  'MẶT NẠ ĐẮP CHÂN': 'Foot Mask',
  'Mặt nạ phục hồi': 'Recovery Mask', 'Mặt nạ trắng da': 'Whitening Mask',
  'VITAMIN C': 'Vitamin C Treatment',
  'S - SHAPE PEPTIDE MASSAGE CREAM': 'S-Shape Peptide Massage Cream',

  // ==================== PERMANENT MAKEUP ====================
  'PHUN MÔI': 'Lip Tattoo', 'Phun môi mới': 'New Lip Tattoo',
  'Phun mày mới': 'New Eyebrow Tattoo', 'Phun mí mới': 'New Eyeliner Tattoo',
  'Phun mày cũ, sửa mày': 'Eyebrow Touch-Up',
  'Phun hồng nhũ hoa Cấp 1': 'Areola Tattoo Level 1',
  'Phun hồng nhũ hoa cấp 2': 'Areola Tattoo Level 2',
  'Phun hồng nhũ hoa cấp 3': 'Areola Tattoo Level 3',
  'XĂM CHÂN MÀY': 'Eyebrow Tattoo', 'XÓA CHÂN MÀY': 'Eyebrow Removal',
  'XÓA XĂM CHÂN MÀY': 'Eyebrow Tattoo Removal',
  'Xóa mày cũ': 'Old Eyebrow Removal', 'Xóa hình xăm': 'Tattoo Removal',
  'TÉM CHÂN MÀY': 'Eyebrow Trimming',
  'Làm hồng môi C:02': 'Lip Pinkening C:02',

  // ==================== FILLER & BOTOX ====================
  'TIÊM BOTOX': 'Botox Injection', 'TIÊM MÔI': 'Lip Filler',
  'TIÊM FILLER MẮT': 'Eye Filler', 'TIÊM THÁI DƯƠNG': 'Temple Filler',
  'TIÊM TRÁN': 'Forehead Filler',
  'TIÊM TRẮNG DA OXY 3 LẦN': 'Skin Whitening Injection 3 Sessions',
  'Tiêm Filler Vip': 'VIP Filler', 'Tiêm môi': 'Lip Filler',
  'Tiêm mũi': 'Nose Filler', 'Tiêm cằm': 'Chin Filler',
  'Tiêm trán': 'Forehead Filler', 'Tiêm thái dương': 'Temple Filler',
  'Tiêm má baby': 'Baby Cheek Filler', 'Tiêm rãnh cười': 'Smile Line Filler',
  'Tiêm hạ gò má': 'Cheekbone Filler', 'Tiêm hồng môi': 'Lip Pinkening',
  'Tiêm làm đầy hốc mắt': 'Under Eye Filler',
  'Tiêm bàn tay': 'Hand Filler',
  'Tiêm thon gọn hàm': 'Jaw Slimming Botox',
  'Tiêm botox bắp chân': 'Calf Botox', 'Tiêm botox bắp tay': 'Arm Botox',
  'Tiêm botox thon gọn tay': 'Arm Slimming Botox',
  'Tiêm trị hôi nách': 'Underarm Odor Botox',
  'Tiêm xóa nếp nhăn chân mày': 'Eyebrow Wrinkle Botox',
  'Tiêm xóa nếp nhăn trán': 'Forehead Wrinkle Botox',
  'Tiên xóa nếp nhăn mắt': 'Eye Wrinkle Botox',
  'Tiêm điều trị thâm mắt': 'Dark Circle Treatment',
  'Tiêm trái tai tài lộc': 'Ear Filler',
  'Tiêm môi Collagen không filler làm đầy': 'Collagen Lip (No Filler)',
  'tiêm botox mắt + trán': 'Botox Eye + Forehead',
  'tiêm filer hàn 1cc': 'Korean Filler 1cc',
  'tiêm karisma': 'Karisma Injection',
  'tiêm mắt collagen': 'Eye Collagen Injection',
  'Tiêm thái dương, cằm, má, rãnh cười, trán, bàn tay': 'Temple, Chin, Cheek, Smile Line, Forehead, Hand Filler',
  'Tiêm thái dương, cằm, má, rãnh cười, trán, tai, bàn tay, hốc mắt': 'Full Face Filler Package',
  'Thu gọn cánh mũi': 'Nose Wing Reduction',

  // ==================== HAIR REMOVAL ====================
  'TRIỆT BIKINI': 'Bikini Hair Removal', 'TRIỆT CỔ GÁY': 'Nape Hair Removal',
  'TRIỆT CỔ GÁY, NÁCH, TAY, CHÂN': 'Nape, Underarm, Arm & Leg Removal',
  'TRIỆT FULL LƯNG': 'Full Back Removal', 'TRIỆT FULL TAY, NÁCH': 'Full Arm & Underarm',
  'TRIỆT MẶT, BIKINI': 'Face & Bikini Removal',
  'TRIỆT NÁCH': 'Underarm Removal', 'TRIỆT NÁCH LẺ': 'Single Underarm',
  'Triệt 1/2 chân': 'Half Leg Removal', 'Triệt full chân': 'Full Leg Removal',
  'Triệt full tay': 'Full Arm Removal', 'Triệt lông bikini lẻ': 'Single Bikini',
  'Triệt lông mặt': 'Face Hair Removal', 'Triệt ria mép': 'Mustache Removal',
  'Triệt vùng nách': 'Underarm Removal',

  // ==================== WAXING ====================
  'WAX CHÂN': 'Leg Wax', 'Wax 1/2 tay': 'Half Arm Wax',
  'Wax bikino': 'Bikini Wax', 'Wax full body': 'Full Body Wax',
  'Wax nách': 'Underarm Wax',

  // ==================== WHITENING ====================
  'Tắm trắng Ngọc Trai Collagen 1 buổi': 'Pearl Collagen Whitening 1 Session',
  'Tắm trắng Ngọc Trai Collagen 10 buổi': 'Pearl Collagen Whitening 10 Sessions',
  'Tắm trắng cao cấp White Carbon 1 buổi': 'Premium White Carbon 1 Session',
  'Tắm trắng cao cấp White Carbon 10 buổi': 'Premium White Carbon 10 Sessions',
  'Tắm trắng chân tay 1 buổi': 'Limb Whitening 1 Session',
  'Tắm trắng chân tay 10 buổi': 'Limb Whitening 10 Sessions',
  'Tắm trắng da mặt 1 buổi': 'Face Whitening 1 Session',
  'Tắm trắng da mặt 10 buổi': 'Face Whitening 10 Sessions',
  'Tắm trắng da sáng mịn 1 buổi': 'Bright Skin Whitening 1 Session',
  'Tắm trắng da sáng mịn 10 buổi': 'Bright Skin Whitening 10 Sessions',
  'Tắm trắng phi thuyền': 'Capsule Whitening',
  'Tắm trắng vùng cổ 1 buổi': 'Neck Whitening 1 Session',
  'Tắm trắng vùng cổ 10 buổi': 'Neck Whitening 10 Sessions',
  'TRUYỀN TRẮNG VITAMIN 3 LẦN': 'Vitamin Whitening IV 3 Sessions',

  // ==================== SLIMMING (HIFU) ====================
  'Vùng bắp chân': 'Calf Area', 'Vùng bắp tay': 'Arm Area',
  'Vùng bụng': 'Belly Area', 'Vùng má': 'Cheek Area',
  'Vùng mắt': 'Eye Area', 'Vùng nọng cằm': 'Double Chin Area',
  'Vùng trán': 'Forehead Area',

  // ==================== HAIR ====================
  'Uốn tóc': 'Hair Perming', 'Nhuộm tóc': 'Hair Coloring',
  'Cắt tóc': 'Haircut', 'Phục hồi tóc': 'Hair Restoration',
  'Ép tóc': 'Hair Straightening', 'ép tóc': 'Hair Straightening',
  'Hấp dầu': 'Hair Conditioning', 'NHUỘM PHŨ BẠC': 'Gray Coverage Color',

  // ==================== MISC ====================
  'ĐỐT MỤN RUỒI': 'Mole Removal',
  'Trẻ hóa âm đạo': 'Vaginal Rejuvenation',
  'MUA 5 TẶNG 1 ( GỐI 129K )': 'Buy 5 Get 1 Free (129K Package)',
  'SERVICE': 'Service', 'THUẾ': 'Tax',
  'Làm giảm thâm vùng dưới cánh tay công nghệ Nhật': 'Japanese Underarm Dark Spot Treatment',
  'Làm hồng cô bé công nghệ Nhật': 'Japanese Intimate Pinkening',
  'Làm hồng nhũ hoa công nghệ Nhật': 'Japanese Areola Pinkening',
  'Làm hồng quanh vùng Bikini công nghệ Nhật': 'Japanese Bikini Area Pinkening',
  'Trị thâm nách bằng máy CO2 Fractional kết hợp Laser': 'CO2 Fractional Laser Underarm Treatment',
  'Trị thâm nách công nghệ Nhật': 'Japanese Underarm Dark Spot Treatment',

  // ==================== LONG DESCRIPTIONS ====================
  'RF công nghệ nâng cơ mặt hiện đại, chống nhão xệ, và xóa nếp nhăn sâu, săn chắc cơ mặt kết hợp Collagen tươi.': 'RF face lifting technology, anti-sagging, deep wrinkle removal, firming with fresh Collagen.',
  'Thay da sinh học với AHA: Loại bỏ bề mặt da thô sần, tái tạo lớp da mới căng bóng, trẻ hóa và cải thiện cấu trúc khuôn mặt.': 'AHA bio-peel: Remove rough skin surface, regenerate smooth new skin, rejuvenate and improve facial structure.',
  'Thermage i-on tái tạo tế bào mới – sáng da nhanh, làm đầy nếp nhăn sâu, giúp da căng mịn và tươi trẻ bất ngờ.': 'Thermage i-on cell regeneration – fast brightening, deep wrinkle filling, smooth and youthful skin.',
  'Trẻ hóa da, đặc trị nám, tàn nhang, đốm nâu, nốt ruồi, mụn thịt tận gốc, an toàn hiệu quả, không để lại sẹo công nghệ Laser Co2 Fractional.': 'Skin rejuvenation, melasma, freckle, brown spot, mole treatment with CO2 Fractional Laser. Safe and scar-free.',
  'Tái sinh làn da với công nghệ: LAZER CO2 FRACTIONAL': 'Skin regeneration with CO2 Fractional Laser',
  'Trị liệu khôi phục tế bào, làm mờ vết thâm, làm đầy sẹo rỗ.': 'Cell restoration therapy, fade dark spots, fill acne scars.',
  'trẻ hóa và láng mịn da, tái tạo Collagen mới.': 'Rejuvenate and smooth skin, regenerate new Collagen.',
  'Điều trị bọng mỡ và túi mắt, giảm stress vùng mắt cấp tốc.': 'Eye bag and puffiness treatment, quick eye area stress relief.',
  'Điều trị chuyên sâu đột phá tận gốc các vết nám, tàn nhang và đốm nâu.': 'Advanced deep treatment for melasma, freckles and brown spots.',
  'Điều trị mụn ẩn.': 'Hidden acne treatment.',
  'Điều trị nám nặng nội tiết tố, từ sâu bên trong.': 'Deep hormonal melasma treatment from within.',
  'Điều trị nếp gấp và nếp nhăn sâu, làm căng mịn vùng mắt nhão chùng.': 'Deep wrinkle treatment, tighten sagging eye area.',
  'Điều trị quầng thâm lâu ngày, làm tươi sáng vùng mắt.': 'Long-term dark circle treatment, brighten eye area.',
  'Điều trị rối loạn tuyến nhờn, mụn viêm nhiễm sâu.': 'Sebaceous gland disorder and deep inflammatory acne treatment.',
  'Điều trị sắc tố da, lỗ chân lông to và tình trạng da sạm nám do nội tiết.': 'Skin pigment, large pore and hormonal dark spot treatment.',
  'Đặc trị mụn ít, ẩn, thâm.': 'Mild, hidden and dark acne treatment.',
  'Đặc trị triệt tiêu mụn bọc, mụn viêm, mụn mủ.': 'Cystic, inflammatory and pustular acne treatment.',

  // ==================== SEED DESCRIPTIONS ====================
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
  'Các dịch vụ chăm sóc và điều trị da mặt': 'Facial care and treatment services',
  'Dịch vụ làm nail nghệ thuật': 'Artistic nail services',
  'Nối mi chuyên nghiệp': 'Professional eyelash extensions',
  'Massage thư giãn toàn thân': 'Full body relaxation massage',

  // ==================== STAFF ====================
  'Chuyên viên': 'Specialist', 'Chuyên viên da liễu': 'Dermatology Specialist',
  'Nail Artist': 'Nail Artist', 'Chuyên viên Spa': 'Spa Specialist',
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

  // Keyword-based auto-translation for unmapped names
  const keywordMap: [RegExp, string][] = [
    // Body parts & areas
    [/\bvùng\b/gi, 'Area:'], [/\bmặt\b/gi, 'Face'], [/\bmắt\b/gi, 'Eye'],
    [/\bmôi\b/gi, 'Lip'], [/\bmũi\b/gi, 'Nose'], [/\bcằm\b/gi, 'Chin'],
    [/\btrán\b/gi, 'Forehead'], [/\bmá\b/gi, 'Cheek'], [/\btay\b/gi, 'Arm'],
    [/\bchân\b/gi, 'Leg'], [/\bnách\b/gi, 'Underarm'], [/\blưng\b/gi, 'Back'],
    [/\bbụng\b/gi, 'Belly'], [/\bcổ\b/gi, 'Neck'], [/\bvai\b/gi, 'Shoulder'],
    [/\bgáy\b/gi, 'Nape'], [/\bbikini\b/gi, 'Bikini'], [/\bria mép\b/gi, 'Mustache'],
    [/\bthái dương\b/gi, 'Temple'], [/\brãnh cười\b/gi, 'Smile Line'],
    [/\bhốc mắt\b/gi, 'Under Eye'], [/\bnọng cằm\b/gi, 'Double Chin'],
    [/\bnhũ hoa\b/gi, 'Areola'], [/\bâm đạo\b/gi, 'Vaginal'],
    [/\bbắp chân\b/gi, 'Calf'], [/\bbắp tay\b/gi, 'Upper Arm'],
    [/\bhàm\b/gi, 'Jaw'], [/\btai\b/gi, 'Ear'], [/\bđầu\b/gi, 'Head'],

    // Actions & treatments
    [/\bmassage\b/gi, 'Massage'], [/\btiêm\b/gi, 'Injection'],
    [/\btriệt\b/gi, 'Hair Removal'], [/\bwax\b/gi, 'Wax'],
    [/\bphun\b/gi, 'Tattoo'], [/\bxăm\b/gi, 'Tattoo'],
    [/\bxóa\b/gi, 'Removal'], [/\btháo\b/gi, 'Remove'],
    [/\bđắp\b/gi, 'Apply'], [/\bsơn\b/gi, 'Polish'],
    [/\bnối\b/gi, 'Extension'], [/\buốn\b/gi, 'Perm/Lift'],
    [/\bnhuộm\b/gi, 'Color/Tint'], [/\bcắt\b/gi, 'Cut'],
    [/\bnặn\b/gi, 'Extract'], [/\bđốt\b/gi, 'Burn/Remove'],
    [/\btruyền\b/gi, 'IV Drip'], [/\bđiều trị\b/gi, 'Treatment'],
    [/\btrị\b/gi, 'Treat'], [/\blàm\b/gi, 'Make'],
    [/\btắm trắng\b/gi, 'Whitening Bath'], [/\bgội\b/gi, 'Wash'],
    [/\bchăm sóc\b/gi, 'Care'], [/\bpeel\b/gi, 'Peel'],
    [/\blăn kim\b/gi, 'Microneedling'],

    // Products & types
    [/\bgel\b/gi, 'Gel'], [/\bbột\b/gi, 'Acrylic'],
    [/\bmi\b/gi, 'Lashes'], [/\bmóng\b/gi, 'Nail'],
    [/\bda\b/gi, 'Skin'], [/\btóc\b/gi, 'Hair'],
    [/\bmặt nạ\b/gi, 'Mask'], [/\bmụn\b/gi, 'Acne'],
    [/\bnám\b/gi, 'Melasma'], [/\bthâm\b/gi, 'Dark Spot'],
    [/\bnếp nhăn\b/gi, 'Wrinkle'], [/\bsẹo\b/gi, 'Scar'],
    [/\bcollagen\b/gi, 'Collagen'], [/\bfiller\b/gi, 'Filler'],
    [/\bbotox\b/gi, 'Botox'], [/\bvitamin\b/gi, 'Vitamin'],
    [/\bparaffin\b/gi, 'Paraffin'], [/\bretinol\b/gi, 'Retinol'],

    // Qualifiers
    [/\bfull\b/gi, 'Full'], [/\bcao cấp\b/gi, 'Premium'],
    [/\bchuyên sâu\b/gi, 'Advanced'], [/\bcơ bản\b/gi, 'Basic'],
    [/\bmới\b/gi, 'New'], [/\bcũ\b/gi, 'Old'],
    [/\blẻ\b/gi, 'Single'], [/\b1 bộ\b/gi, '(Full Set)'],
    [/\b1 ngón\b/gi, '(1 Nail)'], [/\b1 buổi\b/gi, '1 Session'],
    [/\b10 buổi\b/gi, '10 Sessions'], [/\b3 lần\b/gi, '3 Sessions'],
    [/\b5 lần\b/gi, '5 Sessions'],
    [/\bkhách tây\b/gi, ''], [/\bgiá tết\b/gi, '(Holiday)'],
    [/\bphút\b/gi, 'min'], [/\bbuổi\b/gi, 'Session'],
  ];

  // Translate service/category name
  const tn = (name: string) => {
    if (lang === 'vi') return name;
    // Try exact match first
    if (nameTranslations[name]) return nameTranslations[name];
    // Try case-insensitive match
    const lower = name.toLowerCase();
    for (const key of Object.keys(nameTranslations)) {
      if (key.toLowerCase() === lower) return nameTranslations[key];
    }
    // Auto-translate using keyword replacement
    let result = name;
    for (const [pattern, replacement] of keywordMap) {
      result = result.replace(pattern, replacement);
    }
    // Clean up: remove extra spaces, trim
    result = result.replace(/\s+/g, ' ').trim();
    // If result changed, return it; otherwise return original
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
