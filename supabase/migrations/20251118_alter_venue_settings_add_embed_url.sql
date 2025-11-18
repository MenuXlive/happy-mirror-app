BEGIN;

ALTER TABLE public.venue_settings
ADD COLUMN IF NOT EXISTS embed_url text;

-- Initialize default row
UPDATE public.venue_settings
SET embed_url = COALESCE(embed_url, NULL)
WHERE id = 'default';

COMMIT;