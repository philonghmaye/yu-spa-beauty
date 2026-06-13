import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

export const metadata: Metadata = {
  title: 'YURI SPA BEAUTY - Dịch vụ Spa & Làm đẹp chuyên nghiệp',
  description: 'YURI SPA BEAUTY cung cấp dịch vụ làm nail, chăm sóc da, nối mi, gội đầu, massage và các dịch vụ làm đẹp cao cấp. Đặt lịch online nhanh chóng, tiện lợi.',
  keywords: 'spa, làm đẹp, nail, massage, chăm sóc da, nối mi, đặt lịch online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="YURI SPA" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        
        {/* Preconnect & DNS prefetch — giảm latency trên mobile */}
        <link rel="dns-prefetch" href="https://ep-crimson-snow-aocylxna.c-2.ap-southeast-1.aws.neon.tech" />
        <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />

        {/* Open Graph for Facebook/Zalo */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="YURI SPA BEAUTY - Dịch vụ Spa & Làm đẹp chuyên nghiệp" />
        <meta property="og:description" content="Dịch vụ làm nail, chăm sóc da, nối mi, massage. Đặt lịch online nhanh chóng." />
        <meta property="og:image" content="https://yuri-spa-beauty.vercel.app/uploads/banner-beauty.png" />
        <meta property="og:url" content="https://yuri-spa-beauty.vercel.app" />
        <meta property="og:locale" content="vi_VN" />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Yuri Beauty Clinic",
              "alternateName": "YURI SPA BEAUTY",
              "url": "https://yuri-spa-beauty.vercel.app",
              "logo": "https://yuri-spa-beauty.vercel.app/icons/icon-512.png",
              "image": [
                "https://yuri-spa-beauty.vercel.app/uploads/banner-beauty.png",
                "https://yuri-spa-beauty.vercel.app/uploads/banner-booking.png",
                "https://yuri-spa-beauty.vercel.app/uploads/staff-1.png"
              ],
              "description": "Yuri Beauty Clinic - Dịch vụ spa, chăm sóc da, làm nail, nối mi, massage chuyên nghiệp tại TP. Hồ Chí Minh.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "505/TK8/9 Trần Hưng Đạo",
                "addressLocality": "Quận 1",
                "addressRegion": "TP. Hồ Chí Minh",
                "postalCode": "700000",
                "addressCountry": "VN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 10.7553,
                "longitude": 106.6835
              },
              "telephone": "+84-123456789",
              "priceRange": "$$",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "09:00",
                  "closes": "19:00"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "9",
                "bestRating": "5"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Dịch vụ làm đẹp",
                "itemListElement": [
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Chăm sóc da mặt" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Làm móng gel" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nối mi" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Massage body" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gội đầu dưỡng sinh" } }
                ]
              },
              "sameAs": []
            })
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', padding: '12px 20px', fontSize: '0.9rem' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

