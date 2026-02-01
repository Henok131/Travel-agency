-- ============================================================================
-- Migration: 015_backfill_organization_id.sql
-- Description: Analysis and proposed UPDATE statements to backfill NULL
--              organization_id values in requests and main_table
-- 
-- IMPORTANT: This file contains ANALYSIS queries and PROPOSED updates.
--            Review all results before executing UPDATE statements.
-- ============================================================================

-- ============================================================================
-- STEP 1: ANALYSIS - Count NULL organization_id values
-- ============================================================================

-- Count NULL organization_id in requests table
SELECT 
  'requests' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(organization_id) AS rows_with_org_id,
  COUNT(*) - COUNT(organization_id) AS rows_with_null_org_id,
  ROUND(100.0 * (COUNT(*) - COUNT(organization_id)) / NULLIF(COUNT(*), 0), 2) AS percent_null
FROM requests;

-- Count NULL organization_id in main_table
SELECT 
  'main_table' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(organization_id) AS rows_with_org_id,
  COUNT(*) - COUNT(organization_id) AS rows_with_null_org_id,
  ROUND(100.0 * (COUNT(*) - COUNT(organization_id)) / NULLIF(COUNT(*), 0), 2) AS percent_null
FROM main_table;

-- Count NULL organization_id in expenses table (for reference)
SELECT 
  'expenses' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(organization_id) AS rows_with_org_id,
  COUNT(*) - COUNT(organization_id) AS rows_with_null_org_id,
  ROUND(100.0 * (COUNT(*) - COUNT(organization_id)) / NULLIF(COUNT(*), 0), 2) AS percent_null
FROM expenses;

-- ============================================================================
-- STEP 2: ANALYSIS - Check if there are any existing organization_id values
-- ============================================================================

-- Show distinct organization_id values in requests (if any)
SELECT 
  organization_id,
  COUNT(*) AS row_count,
  MIN(created_at) AS earliest_record,
  MAX(created_at) AS latest_record
FROM requests
WHERE organization_id IS NOT NULL
GROUP BY organization_id
ORDER BY row_count DESC;

-- Show distinct organization_id values in main_table (if any)
SELECT 
  organization_id,
  COUNT(*) AS row_count,
  MIN(created_at) AS earliest_record,
  MAX(created_at) AS latest_record
FROM main_table
WHERE organization_id IS NOT NULL
GROUP BY organization_id
ORDER BY row_count DESC;

-- ============================================================================
-- STEP 3: ANALYSIS - Check available organizations
-- ============================================================================

-- List all organizations in the system
SELECT 
  id,
  name,
  slug,
  created_at,
  (SELECT COUNT(*) FROM organization_members WHERE organization_id = organizations.id) AS member_count
FROM organizations
ORDER BY created_at;

-- ============================================================================
-- STEP 4: ANALYSIS - Check relationship between requests and main_table
-- ============================================================================

-- Check if requests and main_table are linked (same id)
-- This helps understand if we can use one to backfill the other
SELECT 
  COUNT(*) AS total_requests,
  COUNT(m.id) AS requests_with_main_table_match,
  COUNT(CASE WHEN r.organization_id IS NOT NULL AND m.organization_id IS NULL THEN 1 END) AS requests_with_org_but_main_null,
  COUNT(CASE WHEN r.organization_id IS NULL AND m.organization_id IS NOT NULL THEN 1 END) AS requests_null_but_main_has_org
FROM requests r
LEFT JOIN main_table m ON r.id = m.id;

-- ============================================================================
-- STEP 5: ANALYSIS - Sample NULL records to understand data
-- ============================================================================

-- Sample NULL organization_id records from requests (first 10)
SELECT 
  id,
  first_name,
  last_name,
  created_at,
  organization_id
FROM requests
WHERE organization_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Sample NULL organization_id records from main_table (first 10)
SELECT 
  id,
  first_name,
  last_name,
  created_at,
  organization_id
FROM main_table
WHERE organization_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- STEP 6: PROPOSED UPDATE STRATEGIES
-- ============================================================================

-- ============================================================================
-- STRATEGY A: Use existing organization_id from related records
-- ============================================================================
-- If requests has organization_id but main_table doesn't (or vice versa),
-- copy from the related record

-- PROPOSED UPDATE: Copy organization_id from requests to main_table
-- WHERE main_table.organization_id IS NULL AND requests.organization_id IS NOT NULL
/*
UPDATE main_table m
SET organization_id = r.organization_id
FROM requests r
WHERE m.id = r.id
  AND m.organization_id IS NULL
  AND r.organization_id IS NOT NULL;
*/

-- PROPOSED UPDATE: Copy organization_id from main_table to requests
-- WHERE requests.organization_id IS NULL AND main_table.organization_id IS NOT NULL
/*
UPDATE requests r
SET organization_id = m.organization_id
FROM main_table m
WHERE r.id = m.id
  AND r.organization_id IS NULL
  AND m.organization_id IS NOT NULL;
*/

-- ============================================================================
-- STRATEGY B: Assign to a single organization (requires confirmation)
-- ============================================================================
-- Use this if you have a single organization and want to assign all NULL values to it
-- REPLACE 'YOUR_ORGANIZATION_ID_HERE' with the actual UUID

-- First, verify the organization exists:
/*
SELECT id, name, slug FROM organizations WHERE id = 'YOUR_ORGANIZATION_ID_HERE';
*/

-- PROPOSED UPDATE: Assign all NULL requests to a specific organization
/*
UPDATE requests
SET organization_id = 'YOUR_ORGANIZATION_ID_HERE'
WHERE organization_id IS NULL;
*/

-- PROPOSED UPDATE: Assign all NULL main_table records to a specific organization
/*
UPDATE main_table
SET organization_id = 'YOUR_ORGANIZATION_ID_HERE'
WHERE organization_id IS NULL;
*/

-- ============================================================================
-- STRATEGY C: Assign based on user who created the record (if user_id exists)
-- ============================================================================
-- This strategy requires a user_id or created_by field in the tables
-- Currently, requests and main_table don't have user_id fields
-- This is a placeholder for future implementation

-- Check if we can determine organization from user context:
-- (This would require adding user_id to requests/main_table first)
/*
-- Example if user_id existed:
UPDATE requests r
SET organization_id = (
  SELECT om.organization_id
  FROM organization_members om
  WHERE om.user_id = r.user_id
  LIMIT 1
)
WHERE r.organization_id IS NULL
  AND r.user_id IS NOT NULL;
*/

-- ============================================================================
-- STRATEGY D: Assign based on date ranges or other business logic
-- ============================================================================
-- If you have business rules (e.g., "all records before date X belong to org Y")

-- Example: Assign records created before a certain date to a specific org
/*
UPDATE requests
SET organization_id = 'YOUR_ORGANIZATION_ID_HERE'
WHERE organization_id IS NULL
  AND created_at < '2025-01-01'::timestamp;
*/

-- ============================================================================
-- STEP 7: VERIFICATION QUERIES (Run after updates)
-- ============================================================================

-- Verify no NULL organization_id remain in requests
/*
SELECT COUNT(*) AS remaining_null_requests
FROM requests
WHERE organization_id IS NULL;
*/

-- Verify no NULL organization_id remain in main_table
/*
SELECT COUNT(*) AS remaining_null_main_table
FROM main_table
WHERE organization_id IS NULL;
*/

-- Verify organization_id values are valid (reference existing organizations)
/*
SELECT 
  r.organization_id,
  COUNT(*) AS count,
  CASE WHEN o.id IS NULL THEN 'INVALID - Organization does not exist' ELSE 'Valid' END AS status
FROM requests r
LEFT JOIN organizations o ON r.organization_id = o.id
GROUP BY r.organization_id, o.id
ORDER BY count DESC;
*/

-- ============================================================================
-- RECOMMENDED EXECUTION ORDER
-- ============================================================================

-- 1. Run all STEP 1-5 analysis queries to understand your data
-- 2. Review the results and determine which strategy fits your needs
-- 3. If using Strategy A (copy from related records):
--    a. Uncomment and run the UPDATE statements for Strategy A
--    b. Verify with STEP 7 queries
-- 4. If using Strategy B (single organization):
--    a. Replace 'YOUR_ORGANIZATION_ID_HERE' with actual UUID
--    b. Uncomment and run the UPDATE statements for Strategy B
--    c. Verify with STEP 7 queries
-- 5. If using Strategy C or D, adapt the queries to your business logic

-- ============================================================================
-- SAFETY NOTES
-- ============================================================================

-- ⚠️  BEFORE EXECUTING ANY UPDATE:
-- 1. Backup your database
-- 2. Run all analysis queries (STEP 1-5)
-- 3. Review the results carefully
-- 4. Test UPDATE on a small subset first (add LIMIT or WHERE clause)
-- 5. Verify results with STEP 7 queries
-- 6. Only then run full UPDATE statements

-- Example safe test update (update only 1 row first):
/*
UPDATE main_table m
SET organization_id = r.organization_id
FROM requests r
WHERE m.id = r.id
  AND m.organization_id IS NULL
  AND r.organization_id IS NOT NULL
LIMIT 1;

-- Then verify:
SELECT * FROM main_table WHERE id = (SELECT id FROM main_table WHERE organization_id IS NOT NULL LIMIT 1);
*/

-- ============================================================================
-- Migration Complete (Analysis Only - No Updates Executed)
-- ============================================================================
