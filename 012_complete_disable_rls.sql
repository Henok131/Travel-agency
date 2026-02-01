-- ============================================================================
-- Migration: 012_complete_disable_rls.sql
-- Description: Completely disables RLS on all tables to restore working state
--              This breaks the recursion issue and restores previous functionality
-- ============================================================================

-- Disable RLS on all main data tables
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE main_table DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on organization_members to break recursion completely
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view members of their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can manage own membership" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert organization expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update organization expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete organization expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can view bookings" ON main_table;
DROP POLICY IF EXISTS "Users can insert organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can insert bookings" ON main_table;
DROP POLICY IF EXISTS "Users can update organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can update bookings" ON main_table;
DROP POLICY IF EXISTS "Users can delete organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can delete bookings" ON main_table;
DROP POLICY IF EXISTS "Users can view organization requests" ON requests;
DROP POLICY IF EXISTS "Users can view requests" ON requests;
DROP POLICY IF EXISTS "Users can insert organization requests" ON requests;
DROP POLICY IF EXISTS "Users can insert requests" ON requests;
DROP POLICY IF EXISTS "Users can update organization requests" ON requests;
DROP POLICY IF EXISTS "Users can update requests" ON requests;
DROP POLICY IF EXISTS "Users can delete organization requests" ON requests;
DROP POLICY IF EXISTS "Users can delete requests" ON requests;

-- ============================================================================
-- Migration Complete
-- Note: RLS is now disabled on all tables. This restores the previous
--       working state where queries work without RLS blocking.
--       Organization filtering still works in Settings via application-level filtering.
-- ============================================================================
