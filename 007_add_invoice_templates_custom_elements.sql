-- Migration: Add custom_elements to invoice_templates for Word-like editor
-- Date: 2026-01-XX

ALTER TABLE invoice_templates
ADD COLUMN IF NOT EXISTS custom_elements JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN invoice_templates.custom_elements IS 'Word-like layout elements with positions and styles';
