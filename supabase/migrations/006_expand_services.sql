-- Migration 006: Expand services catalog
-- Adds Volume, Mega Volume, Wispy full sets; Classic/Hybrid/Volume fills;
-- Lash Lift treatment; updates existing service descriptions and prices.

-- Update existing services
UPDATE services SET
  description = 'Individual lash extensions applied one-by-one for a natural, elegant look.',
  sort_order = 1
WHERE name = 'Classic Lashes';

UPDATE services SET
  description = 'A mix of classic and volume techniques for a fuller, textured finish.',
  sort_order = 2
WHERE name = 'Hybrid Lashes';

UPDATE services SET
  price = 35.00,
  description = 'Safe and gentle removal of existing lash extensions.',
  sort_order = 11
WHERE name = 'Lash Removal';

-- Insert new services (skip if already present)
INSERT INTO services (name, price, duration_minutes, description, sort_order, active)
SELECT name, price, duration_minutes, description, sort_order, TRUE
FROM (VALUES
  ('Volume Lashes',      189.00, 150, 'Lush 3D–6D fans for a full, fluffy, camera-ready look.',                         3),
  ('Mega Volume Lashes', 239.00, 180, 'Ultra-dramatic 6D–16D fans for maximum fullness and impact.',                    4),
  ('Wispy Lashes',       169.00, 150, 'Spiked, textured fans blending classics and volume for a trendy editorial look.',5),
  ('Classic Fill',        75.00,  60, 'Refresh your classic set. Best scheduled within 2–3 weeks of your last visit.',  6),
  ('Hybrid Fill',         95.00,  75, 'Refresh your hybrid set. Best scheduled within 2–3 weeks of your last visit.',   7),
  ('Volume Fill',        115.00,  75, 'Refresh your volume set. Best scheduled within 2–3 weeks of your last visit.',   8),
  ('Lash Lift',           85.00,  60, 'Lift and curl your natural lashes with a semi-permanent perm — no extensions.',  9),
  ('Lash Lift + Tint',   115.00,  75, 'Curl and darken your natural lashes for a mascara-free, wide-awake look.',       10)
) AS new_services(name, price, duration_minutes, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.name = new_services.name
);
