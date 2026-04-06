-- Migration 007: Update service catalog
-- Removes Lash Lift, Lash Lift + Tint, Mega Volume Lashes;
-- Updates durations for Classic/Hybrid/Volume;
-- Renames Lash Removal to Lash Removal + New Set with new pricing.

-- Deactivate removed services (preserve referential integrity with existing bookings)
UPDATE services SET active = FALSE WHERE name IN ('Lash Lift', 'Lash Lift + Tint', 'Mega Volume Lashes');

-- Update Classic Lashes: 1 hr
UPDATE services SET duration_minutes = 60  WHERE name = 'Classic Lashes';

-- Update Hybrid Lashes: 1 hr 20 min
UPDATE services SET duration_minutes = 80  WHERE name = 'Hybrid Lashes';

-- Update Volume Lashes: 1 hr 40 min
UPDATE services SET duration_minutes = 100 WHERE name = 'Volume Lashes';

-- Update Lash Removal: rename, new price, new duration
UPDATE services SET
  name             = 'Lash Removal + New Set',
  price            = 159.00,
  duration_minutes = 90,
  description      = 'Gentle removal of existing extensions followed by a fresh new set. Pricing depends on the type of extensions selected.',
  sort_order       = 11
WHERE name = 'Lash Removal';
