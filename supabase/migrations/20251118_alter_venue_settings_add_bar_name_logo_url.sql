BEGIN;

ALTER TABLE public.venue_settings
ADD COLUMN IF NOT EXISTS bar_name text,
ADD COLUMN IF NOT EXISTS logo_url text;

-- Initialize defaults on the default row
UPDATE public.venue_settings
SET bar_name = COALESCE(bar_name, NULL),
    logo_url = COALESCE(logo_url, NULL)
WHERE id = 'default';

COMMIT;