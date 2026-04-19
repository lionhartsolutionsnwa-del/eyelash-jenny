BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL,
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_availability_day_of_week ON public.availability(day_of_week);

CREATE TABLE IF NOT EXISTS public.break_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_blocked_dates_date ON public.blocked_dates(date);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_id UUID,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  sms_reminders_consent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS sms_reminders_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON public.bookings(date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_phone ON public.bookings(client_phone);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_settings_key ON public.settings(key);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);

INSERT INTO public.services (name, price, duration_minutes, description, sort_order, active)
SELECT v.name, v.price, v.duration_minutes, v.description, v.sort_order, TRUE
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
) AS v(name, price, duration_minutes, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE s.name = v.name
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

INSERT INTO public.settings (key, value)
VALUES
  ('slot_interval_minutes', '30'::jsonb),
  ('buffer_minutes', '15'::jsonb),
  ('timezone', '"America/Chicago"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

COMMIT;
