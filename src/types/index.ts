// Jenny Professional Eyelash - TypeScript Types
// ================================================

export interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;  // HH:MM:SS
  end_time: string;    // HH:MM:SS
  is_active: boolean;
  created_at: string;
}

export interface BreakTime {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string | null;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string | null;
  created_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  service_id: string;
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
  status: BookingStatus;
  notes: string | null;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  rating: number; // 1-5
  content: string;
  service_type: string | null;
  is_featured: boolean;
  active: boolean;
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown; // JSONB can be any valid JSON
  updated_at: string;
}

// Booking wizard form data
export interface BookingFormData {
  service_id: string;
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:MM
  client_name: string;
  client_phone: string;
  client_email?: string;
  notes?: string;
}

// Available time slot for the booking calendar
export interface AvailableSlot {
  time: string;       // HH:MM format
  available: boolean;
}
