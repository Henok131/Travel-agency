-- Migration: Add text content fields to invoice_settings table
-- Date: 2026-01-XX
-- Description: Allows invoice_settings to store text content fields that are used in invoice generation
--              These fields are saved from Settings → Invoice Text Content

-- Add text content fields to invoice_settings table
ALTER TABLE invoice_settings
  ADD COLUMN IF NOT EXISTS invoice_title TEXT,
  ADD COLUMN IF NOT EXISTS ticket_platform_text TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_paragraph TEXT,
  ADD COLUMN IF NOT EXISTS tax_paragraph TEXT,
  ADD COLUMN IF NOT EXISTS signature_label TEXT;

-- Add comments for documentation
COMMENT ON COLUMN invoice_settings.invoice_title IS 'Main invoice title (e.g., "BANKÜBERWEISUNG" or "BANK TRANSFER")';
COMMENT ON COLUMN invoice_settings.ticket_platform_text IS 'Ticket booking platform text (e.g., "Ticket booking platforms:- IATA")';
COMMENT ON COLUMN invoice_settings.confirmation_paragraph IS 'Confirmation paragraph text (legal wording about booking confirmation)';
COMMENT ON COLUMN invoice_settings.tax_paragraph IS 'Tax exemption paragraph text (e.g., "Tax-exempt brokerage service pursuant to § 3a para.2 UStG")';
COMMENT ON COLUMN invoice_settings.signature_label IS 'Signature label text (e.g., "Signature:" or "Unterschrift:")';
