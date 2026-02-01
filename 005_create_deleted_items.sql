-- ============================================================================
-- Migration: 005_create_deleted_items.sql
-- Description: Creates deleted_items table for recycling bin functionality
--              Stores soft-deleted records from requests and main_table
-- ============================================================================

CREATE TABLE IF NOT EXISTS deleted_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to original record
  original_id UUID NOT NULL,
  original_table TEXT NOT NULL, -- 'requests', 'main_table', 'expenses', 'bookings', 'invoices', etc.
  
  -- Item metadata
  item_type TEXT NOT NULL, -- 'request', 'booking', 'expense', 'invoice', etc.
  item_name TEXT NOT NULL, -- Display name (e.g., "John Doe" or "Request #123")
  
  -- Full record data (JSONB for flexibility)
  item_data JSONB NOT NULL,
  
  -- Organization (for multi-tenancy)
  organization_id UUID,
  
  -- Timestamps
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for filtering by organization
CREATE INDEX IF NOT EXISTS idx_deleted_items_organization_id ON deleted_items(organization_id);

-- Index for filtering by original table
CREATE INDEX IF NOT EXISTS idx_deleted_items_original_table ON deleted_items(original_table);

-- Index for ordering by deletion date (newest first)
CREATE INDEX IF NOT EXISTS idx_deleted_items_deleted_at ON deleted_items(deleted_at DESC);

-- Index for finding items by original_id and table (for restore)
CREATE INDEX IF NOT EXISTS idx_deleted_items_original ON deleted_items(original_id, original_table);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE deleted_items IS 'Stores soft-deleted records for recycling bin functionality';
COMMENT ON COLUMN deleted_items.original_id IS 'ID of the original record before deletion';
COMMENT ON COLUMN deleted_items.original_table IS 'Source table: requests or main_table';
COMMENT ON COLUMN deleted_items.item_type IS 'Type: request or booking';
COMMENT ON COLUMN deleted_items.item_data IS 'Full JSONB copy of the original record';
COMMENT ON COLUMN deleted_items.organization_id IS 'Organization ID for multi-tenancy support';
