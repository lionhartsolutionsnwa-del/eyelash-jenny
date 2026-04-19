-- Restore booking-related schema after accidental table loss.
-- Safe to run on production: uses CREATE/ALTER IF NOT EXISTS and avoids DROP TABLE.
-- Does not modify admin_users or appointments.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM (
      'pending',
      'confirmed',
      'cancelled',
      'completed',
      'no_show'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_day_of_week'
      AND conrelid = 'public.availability'::regclass
  ) THEN
    ALTER TABLE public.availability
      ADD CONSTRAINT unique_day_of_week UNIQUE (day_of_week);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.break_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.break_times
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blocked_dates
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blocked_dates_date_key'
      AND conrelid = 'public.blocked_dates'::regclass
  ) THEN
    ALTER TABLE public.blocked_dates
      ADD CONSTRAINT blocked_dates_date_key UNIQUE (date);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  sms_reminders_consent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS service_id UUID,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS status booking_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_reminders_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_service_id_fkey'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_service_id_fkey
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  service_type TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS rating INTEGER,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS key TEXT,
  ADD COLUMN IF NOT EXISTS value JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'settings_pkey'
      AND conrelid = 'public.settings'::regclass
  ) THEN
    ALTER TABLE public.settings
      ADD CONSTRAINT settings_pkey PRIMARY KEY (key);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON public.bookings(date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_phone ON public.bookings(client_phone);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read availability" ON public.availability;
CREATE POLICY "Public can read availability" ON public.availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read break times" ON public.break_times;
CREATE POLICY "Public can read break times" ON public.break_times FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can read blocked dates" ON public.blocked_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read active testimonials" ON public.testimonials;
CREATE POLICY "Public can read active testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to services" ON public.services;
CREATE POLICY "Authenticated users have full access to services" ON public.services
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to availability" ON public.availability;
CREATE POLICY "Authenticated users have full access to availability" ON public.availability
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to break_times" ON public.break_times;
CREATE POLICY "Authenticated users have full access to break_times" ON public.break_times
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to blocked_dates" ON public.blocked_dates;
CREATE POLICY "Authenticated users have full access to blocked_dates" ON public.blocked_dates
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to bookings" ON public.bookings;
CREATE POLICY "Authenticated users have full access to bookings" ON public.bookings
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users have full access to testimonials" ON public.testimonials
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to settings" ON public.settings;
CREATE POLICY "Authenticated users have full access to settings" ON public.settings
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.services (name, price, duration_minutes, description, sort_order, active)
SELECT t.name, t.price, t.duration_minutes, t.description, t.sort_order, TRUE
FROM (
  VALUES
    ('Classic Lashes', 119.00, 60, 'Individual lash extensions applied one-by-one for a natural, elegant look.', 1),
    ('Hybrid Lashes', 149.00, 80, 'A mix of classic and volume techniques for a fuller, textured finish.', 2),
    ('Volume Lashes', 189.00, 100, 'Lush 3D-6D fans for a full, fluffy, camera-ready look.', 3),
    ('Wispy Lashes', 169.00, 120, 'Spiked, textured fans blending classics and volume for a trendy editorial look.', 4),
    ('Classic Fill', 75.00, 60, 'Refresh your classic set. Best scheduled within 2-3 weeks of your last visit.', 5),
    ('Hybrid Fill', 95.00, 75, 'Refresh your hybrid set. Best scheduled within 2-3 weeks of your last visit.', 6),
    ('Volume Fill', 115.00, 75, 'Refresh your volume set. Best scheduled within 2-3 weeks of your last visit.', 7),
    ('Lash Removal + New Set', 159.00, 90, 'Gentle removal of existing extensions followed by a fresh new set.', 8),
    ('Add 20 Lash Extensions', 20.00, 15, 'Add 20 extra lash extensions to your service.', 9)
) AS t(name, price, duration_minutes, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE s.name = t.name
);

INSERT INTO public.availability (day_of_week, start_time, end_time, is_active)
VALUES
  (0, '09:00'::time, '17:00'::time, FALSE),
  (1, '09:00'::time, '17:00'::time, FALSE),
  (2, '09:00'::time, '18:00'::time, TRUE),
  (3, '09:00'::time, '18:00'::time, TRUE),
  (4, '09:00'::time, '18:00'::time, TRUE),
  (5, '09:00'::time, '18:00'::time, TRUE),
  (6, '10:00'::time, '16:00'::time, TRUE)
ON CONFLICT (day_of_week) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  is_active = EXCLUDED.is_active;

INSERT INTO public.break_times (day_of_week, start_time, end_time, label)
SELECT t.day_of_week, t.start_time, t.end_time, t.label
FROM (
  VALUES
    (2, '12:30'::time, '13:30'::time, 'Lunch Break'),
    (3, '12:30'::time, '13:30'::time, 'Lunch Break'),
    (4, '12:30'::time, '13:30'::time, 'Lunch Break'),
    (5, '12:30'::time, '13:30'::time, 'Lunch Break'),
    (6, '12:30'::time, '13:30'::time, 'Lunch Break')
) AS t(day_of_week, start_time, end_time, label)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.break_times b
  WHERE b.day_of_week = t.day_of_week
    AND b.start_time = t.start_time
    AND b.end_time = t.end_time
);

INSERT INTO public.settings (key, value)
VALUES
  ('business_name', '"Jenny Professional Eyelash"'::jsonb),
  ('business_phone', '"(555) 123-4567"'::jsonb),
  ('slot_interval_minutes', '30'::jsonb),
  ('buffer_minutes', '15'::jsonb),
  ('sms_notifications_enabled', 'false'::jsonb),
  ('timezone', '"America/Chicago"'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;
