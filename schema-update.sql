-- Add r2_file_key column to images table if it doesn't exist
ALTER TABLE images ADD COLUMN IF NOT EXISTS r2_file_key TEXT;
