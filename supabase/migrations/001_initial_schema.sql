-- Jenny Professional Eyelash - Initial Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Services
CREATE TABLE services (
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

-- Availability (weekly schedule)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_day_of_week UNIQUE (day_of_week)
);

-- Break times
CREATE TABLE break_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked dates (holidays, vacations, etc.)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  service_type TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_bookings_date_status ON bookings(date, status);
CREATE INDEX idx_bookings_client_phone ON bookings(client_phone);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Double-booking prevention
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE date = NEW.date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Time slot overlaps with an existing booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_booking
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Public can read availability"
  ON availability FOR SELECT
  USING (true);

CREATE POLICY "Public can read break times"
  ON break_times FOR SELECT
  USING (true);

CREATE POLICY "Public can read blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT
  USING (true);

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

-- Public insert for bookings
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Authenticated full access
CREATE POLICY "Authenticated users have full access to services"
  ON services FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to availability"
  ON availability FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to break_times"
  ON break_times FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to blocked_dates"
  ON blocked_dates FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Services
INSERT INTO services (name, price, duration_minutes, description, sort_order) VALUES
  ('Classic Lashes', 119.00, 120, 'Individual lash extensions applied one-by-one for a natural, elegant look.', 1),
  ('Hybrid Lashes', 149.00, 150, 'A mix of classic and volume techniques for a fuller, textured finish.', 2),
  ('Lash Removal', 25.00, 30, 'Safe and gentle removal of existing lash extensions.', 3);

-- Availability (0=Sunday, 1=Monday, ..., 6=Saturday)
INSERT INTO availability (day_of_week, start_time, end_time, is_active) VALUES
  (0, '09:00', '17:00', FALSE),  -- Sunday off
  (1, '09:00', '17:00', FALSE),  -- Monday off
  (2, '09:00', '18:00', TRUE),   -- Tuesday
  (3, '09:00', '18:00', TRUE),   -- Wednesday
  (4, '09:00', '18:00', TRUE),   -- Thursday
  (5, '09:00', '18:00', TRUE),   -- Friday
  (6, '10:00', '16:00', TRUE);   -- Saturday

-- Break times (lunch for working days)
INSERT INTO break_times (day_of_week, start_time, end_time, label) VALUES
  (2, '12:30', '13:30', 'Lunch Break'),
  (3, '12:30', '13:30', 'Lunch Break'),
  (4, '12:30', '13:30', 'Lunch Break'),
  (5, '12:30', '13:30', 'Lunch Break'),
  (6, '12:30', '13:30', 'Lunch Break');

-- Testimonials
INSERT INTO testimonials (client_name, rating, content, service_type, is_featured) VALUES
  ('Sarah M.', 5, 'Jenny is absolutely amazing! My classic lashes look so natural and beautiful. I get compliments everywhere I go. She takes her time and makes sure everything is perfect.', 'Classic Lashes', TRUE),
  ('Emily R.', 5, 'Best lash artist in town! The hybrid set she did for me is stunning. Very clean work and the salon is so relaxing. Will never go anywhere else!', 'Hybrid Lashes', TRUE),
  ('Jessica L.', 5, 'I was nervous about getting lash extensions for the first time, but Jenny made me feel so comfortable. She explained everything and the results exceeded my expectations.', 'Classic Lashes', TRUE),
  ('Amanda K.', 4, 'Great experience from booking to the actual appointment. Jenny is professional, skilled, and genuinely cares about her clients. My lashes lasted beautifully for weeks.', 'Hybrid Lashes', FALSE);

-- Settings
INSERT INTO settings (key, value) VALUES
  ('business_name', '"Jenny Professional Eyelash"'),
  ('business_phone', '"(555) 123-4567"'),
  ('slot_interval_minutes', '30'),
  ('buffer_between_bookings_minutes', '15'),
  ('sms_notifications_enabled', 'true'),
  ('timezone', '"America/Los_Angeles"');
