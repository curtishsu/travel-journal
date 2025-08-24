-- Add reflection fields to trips table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS final_reflection TEXT,
ADD COLUMN IF NOT EXISTS what_to_do_next_time TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Drop and recreate photos column with proper default
ALTER TABLE trip_days DROP COLUMN IF EXISTS photos;
ALTER TABLE trip_days ADD COLUMN photos TEXT[] DEFAULT '{}'::TEXT[];

-- The trip_type column should already exist, but if it doesn't:
-- ALTER TABLE trips ADD COLUMN IF NOT EXISTS trip_type TEXT[];
