-- Migration: Add invoice text content fields to invoice_settings table
-- Date: 2026-01-XX
-- Description: Adds editable invoice text fields to company settings
--              This migration fixes the error: "Could not find the 'confirmation_paragraph' column"

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

-- Set default values for existing records (backward compatibility)
UPDATE invoice_settings
SET
  ticket_platform_text = COALESCE(ticket_platform_text, 'Ticketbuchungsplattformen:- IATA'),
  confirmation_paragraph = COALESCE(confirmation_paragraph, 'Ich/Wir bestätigen, dass die Angaben auf meiner/unserer Buchung korrekt sind, einschließlich Namen, Datum und weiterer Details. Zudem wurde ich/wurden wir über die Visumspflichten, Stornierungs- und Umbuchungsgebühren und alle Flugreisedetails umfassend aufgeklärt. Ich/Wir habe(n) die Bedingungen für die Buchung zur Kenntnis genommen und vollumfänglich verstanden und buche(n) verbindlich.'),
  tax_paragraph = COALESCE(tax_paragraph, 'Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG'),
  signature_label = COALESCE(signature_label, 'Unterschrift:')
WHERE ticket_platform_text IS NULL;
