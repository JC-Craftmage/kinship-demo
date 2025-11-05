-- Migration: Add location fields to campuses table
-- Version: 002
-- Description: Add latitude, longitude, and zip_code for location-based search

-- Add location columns to campuses table
ALTER TABLE campuses
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Create index for location queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_campuses_location ON campuses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_campuses_zip ON campuses(zip_code);

-- Note: If you want to use PostGIS for advanced geospatial queries:
-- 1. Enable PostGIS extension:
--    CREATE EXTENSION IF NOT EXISTS postgis;
-- 2. Add geometry column:
--    ALTER TABLE campuses ADD COLUMN IF NOT EXISTS geog geography(POINT, 4326);
-- 3. Create spatial index:
--    CREATE INDEX IF NOT EXISTS idx_campuses_geog ON campuses USING GIST(geog);
-- 4. Populate from lat/long:
--    UPDATE campuses SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE latitude IS NOT NULL;
