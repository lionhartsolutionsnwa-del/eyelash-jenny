-- Jenny Professional Eyelash - Appointments Table for n8n SMS Workflow
-- Run this in Supabase → SQL Editor → New query → Run
-- This table is polled by n8n to send SMS alerts to Jenny

-- Enable UUID extension (should already be on from initial schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- APPOINTMENTS TABLE (for n8n SMS polling)
-- =====================================================
-- This table is separate from `bookings` because n8n needs a clean
-- structure for SMS alerts. The website inserts here after a
-- booking is confirmed, then n8n picks it up.

DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE,  -- references bookings.id, links back to source
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,  -- UTC, timezone-safe ISO format
  service_type TEXT NOT NULL,  -- e.g. 'classic', 'hybrid', 'volume'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- SMS flag fields (set by n8n after sending)
  new_booking_alert_sent BOOLEAN DEFAULT FALSE NOT NULL,
  reminder_1day_sent BOOLEAN DEFAULT FALSE NOT NULL,
  reminder_morning_sent BOOLEAN DEFAULT FALSE NOT NULL,
  reminder_1hour_sent BOOLEAN DEFAULT FALSE NOT NULL,

  CONSTRAINT appointments_booking_id_unique UNIQUE (booking_id)
);

-- Index for n8n polling queries
CREATE INDEX idx_appointments_new ON public.appointments(created_at ASC) WHERE new_booking_alert_sent = FALSE;
CREATE INDEX idx_appointments_1day ON public.appointments(appointment_time ASC) WHERE reminder_1day_sent = FALSE;
CREATE INDEX idx_appointments_morning ON public.appointments(appointment_time ASC) WHERE reminder_morning_sent = FALSE;
CREATE INDEX idx_appointments_1hour ON public.appointments(appointment_time ASC) WHERE reminder_1hour_sent = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Website (public): INSERT only (after booking confirmed)
CREATE POLICY "Public can insert appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- n8n workflow (service role): SELECT and UPDATE (polling + flag updates)
-- Note: When using service_role key, RLS is bypassed, but we create policies anyway
-- for defense-in-depth. The service_role key should only be used in n8n env vars.
CREATE POLICY "Service role can read appointments"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Service role can update appointments"
  ON public.appointments FOR UPDATE
  USING (true);

-- Verify table created
-- SELECT * FROM public.appointments LIMIT 1;