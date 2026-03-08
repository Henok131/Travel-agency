-- Migration: Create table_columns_config for Main Table column configuration
-- Date: 2026-01-XX
-- Description: Allows admin to configure Main Table columns (rename, reorder, hide/show)

-- Create table_columns_config table
CREATE TABLE IF NOT EXISTS table_columns_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_key VARCHAR(255) NOT NULL UNIQUE,
  label TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE table_columns_config IS 'Configuration for Main Table columns - allows renaming, reordering, and hiding columns';
COMMENT ON COLUMN table_columns_config.column_key IS 'Database field name (e.g., first_name, booking_ref)';
COMMENT ON COLUMN table_columns_config.label IS 'Display label shown in table header';
COMMENT ON COLUMN table_columns_config.visible IS 'Whether the column is visible in the table';
COMMENT ON COLUMN table_columns_config.order_index IS 'Display order (lower numbers appear first)';

-- Disable RLS for single-tenant app
ALTER TABLE table_columns_config DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_table_columns_config_order ON table_columns_config(order_index);
CREATE INDEX IF NOT EXISTS idx_table_columns_config_visible ON table_columns_config(visible) WHERE visible = true;

-- Insert default column configurations based on current MainTable structure
INSERT INTO table_columns_config (column_key, label, visible, order_index)
VALUES
  ('select', '', true, 0),
  ('row_number', '#', true, 1),
  ('pnr_rfn', 'PNR / RFN', true, 2),
  ('booking_status', 'Booking Status', true, 3),
  ('invoice_action', 'Invoice', true, 4),
  ('first_name', 'First Name', true, 5),
  ('middle_name', 'Middle Name', true, 6),
  ('last_name', 'Last Name', true, 7),
  ('date_of_birth', 'Date of Birth', true, 8),
  ('gender', 'Gender', true, 9),
  ('passport_number', 'Passport Number', true, 10),
  ('flight_details', 'Flight Details', true, 11),
  ('request_types', 'Request Types', true, 12),
  ('airlines_price', 'Airlines Price', true, 13),
  ('service_fee', 'Service Fee', true, 14),
  ('total_ticket_price', 'Total Ticket Price', true, 15),
  ('visa_price', 'Visa Price', true, 16),
  ('service_visa', 'Service Visa', true, 17),
  ('tot_visa_fees', 'Total Visa Fees', true, 18),
  ('total_amount_due', 'Total Amount Due', true, 19),
  ('cash_paid', 'Cash Paid', true, 20),
  ('bank_transfer', 'Bank Transfer', true, 21),
  ('total_customer_payment', 'Total Customer Payment', true, 22),
  ('payment_balance', 'Payment Balance', true, 23),
  ('commission_from_airlines', 'Commission from Airlines', true, 24),
  ('lst_loan_fee', 'LST Loan Fee', true, 25),
  ('lst_profit', 'LST Profit', true, 26),
  ('created_at', 'Created At', true, 27),
  ('delete', 'Delete', true, 28)
ON CONFLICT (column_key) DO NOTHING;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_table_columns_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER table_columns_config_updated_at
  BEFORE UPDATE ON table_columns_config
  FOR EACH ROW
  EXECUTE FUNCTION update_table_columns_config_updated_at();
