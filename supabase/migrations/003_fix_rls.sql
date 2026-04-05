-- Jenny Professional Eyelash - RLS Fix Migration
-- Run this in Supabase → SQL Editor → New query → Run
-- Fixes: ensures public can INSERT bookings (required for public booking form)

-- Re-create the public insert policy for bookings (idempotent - drops first if exists)
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Also ensure the bookings table has RLS enabled (should already be on, but just in case)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Verify: this should return the policy we just created
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bookings';
