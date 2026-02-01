-- ============================================================================
-- Migration: 001_create_requests.sql
-- Description: Creates the requests table for LST Travel Backoffice System
--              Supports manual-first workflow with optional OCR
-- ============================================================================

-- Enable UUID extension if not already enabled (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: requests
-- Purpose: Main table storing travel request information with extracted
--          passenger and document data (text fields only, no file storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS requests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Passenger Information (manually entered or OCR-extracted)
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  
  -- Passport / Document Information (manually entered or OCR-extracted)
  passport_number TEXT,
  
  -- Travel Information
  departure_airport TEXT,
  destination_airport TEXT,
  travel_date DATE,
  return_date DATE,
  
  -- Request Types (multi-select as JSONB array)
  -- Valid values: ["flight"], ["visa"], ["flight", "visa"], ["package"], ["other"], etc.
  request_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- System Fields
  status TEXT NOT NULL DEFAULT 'draft',
  -- Status values: 'draft' (created but not submitted), 'submitted', 'cancelled'
  
  is_demo BOOLEAN NOT NULL DEFAULT false,
  -- Flag for demo/test data (can be removed at any time)
  
  -- OCR Metadata (optional - NULL if manual-only entry)
  ocr_source TEXT,
  -- Source of OCR extraction (e.g., 'tesseract', 'azure-vision', 'google-vision')
  -- NULL if data was entered manually without OCR
  
  ocr_confidence DECIMAL(5,2),
  -- OCR confidence score (0.00 to 100.00)
  -- NULL if data was entered manually without OCR
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- Purpose: Optimize common query patterns
-- ============================================================================

-- Index for filtering by status (draft, submitted, cancelled)
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Index for ordering by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Partial index for demo data (efficient filtering and removal of demo records)
CREATE INDEX IF NOT EXISTS idx_requests_is_demo ON requests(is_demo) WHERE is_demo = true;

-- GIN index for JSONB request_types array queries
-- Allows efficient queries like: WHERE request_types @> '["flight"]'::jsonb
CREATE INDEX IF NOT EXISTS idx_requests_request_types ON requests USING GIN(request_types);

-- ============================================================================
-- COMMENTS
-- Purpose: Document table and key columns for future reference
-- ============================================================================

COMMENT ON TABLE requests IS 'Main table for travel requests. Stores only extracted/entered text fields. No file storage.';
COMMENT ON COLUMN requests.id IS 'Unique request identifier (UUID)';
COMMENT ON COLUMN requests.request_types IS 'JSONB array of request types: ["flight", "visa", "package", "other"]';
COMMENT ON COLUMN requests.status IS 'Request status: draft (created but not submitted), submitted, cancelled';
COMMENT ON COLUMN requests.is_demo IS 'Flag for demo/test data. Demo data can be removed at any time.';
COMMENT ON COLUMN requests.ocr_source IS 'OCR service used (NULL if manual-only entry)';
COMMENT ON COLUMN requests.ocr_confidence IS 'OCR confidence score 0.00-100.00 (NULL if manual-only entry)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
