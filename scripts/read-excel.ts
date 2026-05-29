import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve(__dirname, '../../DanhSachSanPham.xlsx');
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

// Write all data to a JSON file for easy reading
const outputPath = path.resolve(__dirname, 'excel-data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Written ${data.length} rows to ${outputPath}`);

// Print header
console.log('\n=== HEADER ===');
console.log(JSON.stringify(data[0]));

// Collect unique categories
const categories = new Set<string>();
const loaiHang = new Set<string>();
for (let i = 1; i < data.length; i++) {
  const row = data[i] as string[];
  if (row && row[0]) loaiHang.add(row[0]);
  if (row && row[1]) categories.add(row[1]);
}

console.log('\n=== LOẠI HÀNG (cột 0) ===');
console.log([...loaiHang]);

console.log('\n=== NHÓM HÀNG (cột 1) ===');
console.log([...categories]);

console.log(`\nTotal data rows: ${data.length - 1}`);
