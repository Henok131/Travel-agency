-- ============================================================================
-- Migration: 004_create_expenses.sql
-- Description: Creates the expenses table for LST Travel Backoffice System
--              Tracks business expenses with date, category, payment method, and amount
-- ============================================================================

-- Enable UUID extension if not already enabled (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: expenses
-- Purpose: Tracks business expenses with categorization and payment details
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Expense Information
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Additional Details
  description TEXT,
  receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- Purpose: Optimize common query patterns
-- ============================================================================

-- Index for filtering by expense date (most recent first)
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Index for filtering by payment method
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses(payment_method);

-- Index for ordering by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- ============================================================================
-- COMMENTS
-- Purpose: Document table and key columns for future reference
-- ============================================================================

COMMENT ON TABLE expenses IS 'Tracks business expenses with categorization and payment details';
COMMENT ON COLUMN expenses.id IS 'Unique expense identifier (UUID)';
COMMENT ON COLUMN expenses.expense_date IS 'Date when the expense occurred';
COMMENT ON COLUMN expenses.category IS 'Expense category (e.g., office, travel, marketing, etc.)';
COMMENT ON COLUMN expenses.payment_method IS 'Payment method used (e.g., cash, bank_transfer, card, etc.)';
COMMENT ON COLUMN expenses.amount IS 'Expense amount (NUMERIC with 2 decimal places)';
COMMENT ON COLUMN expenses.currency IS 'Currency code (default: EUR)';
COMMENT ON COLUMN expenses.description IS 'Optional description or notes about the expense';
COMMENT ON COLUMN expenses.receipt_url IS 'Optional URL or path to receipt/document';

-- ============================================================================
-- Migration Complete
-- ============================================================================
