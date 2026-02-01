-- ============================================================================
-- Migration: 010_fix_rls_recursion.sql
-- Description: Fixes infinite recursion in RLS policies
--              Allows queries without organization_id when not authenticated
--              Only applies organization filtering in settings/authenticated contexts
-- ============================================================================

-- Fix organization_members SELECT policy (remove self-reference to prevent recursion)
DROP POLICY IF EXISTS "Users can view members of their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Fix organization_members INSERT/UPDATE/DELETE policies (remove recursion)
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can insert organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can update organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can delete organization members" ON organization_members;

-- Allow users to manage their own memberships
CREATE POLICY "Users can manage own membership"
  ON organization_members FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix expenses RLS policies to allow queries without organization_id when not authenticated
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
CREATE POLICY "Users can view expenses"
  ON expenses FOR SELECT
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert organization expenses" ON expenses;
CREATE POLICY "Users can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update organization expenses" ON expenses;
CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete organization expenses" ON expenses;
CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix main_table RLS policies similarly
DROP POLICY IF EXISTS "Users can view organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can view bookings" ON main_table;
CREATE POLICY "Users can view bookings"
  ON main_table FOR SELECT
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can insert bookings" ON main_table;
CREATE POLICY "Users can insert bookings"
  ON main_table FOR INSERT
  WITH CHECK (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can update bookings" ON main_table;
CREATE POLICY "Users can update bookings"
  ON main_table FOR UPDATE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete organization bookings" ON main_table;
DROP POLICY IF EXISTS "Users can delete bookings" ON main_table;
CREATE POLICY "Users can delete bookings"
  ON main_table FOR DELETE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix requests RLS policies similarly
DROP POLICY IF EXISTS "Users can view organization requests" ON requests;
DROP POLICY IF EXISTS "Users can view requests" ON requests;
CREATE POLICY "Users can view requests"
  ON requests FOR SELECT
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert organization requests" ON requests;
DROP POLICY IF EXISTS "Users can insert requests" ON requests;
CREATE POLICY "Users can insert requests"
  ON requests FOR INSERT
  WITH CHECK (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update organization requests" ON requests;
DROP POLICY IF EXISTS "Users can update requests" ON requests;
CREATE POLICY "Users can update requests"
  ON requests FOR UPDATE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete organization requests" ON requests;
DROP POLICY IF EXISTS "Users can delete requests" ON requests;
CREATE POLICY "Users can delete requests"
  ON requests FOR DELETE
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Migration Complete
-- ============================================================================
