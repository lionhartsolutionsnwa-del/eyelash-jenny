-- Add SMS consent fields to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS sms_reminders_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_marketing_consent BOOLEAN NOT NULL DEFAULT false;
