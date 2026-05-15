// Type augmentations for NextAuth
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    role: string;
  }
}

// JWT type augmentation for next-auth v5
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NextAuthJWT {
  role: string;
  id: string;
}

// App types
export interface ServiceType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  image: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  services: ServiceType[];
}

export interface EmployeeType {
  id: string;
  position: string | null;
  bio: string | null;
  user: { name: string; avatar: string | null };
  skills: { service: { id: string; name: string } }[];
}

export interface AppointmentType {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customerNote: string | null;
  staffNote: string | null;
  totalAmount: number;
  finalAmount: number;
  customer: { id: string; user: { name: string; phone: string | null } };
  employee: { id: string; user: { name: string } } | null;
  services: { service: { name: string; price: number; duration: number } }[];
}

export interface TimeSlotType {
  time: string;
  available: boolean;
}
