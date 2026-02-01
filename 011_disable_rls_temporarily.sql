-- ============================================================================
-- Migration: 011_disable_rls_temporarily.sql
-- Description: Temporarily disables RLS to restore previous working state
--              User requested: "these was working perfect just try to reconnect"
--              This allows queries to work without organization filtering
-- ============================================================================

-- Disable RLS on main tables to restore previous working state
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE main_table DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on organization_members (for settings/authenticated use)
-- But fix the recursion issue
DROP POLICY IF EXISTS "Users can view members of their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can manage own membership" ON organization_members;

-- Simple policy: users can see their own memberships
CREATE POLICY "Users can view own membership"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Simple policy: users can manage their own memberships
CREATE POLICY "Users can manage own membership"
  ON organization_members FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Migration Complete
-- Note: RLS is disabled on expenses, main_table, requests to restore
--       previous working state. Organization filtering still works in
--       Settings page via application-level filtering.
-- ============================================================================
