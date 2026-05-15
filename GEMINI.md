# YURI SPA BEAUTY — Antigravity Project Config

## Available Skills (Vibecodekit)

Dự án này có cài đặt 3 skills từ [vibecodekit](https://github.com/Neurons-AI/vibecodekit), đã được chuyển đổi cho Antigravity:

### `/vibe-builder` — Solo Builder Agent
- **File**: `.gemini/skills/vibe-builder.md`
- **Dùng khi**: Muốn xây dựng ứng dụng mới từ đầu
- **Cách dùng**: Nói "vibe-builder [mô tả app bạn muốn build]"
- **Workflow**: Research → PRD → Coding → Testing → Deploy (6 phases)

### `/vibe-debugger` — Structured Debugger
- **File**: `.gemini/skills/vibe-debugger.md`
- **Dùng khi**: Có bug cần debug có hệ thống
- **Cách dùng**: Nói "vibe-debugger [mô tả bug + error messages]"
- **Workflow**: Research → BUG_REPORT.md → Review → Fix → Verify

### `/vibe-deployer` — Docker Deploy Agent
- **File**: `.gemini/skills/vibe-deployer.md`
- **Dùng khi**: Muốn containerize và deploy ứng dụng
- **Cách dùng**: Nói "vibe-deployer [build/deploy/full]"
- **Workflow**: Build → Local Test → Push → Deploy → CI/CD

## Skill Activation

Khi user kích hoạt một skill, hãy:
1. Đọc file skill tương ứng bằng `view_file` với `IsSkillFile: true`
2. Thực hiện theo workflow trong skill file
3. Tuân thủ các checkpoint (⛔ DỪNG) để chờ user review

## Project Info
- **App**: YURI SPA BEAUTY — Website Đặt lịch & Quản lý Dịch vụ Spa
- **Tech Stack**: Next.js 15, TypeScript, Prisma, SQLite, NextAuth.js v5
- **Docs**: `docs/PRD.md`
