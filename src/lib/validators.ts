// Jenny Professional Eyelash - Input Validators (Zod 4)
// ======================================================

import { z } from 'zod';

// ---- Booking ----

export const bookingSchema = z.object({
  client_name: z.string().min(2, 'Name must be at least 2 characters'),
  client_phone: z
    .string()
    .regex(
      /^\+?[\d\s\-().]{7,20}$/,
      'Please enter a valid phone number'
    ),
  client_email: z.string().email('Invalid email address').optional(),
  service_id: z.enum(['classic', 'hybrid', 'volume', 'wispy', 'classic-fill', 'hybrid-fill', 'volume-fill', 'lash-removal'], {
    message: 'Invalid service selected',
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
    .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
      message: 'Appointment date must be today or in the future',
    }),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS format'),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ---- Service ----

export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  duration_minutes: z.number().int().min(15, 'Duration must be at least 15 minutes'),
  description: z.string().optional(),
  active: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ---- Availability ----

export const availabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  is_active: z.boolean(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
