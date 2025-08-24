-- Fix malformed photos data in trip_days table
-- This will clean up any empty strings or malformed array data

-- First, let's see what's in the photos column to understand the issue
SELECT id, trip_id, day_number, photos, photos::text as photos_as_text FROM trip_days WHERE photos IS NOT NULL;

-- The correct way to fix malformed array data in PostgreSQL:

-- Option 1: Set all photos to NULL (recommended for now since we disabled photos)
UPDATE trip_days SET photos = NULL;

-- Option 2: If you want to keep photos but fix malformed ones, use this instead:
-- UPDATE trip_days 
-- SET photos = '{}'::text[]
-- WHERE photos IS NOT NULL;

-- Verify the fix
SELECT id, trip_id, day_number, photos FROM trip_days WHERE photos IS NOT NULL;
