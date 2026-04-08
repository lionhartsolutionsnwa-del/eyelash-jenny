-- Jenny Professional Eyelash - Add Admin 4793297979
-- Run this in Supabase → SQL Editor → New query → Run
-- Phone: 4793297979, Password: Jenny123!

INSERT INTO admin_users (phone, password_hash, name, role) VALUES
  ('4793297979', '$2b$10$R14gFJYCtkySnnAi35D7ruQe./uBhm/ZBIPtR0S4vs5Z.C09IRv8C', 'NewAdmin', 'employee')
ON CONFLICT (phone) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  active = EXCLUDED.active;