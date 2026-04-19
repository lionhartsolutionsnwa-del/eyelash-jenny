-- Backfill appointments contact fields for automation workflows.
-- Keeps backward compatibility with existing n8n nodes that read client_phone.

BEGIN;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS client_email TEXT;

-- manager_phones: mirror client_phone when client_phone contains multiple manager recipients.
UPDATE public.appointments
SET manager_phones = client_phone
WHERE manager_phones IS NULL
  AND client_phone LIKE '%,%';

-- customer_phone/customer_email/client_email from bookings link.
UPDATE public.appointments a
SET
  customer_phone = COALESCE(a.customer_phone, b.client_phone),
  customer_email = COALESCE(a.customer_email, b.client_email),
  client_email = COALESCE(a.client_email, b.client_email)
FROM public.bookings b
WHERE a.booking_id = b.id;

-- For legacy rows where client_phone held a single customer number, preserve that.
UPDATE public.appointments
SET customer_phone = client_phone
WHERE customer_phone IS NULL
  AND client_phone NOT LIKE '%,%';

COMMIT;
