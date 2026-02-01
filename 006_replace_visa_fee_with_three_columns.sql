-- ============================================================================
-- Migration: 006_replace_visa_fee_with_three_columns.sql
-- Description: Replaces visa_fee column with three columns:
--              - visa_price: Base visa price
--              - service_visa: Service fee for visa
--              - tot_visa_fees: Total visa fees (auto-calculated: visa_price + service_visa)
-- ============================================================================

-- Add the three new columns
ALTER TABLE main_table
  ADD COLUMN IF NOT EXISTS visa_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS service_visa NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS tot_visa_fees NUMERIC(10,2);

-- Migrate existing visa_fee data to visa_price (optional - user can manually update service_visa later)
-- This preserves existing data by copying visa_fee to visa_price
UPDATE main_table
SET visa_price = visa_fee
WHERE visa_fee IS NOT NULL AND visa_price IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN main_table.visa_price IS 'Base visa price (editable)';
COMMENT ON COLUMN main_table.service_visa IS 'Service fee for visa processing (editable)';
COMMENT ON COLUMN main_table.tot_visa_fees IS 'Total visa fees: visa_price + service_visa (auto-calculated, read-only)';

-- Note: We keep visa_fee column for now to preserve data
-- You can drop it later after verifying the migration:
-- ALTER TABLE main_table DROP COLUMN IF EXISTS visa_fee;

-- ============================================================================
-- Migration Complete
-- ============================================================================
