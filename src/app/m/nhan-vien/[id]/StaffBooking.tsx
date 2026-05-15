'use client';

import { useRouter } from 'next/navigation';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  category: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function StaffBooking({
  staffId, staffName, staffAvatar, staffRating, staffReviewCount, services,
}: {
  staffId: string;
  staffName: string;
  staffAvatar: string | null;
  staffRating: number;
  staffReviewCount: number;
  services: ServiceItem[];
}) {
  const router = useRouter();

  // Group services by category
  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const handleBook = (service: ServiceItem) => {
    // Store booking data in sessionStorage for the booking page
    const bookingData = {
      staffId,
      staffName,
      staffAvatar,
      staffRating,
      staffReviewCount,
      service: {
        id: service.id,
        name: service.name,
        price: service.discountPrice || service.price,
        duration: service.duration,
      },
    };
    sessionStorage.setItem('mobileBooking', JSON.stringify(bookingData));
    router.push('/m/dat-lich');
  };

  return (
    <div className="m-service-section">
      <h2>Dịch vụ của tôi</h2>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          {items.map((service) => (
            <div key={service.id} className="m-service-item">
              <div className="m-service-item-name">{service.name}</div>
              <div className="m-duration-chips">
                <span className="m-duration-chip active">{service.duration} phút</span>
              </div>
              <div className="m-service-item-bottom">
                <span className="m-service-price">
                  {service.discountPrice ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', fontSize: '0.85rem', marginRight: 6 }}>
                        {formatCurrency(service.price)}
                      </span>
                      {formatCurrency(service.discountPrice)}
                    </>
                  ) : (
                    formatCurrency(service.price)
                  )}
                </span>
                <button className="m-btn-book" onClick={() => handleBook(service)}>Đặt</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
