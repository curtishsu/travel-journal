-- Check the current data type of notable_things column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trip_days' 
AND column_name = 'notable_things';

-- If notable_things is currently TEXT[] (array), we need to change it to TEXT (string)
-- First, let's see what data is currently in the column
SELECT id, trip_id, day_number, notable_things, notable_things::text as notable_things_as_text 
FROM trip_days 
WHERE notable_things IS NOT NULL;

-- Fix the column type if it's currently an array
-- WARNING: This will convert any existing array data to strings
ALTER TABLE trip_days 
ALTER COLUMN notable_things TYPE TEXT 
USING CASE 
  WHEN notable_things IS NULL THEN NULL
  ELSE notable_things::text
END;

-- Verify the fix
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trip_days' 
AND column_name = 'notable_things';
