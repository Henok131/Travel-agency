-- ============================================================================
-- Migration: 016_enable_rls_organization_members.sql
-- Description: Re-enable RLS on organization_members table with minimal SELECT policy
--              Users can only view their own membership records
-- ============================================================================

-- Enable RLS on organization_members table
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (cleanup)
DROP POLICY IF EXISTS "Users can view members of their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can manage own membership" ON organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON organization_members;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;

-- Create minimal SELECT policy: Users can view rows where user_id = auth.uid()
CREATE POLICY "Users can view own membership"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'organization_members';

-- List all policies on organization_members
SELECT 
  policyname,
  cmd AS command,
  qual AS using_expression
FROM pg_policies
WHERE tablename = 'organization_members';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Status: RLS enabled with minimal SELECT policy
-- Policy: Users can only view rows where user_id = auth.uid()
-- Note: No INSERT/UPDATE/DELETE policies added (as requested)
-- ============================================================================
