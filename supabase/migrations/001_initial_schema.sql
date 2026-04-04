-- Jenny Professional Eyelash - Initial Database Schema
-- Run this in Supabase → SQL Editor → New query → Run

-- Set timezone to America/Chicago (covers CST/CDT for Jenny's location)
SET TIME ZONE 'America/Chicago';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

DROP TYPE IF EXISTS booking_status;
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

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS break_times CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS services CASCADE;

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
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (true);
CREATE POLICY "Public can read availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Public can read break times" ON break_times FOR SELECT USING (true);
CREATE POLICY "Public can read blocked dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Public can read active testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);

-- Public insert for bookings
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Authenticated full access
CREATE POLICY "Authenticated users have full access to services" ON services FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to availability" ON availability FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to break_times" ON break_times FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to blocked_dates" ON blocked_dates FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Services
INSERT INTO services (name, price, duration_minutes, description, sort_order) VALUES
  ('Classic Lashes', 119.00, 120, 'Individual lash extensions applied one-by-one for a natural, elegant look.', 1),
  ('Hybrid Lashes', 149.00, 150, 'A mix of classic and volume techniques for a fuller, textured finish.', 2),
  ('Lash Removal', 25.00, 30, 'Safe and gentle removal of existing lash extensions.', 3);

-- Availability (0=Sunday, 1=Monday, ..., 6=Saturday)
-- Closed Sun & Mon, open Tue-Sat
INSERT INTO availability (day_of_week, start_time, end_time, is_active) VALUES
  (0, '09:00'::time, '17:00'::time, FALSE),  -- Sunday closed
  (1, '09:00'::time, '17:00'::time, FALSE),  -- Monday closed
  (2, '09:00'::time, '18:00'::time, TRUE),   -- Tuesday
  (3, '09:00'::time, '18:00'::time, TRUE),   -- Wednesday
  (4, '09:00'::time, '18:00'::time, TRUE),   -- Thursday
  (5, '09:00'::time, '18:00'::time, TRUE),   -- Friday
  (6, '10:00'::time, '16:00'::time, TRUE);   -- Saturday

-- Break times (lunch for working days)
INSERT INTO break_times (day_of_week, start_time, end_time, label) VALUES
  (2, '12:30'::time, '13:30'::time, 'Lunch Break'),
  (3, '12:30'::time, '13:30'::time, 'Lunch Break'),
  (4, '12:30'::time, '13:30'::time, 'Lunch Break'),
  (5, '12:30'::time, '13:30'::time, 'Lunch Break'),
  (6, '12:30'::time, '13:30'::time, 'Lunch Break');

-- Testimonials
INSERT INTO testimonials (client_name, rating, content, service_type, is_featured) VALUES
  ('Sarah M.', 5, 'Jenny is absolutely amazing! My classic lashes look so natural and beautiful. I get compliments everywhere I go. She takes her time and makes sure everything is perfect.', 'Classic Lashes', TRUE),
  ('Emily R.', 5, 'Best lash artist in town! The hybrid set she did for me is stunning. Very clean work and the salon is so relaxing. Will never go anywhere else!', 'Hybrid Lashes', TRUE),
  ('Jessica L.', 5, 'I was nervous about getting lash extensions for the first time, but Jenny made me feel so comfortable. She explained everything and the results exceeded my expectations.', 'Classic Lashes', TRUE),
  ('Amanda K.', 4, 'Great experience from booking to the actual appointment. Jenny is professional, skilled, and genuinely cares about her clients. My lashes lasted beautifully for weeks.', 'Hybrid Lashes', FALSE);

-- Settings (using jsonb with numeric values for correct type handling)
INSERT INTO settings (key, value) VALUES
  ('business_name', '"Jenny Professional Eyelash"'::jsonb),
  ('business_phone', '"(555) 123-4567"'::jsonb),
  ('slot_interval_minutes', '30'::jsonb),
  ('buffer_minutes', '15'::jsonb),
  ('sms_notifications_enabled', 'false'::jsonb),
  ('timezone', '"America/Chicago"'::jsonb);
