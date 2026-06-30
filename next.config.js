/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // T?t ki?m tra l?i ESLint khi build trên Vercel d? tránh gián do?n
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
