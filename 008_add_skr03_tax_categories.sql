-- ============================================================================
-- Migration: 008_add_skr03_tax_categories.sql
-- Description: Adds SKR03 tax category fields to expenses table
--              Includes tax_category_code and deductible_percentage
-- ============================================================================

-- Add SKR03 tax category columns
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS tax_category_code TEXT,
  ADD COLUMN IF NOT EXISTS deductible_percentage NUMERIC(5,2) DEFAULT 100.00;

-- Migrate existing expenses - map old categories to SKR03 codes
UPDATE expenses
SET
  tax_category_code = CASE
    WHEN category = 'Office Rent' THEN '4920'
    WHEN category = 'Internet & Phone' THEN '4910'
    WHEN category = 'Utilities (Electricity / Water)' THEN '4930'
    WHEN category = 'Staff Salary' THEN '6000'
    WHEN category = 'Marketing & Ads' THEN '6400'
    WHEN category = 'Meal & Entertainment' THEN '6805'
    WHEN category = 'Software / Tools' THEN '4960'
    WHEN category = 'Miscellaneous' THEN '4800'
    ELSE '4800' -- Default to Miscellaneous
  END,
  deductible_percentage = CASE
    WHEN category = 'Meal & Entertainment' THEN 70.00
    ELSE 100.00
  END
WHERE tax_category_code IS NULL;

-- ============================================================================
-- INDEXES
-- Purpose: Optimize queries for tax reporting by category code
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_expenses_tax_category_code ON expenses(tax_category_code) WHERE tax_category_code IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- Purpose: Document SKR03 tax category fields
-- ============================================================================

COMMENT ON COLUMN expenses.tax_category_code IS 'SKR03 tax category code (e.g., 4920 for Office Rent)';
COMMENT ON COLUMN expenses.deductible_percentage IS 'Percentage of expense that is tax deductible (default: 100.00, Meal & Entertainment: 70.00)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
