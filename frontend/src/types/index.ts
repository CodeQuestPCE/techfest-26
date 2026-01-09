export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: {
    venue: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  bannerImage?: string;
  images?: string[];
  ticketTypes: TicketType[];
  capacity: number;
  registeredCount: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  createdAt: string;
}

export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  available: number;
  description?: string;
}

export interface Registration {
  _id: string;
  event: Event;
  user: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  registeredAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  event: Event;
  user: string;
  qrCode: string;
  ticketType: string;
  price: number;
  status: 'valid' | 'used' | 'cancelled' | 'expired';
  issuedAt: string;
  usedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  role: 'user' | 'organizer' | 'admin' | 'ambassador' | 'coordinator';
  avatar?: string;
  isVerified: boolean;
  referralCode?: string;
  referredBy?: string;
  points?: number;
  createdAt: string;
}
