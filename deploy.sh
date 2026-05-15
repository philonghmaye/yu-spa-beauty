#!/bin/bash
echo "🚀 Deploying YURI SPA BEAUTY..."

cd /var/www/yu-spa-beauty

# Pull code mới
git pull origin main

# Cài dependencies mới (nếu có)
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Restart
pm2 restart yuri-spa

echo "✅ Deploy complete!"
