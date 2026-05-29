/**
 * Script import dữ liệu dịch vụ từ file DanhSachSanPham.xlsx
 * 
 * Chức năng:
 * 1. Xóa toàn bộ dịch vụ (Service) và danh mục (Category) cũ
 * 2. Tạo danh mục mới từ cột "Nhóm hàng"
 * 3. Import dịch vụ mới từ cột: Mã hàng, Tên hàng hóa, Thời lượng, Giá bán
 * 
 * Chạy: npx tsx scripts/import-services.ts
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper: Vietnamese text to URL slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Icon mapping for each category
const categoryIcons: Record<string, string> = {
  'NAILS': '💅',
  'Nối Mi': '👁️',
  'MASSAGE': '💆',
  'CHĂM SÓC DA YURI': '✨',
  'Liệu trình': '📋',
  'CHĂM SÓC TÓC': '💇',
  'DỊCH VỤ': '🏷️',
  'TIÊM FILTER - BOTOX': '💉',
  'LIỆU TRÌNH TRIỆT LÔNG': '🔥',
  'GIẢM BÉO VÙNG BỤNG': '🏋️',
  'PHUN XĂM': '🎨',
  'TẮM TRẮNG - DƯỠNG DA': '🛁',
  'TRỊ LIỆU CHUYÊN SÂU VỚI MÁY CÔNG NGHỆ CAO THERMAGE I-ON LIGHT-IPL-LASER RF-HIFU-CO2 FRACTIONAL': '🔬',
  'ĐẶC TRỊ DA NHỜN , MỤN , VIÊM NHIỄM VÀ TỔN THƯƠNG GIA': '🧴',
  'WAX LÔNG': '✂️',
  'LIỆU TRÌNH MÁY HIFU THERAPY': '📡',
  'LASER PINK': '💗',
  'THERMAGE FLX': '⚡',
  'CHĂM SÓC_TRỊ LIỆU CHO VÙNG MẮT & CÓ KẾT HỢP CÔNG NGHỆ SÓNG ION THẾ HỆ III': '👀',
  'ĐIỀU TRỊ NÁM CÔNG NGHỆ WHITE HD TRẮNG SÁNG ĐỘC QUYỀN CHO LÀN DA CHÂU Á': '🌟',
  'THUỐC JUVEDERM': '💎',
  'THUỐC NEAUVIA': '💊',
  'THUỐC KOREAN': '🇰🇷',
};

// Short display names for categories with very long names
const categoryDisplayNames: Record<string, string> = {
  'TRỊ LIỆU CHUYÊN SÂU VỚI MÁY CÔNG NGHỆ CAO THERMAGE I-ON LIGHT-IPL-LASER RF-HIFU-CO2 FRACTIONAL': 'Trị liệu Công nghệ cao',
  'ĐẶC TRỊ DA NHỜN , MỤN , VIÊM NHIỄM VÀ TỔN THƯƠNG GIA': 'Đặc trị Da nhờn & Mụn',
  'CHĂM SÓC_TRỊ LIỆU CHO VÙNG MẮT & CÓ KẾT HỢP CÔNG NGHỆ SÓNG ION THẾ HỆ III': 'Trị liệu Vùng mắt',
  'ĐIỀU TRỊ NÁM CÔNG NGHỆ WHITE HD TRẮNG SÁNG ĐỘC QUYỀN CHO LÀN DA CHÂU Á': 'Điều trị Nám White HD',
  'TIÊM FILTER - BOTOX': 'Tiêm Filler & Botox',
  'TẮM TRẮNG - DƯỠNG DA': 'Tắm trắng & Dưỡng da',
  'LIỆU TRÌNH TRIỆT LÔNG': 'Triệt lông',
  'LIỆU TRÌNH MÁY HIFU THERAPY': 'HIFU Therapy',
  'GIẢM BÉO VÙNG BỤNG': 'Giảm béo',
  'CHĂM SÓC DA YURI': 'Chăm sóc da',
  'CHĂM SÓC TÓC': 'Chăm sóc tóc',
  'PHUN XĂM': 'Phun xăm',
  'MASSAGE': 'Massage',
  'NAILS': 'Nails',
  'Nối Mi': 'Nối mi',
  'WAX LÔNG': 'Wax lông',
  'THERMAGE FLX': 'Thermage FLX',
  'LASER PINK': 'Laser Pink',
  'Liệu trình': 'Liệu trình',
  'DỊCH VỤ': 'Dịch vụ khác',
  'THUỐC JUVEDERM': 'Thuốc Juvederm',
  'THUỐC NEAUVIA': 'Thuốc Neauvia',
  'THUỐC KOREAN': 'Thuốc Korean',
};

interface ExcelRow {
  loaiHang: string;
  nhomHang: string;
  maHang: string;
  tenHang: string;
  thoiLuong: number;
  giaBan: number;
}

async function main() {
  console.log('📖 Reading Excel file...');
  
  const filePath = path.resolve(__dirname, '../../DanhSachSanPham.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Parse rows (skip header row 0)
  const rows: ExcelRow[] = [];
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[2] || !row[3]) continue; // skip empty rows

    const thoiLuong = parseInt(String(row[4] || '0'), 10);
    const giaBan = Number(row[5]) || 0;

    rows.push({
      loaiHang: String(row[0] || '').trim(),
      nhomHang: String(row[1] || '').trim(),
      maHang: String(row[2] || '').trim(),
      tenHang: String(row[3] || '').trim(),
      thoiLuong: thoiLuong > 0 ? thoiLuong : 30, // default 30 min
      giaBan,
    });
  }

  console.log(`📊 Found ${rows.length} services in Excel`);

  // Collect unique categories (nhomHang)
  const uniqueCategories = [...new Set(rows.map(r => r.nhomHang))].filter(Boolean);
  console.log(`📁 Found ${uniqueCategories.length} categories: ${uniqueCategories.join(', ')}`);

  // ========== STEP 1: Delete old data ==========
  console.log('\n🗑️  Deleting old data...');
  
  // Delete in correct order to respect foreign keys
  await prisma.appointmentService.deleteMany({});
  console.log('   ✓ Deleted appointment services');
  
  await prisma.employeeSkill.deleteMany({});
  console.log('   ✓ Deleted employee skills');
  
  await prisma.service.deleteMany({});
  console.log('   ✓ Deleted all services');
  
  await prisma.category.deleteMany({});
  console.log('   ✓ Deleted all categories');

  // ========== STEP 2: Create categories ==========
  console.log('\n📁 Creating categories...');
  
  const categoryMap = new Map<string, string>(); // nhomHang -> categoryId
  
  for (let i = 0; i < uniqueCategories.length; i++) {
    const nhomHang = uniqueCategories[i];
    const displayName = categoryDisplayNames[nhomHang] || nhomHang;
    const slug = slugify(displayName);
    const icon = categoryIcons[nhomHang] || '🔸';

    const cat = await prisma.category.create({
      data: {
        name: displayName,
        slug: slug || `cat-${i}`,
        icon,
        sortOrder: i + 1,
        isActive: true,
      },
    });
    
    categoryMap.set(nhomHang, cat.id);
    console.log(`   ✓ ${icon} ${displayName} (${slug})`);
  }

  // ========== STEP 3: Create services ==========
  console.log('\n📋 Creating services...');
  
  // Track slugs to avoid duplicates
  const usedSlugs = new Set<string>();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const categoryId = categoryMap.get(row.nhomHang);
    if (!categoryId) {
      console.log(`   ⚠️ Skip: no category for "${row.nhomHang}" - ${row.tenHang}`);
      skipped++;
      continue;
    }

    // Generate unique slug
    let baseSlug = slugify(row.tenHang);
    if (!baseSlug) baseSlug = slugify(row.maHang);
    
    let slug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);

    // Determine if time value is actually minutes or something else
    // Some rows have values like 170-189 which seem like sort codes, not duration
    let duration = row.thoiLuong;
    if (duration > 300) duration = 60; // Cap unreasonable durations to 60 min

    await prisma.service.create({
      data: {
        categoryId,
        name: row.tenHang,
        slug,
        description: null,
        price: row.giaBan,
        duration,
        isActive: true,
        isFeatured: false,
        sortOrder: created,
      },
    });
    created++;
  }

  console.log(`\n✅ Import completed!`);
  console.log(`   📋 Categories: ${uniqueCategories.length}`);
  console.log(`   📦 Services created: ${created}`);
  console.log(`   ⚠️ Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
