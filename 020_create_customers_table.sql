-- ============================================================================
-- Migration: 020_create_customers_table.sql
-- Description: Creates a new production-ready customers table with RLS-SIMPLE
--              This replaces the legacy customers table structure
--              DO NOT modify or delete existing tables
-- ============================================================================

-- ============================================================================
-- CREATE CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers_new (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS-SIMPLE compatible)
  organization_id UUID NOT NULL
    REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Customer Identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  
  -- Contact Information
  primary_phone TEXT NOT NULL,  -- WhatsApp-first primary contact
  email TEXT,
  
  -- Status Management
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'vip', 'blacklisted')),
  
  -- Additional Information
  date_of_birth DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Index for organization_id (for RLS performance)
CREATE INDEX IF NOT EXISTS idx_customers_organization_id 
  ON customers_new(organization_id);

-- Index for email (for lookups)
CREATE INDEX IF NOT EXISTS idx_customers_email 
  ON customers_new(email) 
  WHERE email IS NOT NULL;

-- Index for primary_phone (for lookups)
CREATE INDEX IF NOT EXISTS idx_customers_primary_phone 
  ON customers_new(primary_phone);

-- Index for status (for filtering)
CREATE INDEX IF NOT EXISTS idx_customers_status 
  ON customers_new(status);

-- Composite index for name lookups
CREATE INDEX IF NOT EXISTS idx_customers_name 
  ON customers_new(organization_id, last_name, first_name);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE customers_new ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS-SIMPLE POLICIES
-- ============================================================================

-- SELECT Policy: Users can view customers in their organization
CREATE POLICY "Users can view their organization customers"
  ON customers_new FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT Policy: Users can insert customers in their organization
CREATE POLICY "Users can insert their organization customers"
  ON customers_new FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE Policy: Users can update customers in their organization
CREATE POLICY "Users can update their organization customers"
  ON customers_new FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- DELETE Policy: Users can delete customers in their organization
CREATE POLICY "Users can delete their organization customers"
  ON customers_new FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- CREATE UPDATED_AT TRIGGER
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_new_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customers_new_updated_at
  BEFORE UPDATE ON customers_new
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_new_updated_at();

-- ============================================================================
-- Migration Complete
-- ============================================================================
