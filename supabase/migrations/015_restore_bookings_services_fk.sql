BEGIN;

-- Clean up any orphaned references so the FK can be added safely.
UPDATE public.bookings AS b
SET service_id = NULL
WHERE b.service_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.services AS s
    WHERE s.id = b.service_id
  );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_service_id_fkey
  FOREIGN KEY (service_id)
  REFERENCES public.services(id)
  ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_bookings_service_id
  ON public.bookings(service_id);

COMMIT;
