-- ============================================================================
-- Migration: 019_create_simple_write_policies.sql
-- Description: Create simple INSERT, UPDATE, DELETE policies for main_table, 
--              requests, and expenses. Users can only write to rows where 
--              organization_id matches their membership.
-- ============================================================================

-- ============================================================================
-- main_table: Write Policies (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Drop existing write policies
DROP POLICY IF EXISTS "Users can insert bookings" ON main_table;
DROP POLICY IF EXISTS "Users can insert main_table in their organization" ON main_table;
DROP POLICY IF EXISTS "Users can update bookings" ON main_table;
DROP POLICY IF EXISTS "Users can update main_table in their organization" ON main_table;
DROP POLICY IF EXISTS "Users can delete bookings" ON main_table;
DROP POLICY IF EXISTS "Users can delete main_table in their organization" ON main_table;

-- Create INSERT policy
CREATE POLICY "Users can insert their organization main_table"
  ON main_table FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create UPDATE policy
CREATE POLICY "Users can update their organization main_table"
  ON main_table FOR UPDATE
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

-- Create DELETE policy
CREATE POLICY "Users can delete their organization main_table"
  ON main_table FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- requests: Write Policies (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Drop existing write policies
DROP POLICY IF EXISTS "Users can insert requests" ON requests;
DROP POLICY IF EXISTS "Users can insert requests in their organization" ON requests;
DROP POLICY IF EXISTS "Users can update requests" ON requests;
DROP POLICY IF EXISTS "Users can update requests in their organization" ON requests;
DROP POLICY IF EXISTS "Users can delete requests" ON requests;
DROP POLICY IF EXISTS "Users can delete requests in their organization" ON requests;

-- Create INSERT policy
CREATE POLICY "Users can insert their organization requests"
  ON requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create UPDATE policy
CREATE POLICY "Users can update their organization requests"
  ON requests FOR UPDATE
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

-- Create DELETE policy
CREATE POLICY "Users can delete their organization requests"
  ON requests FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- expenses: Write Policies (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Drop existing write policies
DROP POLICY IF EXISTS "Users can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses in their organization" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses in their organization" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses in their organization" ON expenses;

-- Create INSERT policy
CREATE POLICY "Users can insert their organization expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create UPDATE policy
CREATE POLICY "Users can update their organization expenses"
  ON expenses FOR UPDATE
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

-- Create DELETE policy
CREATE POLICY "Users can delete their organization expenses"
  ON expenses FOR DELETE
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

-- Verify all policies created (should have 4 policies per table)
SELECT 
  tablename,
  cmd AS command,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename IN ('main_table', 'requests', 'expenses')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Status: Simple CRUD policies created for all three tables
-- Note: All policies use the same condition: organization_id matches user's membership
--       CRUD operations are now allowed for organization members only
-- ============================================================================
