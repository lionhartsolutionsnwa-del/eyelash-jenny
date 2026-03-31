import type { BookingStatus } from '@/types';

export const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
];

export const SERVICE_DURATIONS: Record<string, number> = {
  'Classic Lashes': 120,
  'Hybrid Lashes': 150,
  'Lash Removal': 30,
};

export const DEFAULT_SLOT_INTERVAL = 30; // minutes

export const DEFAULT_BUFFER_MINUTES = 15; // buffer between bookings

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Book Now', href: '/book' },
  { label: 'Contact', href: '/#contact' },
] as const;

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/jennyprofessionaleyelash',
  facebook: 'https://facebook.com/jennyprofessionaleyelash',
  yelp: 'https://yelp.com/biz/jenny-professional-eyelash',
} as const;
