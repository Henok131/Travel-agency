-- ============================================================================
-- Migration: 005_add_airlines_column.sql
-- Description: Adds airlines column to main_table
-- ============================================================================

-- Add airlines column to main_table
ALTER TABLE main_table
ADD COLUMN IF NOT EXISTS airlines TEXT;

-- Add comment
COMMENT ON COLUMN main_table.airlines IS 'Airline name or code';

-- ============================================================================
-- Migration Complete
-- ============================================================================
