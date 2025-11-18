-- Alter venue_settings to add contact and hours fields
BEGIN;

ALTER TABLE public.venue_settings
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS hours text,
  ADD COLUMN IF NOT EXISTS google_maps_url text;

-- Ensure default row has these columns initialized (noop if row doesn't exist)
UPDATE public.venue_settings
SET phone = COALESCE(phone, NULL),
    email = COALESCE(email, NULL),
    hours = COALESCE(hours, NULL),
    google_maps_url = COALESCE(google_maps_url, NULL)
WHERE id = 'default';

COMMIT;