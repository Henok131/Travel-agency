-- ============================================================================
-- Migration: 002_create_main_table.sql
-- Description: Creates the main_table (bookings_main) table for LST Travel
--              Reuses exact structure from requests table + adds business columns
-- ============================================================================

-- Enable UUID extension if not already enabled (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: main_table
-- Purpose: Main table storing booking information with financial/business data
--          Base structure matches requests table exactly, plus business columns
-- ============================================================================

CREATE TABLE IF NOT EXISTS main_table (
  -- Primary Key (reused from requests)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Passenger Information (reused exactly from requests)
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  
  -- Passport / Document Information (reused exactly from requests)
  passport_number TEXT,
  
  -- Travel Information (reused exactly from requests)
  departure_airport TEXT,
  destination_airport TEXT,
  travel_date DATE,
  return_date DATE,
  
  -- Request Types (reused exactly from requests)
  request_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- System Fields (reused exactly from requests)
  status TEXT NOT NULL DEFAULT 'draft',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  
  -- OCR Metadata (reused exactly from requests)
  ocr_source TEXT,
  ocr_confidence DECIMAL(5,2),
  
  -- Timestamps (reused exactly from requests)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- ============================================================================
  -- NEW BUSINESS / FINANCIAL COLUMNS (ADDED ONLY)
  -- ============================================================================
  
  -- Business / Financial Columns
  booking_ref TEXT,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Payment / Accounting Columns
  print_invoice BOOLEAN NOT NULL DEFAULT false,
  bank_transfer BOOLEAN NOT NULL DEFAULT false,
  cash_paid BOOLEAN NOT NULL DEFAULT false,
  
  -- Financial Amounts (NUMERIC / DECIMAL)
  lst_loan_fee NUMERIC(10,2),
  airlines_price NUMERIC(10,2),
  lst_profit NUMERIC(10,2),
  commission_from_airlines NUMERIC(10,2),
  visa_fee NUMERIC(10,2),
  cash_paid_to_lst_account NUMERIC(10,2),
  profit NUMERIC(10,2),
  
  -- Additional
  notice TEXT
);

-- ============================================================================
-- INDEXES (reused pattern from requests table)
-- Purpose: Optimize common query patterns
-- ============================================================================

-- Index for filtering by status (draft, submitted, cancelled)
CREATE INDEX IF NOT EXISTS idx_main_table_status ON main_table(status);

-- Index for filtering by booking_status (pending, confirmed, cancelled)
CREATE INDEX IF NOT EXISTS idx_main_table_booking_status ON main_table(booking_status);

-- Index for ordering by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_main_table_created_at ON main_table(created_at DESC);

-- Partial index for demo data (efficient filtering and removal of demo records)
CREATE INDEX IF NOT EXISTS idx_main_table_is_demo ON main_table(is_demo) WHERE is_demo = true;

-- GIN index for JSONB request_types array queries
-- Allows efficient queries like: WHERE request_types @> '["flight"]'::jsonb
CREATE INDEX IF NOT EXISTS idx_main_table_request_types ON main_table USING GIN(request_types);

-- Index for booking reference (for lookups)
CREATE INDEX IF NOT EXISTS idx_main_table_booking_ref ON main_table(booking_ref) WHERE booking_ref IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- Purpose: Document table and key columns for future reference
-- ============================================================================

COMMENT ON TABLE main_table IS 'Main table for bookings with financial/business data. Base structure matches requests table.';
COMMENT ON COLUMN main_table.id IS 'Unique booking identifier (UUID)';
COMMENT ON COLUMN main_table.request_types IS 'JSONB array of request types: ["flight", "visa", "package", "other"]';
COMMENT ON COLUMN main_table.status IS 'Request status: draft (created but not submitted), submitted, cancelled';
COMMENT ON COLUMN main_table.booking_status IS 'Booking status: pending, confirmed, cancelled';
COMMENT ON COLUMN main_table.is_demo IS 'Flag for demo/test data. Demo data can be removed at any time.';
COMMENT ON COLUMN main_table.booking_ref IS 'Booking reference number';
COMMENT ON COLUMN main_table.print_invoice IS 'Flag to indicate if invoice should be printed';
COMMENT ON COLUMN main_table.bank_transfer IS 'Flag to indicate if payment was made via bank transfer';
COMMENT ON COLUMN main_table.cash_paid IS 'Flag to indicate if payment was made in cash';

-- ============================================================================
-- Migration Complete
-- ============================================================================
