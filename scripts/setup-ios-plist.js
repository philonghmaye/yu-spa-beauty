const fs = require('fs');
const path = require('path');

const plistPath = path.join(__dirname, '../ios/App/App/Info.plist');

if (!fs.existsSync(plistPath)) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  ios/App/App/Info.plist không tìm thấy. Vui lòng chạy lệnh "npx cap add ios" trước.');
  process.exit(0);
}

let content = fs.readFileSync(plistPath, 'utf8');

const permissions = {
  NSCameraUsageDescription: 'Ứng dụng cần truy cập Camera để chụp và cập nhật ảnh đại diện hoặc ảnh liệu trình chăm sóc spa của bạn.',
  NSLocationWhenInUseUsageDescription: 'Ứng dụng cần truy cập vị trí của bạn để tìm chi nhánh Spa gần nhất và định vị trên bản đồ.',
  NSPhotoLibraryUsageDescription: 'Ứng dụng cần truy cập Thư viện ảnh để bạn chọn và tải lên ảnh đại diện cá nhân.',
  NSPhotoLibraryAddUsageDescription: 'Ứng dụng cần truy cập Thư viện ảnh để lưu hình ảnh đặt lịch hoặc hóa đơn spa.',
};

let modified = false;

// Tìm vị trí thẻ <dict> đầu tiên trong file plist
const dictSearchString = '<dict>';
const dictIndex = content.indexOf(dictSearchString);

if (dictIndex === -1) {
  console.log('\x1b[31m%s\x1b[0m', '❌ File Info.plist không đúng định dạng XML plist (thiếu thẻ <dict>).');
  process.exit(1);
}

// Điểm chèn ngay sau thẻ <dict>
const insertIndex = dictIndex + dictSearchString.length;

for (const [key, value] of Object.entries(permissions)) {
  if (!content.includes(`<key>${key}</key>`)) {
    const injection = `\n    <key>${key}</key>\n    <string>${value}</string>`;
    content = content.slice(0, insertIndex) + injection + content.slice(insertIndex);
    modified = true;
    console.log('\x1b[32m%s\x1b[0m', `✅ Đã chèn thành công quyền: ${key}`);
  } else {
    console.log('\x1b[36m%s\x1b[0m', `ℹ️  Quyền ${key} đã tồn tại trong Info.plist.`);
  }
}

if (modified) {
  fs.writeFileSync(plistPath, content, 'utf8');
  console.log('\x1b[32m%s\x1b[0m', '🎉 Đã cập nhật file Info.plist thành công!');
} else {
  console.log('\x1b[36m%s\x1b[0m', 'ℹ️  Không cần thay đổi gì thêm trong Info.plist.');
}
