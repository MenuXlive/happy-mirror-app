BEGIN;

ALTER TABLE public.venue_settings
ADD COLUMN IF NOT EXISTS show_map_embed boolean NOT NULL DEFAULT false;

UPDATE public.venue_settings
SET show_map_embed = COALESCE(show_map_embed, false)
WHERE id = 'default';

COMMIT;