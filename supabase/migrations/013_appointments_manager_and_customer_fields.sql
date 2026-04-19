-- Extend appointments payload for n8n + email workflows.
-- Keep client_phone as manager recipients (backward compatible for existing n8n nodes),
-- and add explicit customer fields for downstream email/CRM steps.

BEGIN;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS manager_phones TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- If rows were already written with comma-separated manager phones in client_phone,
-- copy those values into manager_phones.
UPDATE public.appointments
SET manager_phones = client_phone
WHERE manager_phones IS NULL
  AND client_phone LIKE '%,%';

-- Backfill customer details from bookings when possible.
UPDATE public.appointments a
SET
  customer_phone = b.client_phone,
  customer_email = b.client_email
FROM public.bookings b
WHERE a.booking_id = b.id
  AND (a.customer_phone IS NULL OR a.customer_email IS NULL);

-- For older rows where client_phone is a single value (legacy behavior),
-- preserve it as customer_phone.
UPDATE public.appointments
SET customer_phone = client_phone
WHERE customer_phone IS NULL
  AND client_phone NOT LIKE '%,%';

COMMIT;
