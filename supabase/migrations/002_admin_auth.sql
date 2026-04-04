-- Jenny Professional Eyelash - Admin Auth Schema
-- Run this in Supabase → SQL Editor → New query → Run
-- This creates: admin_users + admin_sessions tables, RLS policies, and seeds 3 admin accounts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table (phone + hashed password)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin sessions table (token-based sessions)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- admin_users policies
DROP POLICY IF EXISTS "Anyone can read admin_users" ON admin_users;
CREATE POLICY "Anyone can read admin_users" ON admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert admin_users" ON admin_users;
CREATE POLICY "Anyone can insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update admin_users" ON admin_users;
CREATE POLICY "Anyone can update admin_users" ON admin_users FOR UPDATE USING (true);

-- admin_sessions policies
DROP POLICY IF EXISTS "Anyone can manage admin_sessions" ON admin_sessions;
CREATE POLICY "Anyone can manage admin_sessions" ON admin_sessions FOR ALL USING (true);

-- Seed admin users (passwords are pre-hashed with bcrypt cost 10)
-- Jenny: +14793297979, Jenny123!
-- Edison: +18328606170, Edison123!
-- Mo: +14799667198, Mo123!
INSERT INTO admin_users (phone, password_hash, name, role) VALUES
  ('+14793297979', '$2b$10$TCIORWBKWJjlZLqm0j3EJucFPopJ2qUAyqwyKa.iB91gZk/aozPtW', 'Jenny', 'owner'),
  ('+18328606170', '$2b$10$0gMMtPdn6HlXwx.I5ShZX.QsU/vMvQCQRw2XVE8yMauTUjq4fsEIi', 'Edison', 'owner'),
  ('+14799667198', '$2b$10$4DdpviBcX1hLgaBvBn41VuoSB5aK3thaF7zgzCbwJNLxXFvJ9QLZG', 'Mo', 'staff')
ON CONFLICT (phone) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  active = EXCLUDED.active;
