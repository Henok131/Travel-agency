-- ============================================================================
-- Migration: 007_add_tax_compliance_fields.sql
-- Description: Adds tax compliance fields to expenses table for German quarterly tax reports
--              Includes gross_amount, vat_rate, net_amount, vat_amount, invoice_number, vendor_name
-- ============================================================================

-- Add tax compliance columns
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,2) DEFAULT 19.00,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Migrate existing data: Calculate VAT fields from existing amount
-- Assumes existing amount is gross_amount (including VAT)
UPDATE expenses 
SET
  gross_amount = amount,
  vat_rate = 19.00,
  net_amount = ROUND(amount / 1.19, 2),
  vat_amount = ROUND(amount - (amount / 1.19), 2)
WHERE gross_amount IS NULL;

-- ============================================================================
-- INDEXES
-- Purpose: Optimize queries for tax reporting
-- ============================================================================

-- Index for filtering by vendor
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_name ON expenses(vendor_name) WHERE vendor_name IS NOT NULL;

-- Index for filtering by invoice number
CREATE INDEX IF NOT EXISTS idx_expenses_invoice_number ON expenses(invoice_number) WHERE invoice_number IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- Purpose: Document new columns for tax compliance
-- ============================================================================

COMMENT ON COLUMN expenses.gross_amount IS 'Gross amount including VAT (Bruttobetrag)';
COMMENT ON COLUMN expenses.vat_rate IS 'VAT rate percentage (default: 19.00 for German standard rate)';
COMMENT ON COLUMN expenses.net_amount IS 'Net amount excluding VAT (Nettobetrag)';
COMMENT ON COLUMN expenses.vat_amount IS 'VAT amount (Mehrwertsteuerbetrag)';
COMMENT ON COLUMN expenses.invoice_number IS 'Vendor invoice number (Rechnungsnummer)';
COMMENT ON COLUMN expenses.vendor_name IS 'Vendor/supplier name (Lieferant)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
