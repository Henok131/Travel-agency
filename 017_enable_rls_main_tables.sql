-- ============================================================================
-- Migration: 017_enable_rls_main_tables.sql
-- Description: Enable RLS on main_table, requests, and expenses tables
--              No policies are created or modified - RLS only enabled
-- ============================================================================

-- Enable RLS on main_table
ALTER TABLE main_table ENABLE ROW LEVEL SECURITY;

-- Enable RLS on requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify RLS status for all three tables
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('main_table', 'requests', 'expenses')
ORDER BY tablename;

-- Check existing policies (should remain unchanged)
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename IN ('main_table', 'requests', 'expenses')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Status: RLS enabled on main_table, requests, and expenses
-- Note: No policies created or modified
-- Warning: With RLS enabled and no policies, all SELECT/INSERT/UPDATE/DELETE
--          operations will be blocked until policies are added
-- ============================================================================
