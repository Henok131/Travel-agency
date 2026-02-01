-- ============================================================================
-- Migration: 018_create_simple_select_policies.sql
-- Description: Create simple SELECT policies for main_table, requests, expenses
--              Users can only view rows where organization_id matches their membership
-- ============================================================================

-- ============================================================================
-- main_table: Simple SELECT Policy
-- ============================================================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view bookings" ON main_table;
DROP POLICY IF EXISTS "Users can view main_table in their organization" ON main_table;

-- Create simple SELECT policy
CREATE POLICY "Users can view their organization main_table"
  ON main_table FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- requests: Simple SELECT Policy
-- ============================================================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view requests" ON requests;
DROP POLICY IF EXISTS "Users can view requests in their organization" ON requests;

-- Create simple SELECT policy
CREATE POLICY "Users can view their organization requests"
  ON requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- expenses: Simple SELECT Policy
-- ============================================================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses in their organization" ON expenses;

-- Create simple SELECT policy
CREATE POLICY "Users can view their organization expenses"
  ON expenses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify new SELECT policies
SELECT 
  tablename,
  policyname,
  cmd AS command
FROM pg_policies
WHERE tablename IN ('main_table', 'requests', 'expenses')
  AND cmd = 'SELECT'
ORDER BY tablename;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Status: Simple SELECT policies created for all three tables
-- Note: Policies only allow access when organization_id matches user's membership
--       Records with NULL organization_id will NOT be accessible (by design)
-- ============================================================================
