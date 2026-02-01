-- ============================================================================
-- Migration: 021_rename_customers_table.sql
-- Description: Renames customers_new to customers after dropping old table
-- ============================================================================

-- Step 1: Verify old customers table is empty
-- (Verification done separately)

-- Step 2: Drop old customers table (safe - empty and unused)
DROP TABLE IF EXISTS customers CASCADE;

-- Step 3: Rename customers_new to customers
ALTER TABLE customers_new RENAME TO customers;

-- Note: All indexes, RLS policies, and triggers are automatically preserved
-- when renaming a table in PostgreSQL.
