-- Migration: Add missing invoice template fields to match editor payload
-- Date: 2026-01-XX
-- Description: Adds all fields used by the template editor that are missing from the database schema

-- Add header border fields
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS header_border_bottom BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS header_border_color VARCHAR(20) DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS header_border_width INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS header_font_weight VARCHAR(20) DEFAULT '400';

-- Add body font fields
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS body_font_weight VARCHAR(20) DEFAULT '400',
  ADD COLUMN IF NOT EXISTS body_letter_spacing DECIMAL DEFAULT 0;

-- Add footer fields
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS footer_font_weight VARCHAR(20) DEFAULT '400',
  ADD COLUMN IF NOT EXISTS footer_line_height DECIMAL DEFAULT 1.6,
  ADD COLUMN IF NOT EXISTS footer_border_top BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS footer_border_color VARCHAR(20) DEFAULT '#e2e8f0',
  ADD COLUMN IF NOT EXISTS footer_border_width INTEGER DEFAULT 1;

-- Add table styling fields
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS table_border_width INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS table_row_bg_color VARCHAR(20) DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS table_cell_padding INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS table_header_font_weight VARCHAR(20) DEFAULT '600',
  ADD COLUMN IF NOT EXISTS table_number_align VARCHAR(20) DEFAULT 'right',
  ADD COLUMN IF NOT EXISTS table_total_bg_color VARCHAR(20) DEFAULT '#f1f5f9',
  ADD COLUMN IF NOT EXISTS table_total_font_weight VARCHAR(20) DEFAULT '700';

-- Add global styling fields
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20) DEFAULT '#10b981';

-- Add custom elements field (for Word-like editor layout)
ALTER TABLE invoice_templates
  ADD COLUMN IF NOT EXISTS custom_elements JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN invoice_templates.header_border_bottom IS 'Whether to show border at bottom of header';
COMMENT ON COLUMN invoice_templates.header_border_color IS 'Color of header border';
COMMENT ON COLUMN invoice_templates.header_border_width IS 'Width of header border in pixels';
COMMENT ON COLUMN invoice_templates.header_font_weight IS 'Font weight for header text (400=normal, 600=semi-bold, 700=bold)';
COMMENT ON COLUMN invoice_templates.body_font_weight IS 'Font weight for body text (400=normal, 600=semi-bold, 700=bold)';
COMMENT ON COLUMN invoice_templates.body_letter_spacing IS 'Letter spacing for body text in pixels';
COMMENT ON COLUMN invoice_templates.footer_font_weight IS 'Font weight for footer text (400=normal, 600=semi-bold, 700=bold)';
COMMENT ON COLUMN invoice_templates.footer_line_height IS 'Line height for footer text';
COMMENT ON COLUMN invoice_templates.footer_border_top IS 'Whether to show border at top of footer';
COMMENT ON COLUMN invoice_templates.footer_border_color IS 'Color of footer border';
COMMENT ON COLUMN invoice_templates.footer_border_width IS 'Width of footer border in pixels';
COMMENT ON COLUMN invoice_templates.table_border_width IS 'Width of table borders in pixels';
COMMENT ON COLUMN invoice_templates.table_row_bg_color IS 'Background color for table rows';
COMMENT ON COLUMN invoice_templates.table_cell_padding IS 'Padding inside table cells in pixels';
COMMENT ON COLUMN invoice_templates.table_header_font_weight IS 'Font weight for table headers (400=normal, 600=semi-bold, 700=bold)';
COMMENT ON COLUMN invoice_templates.table_number_align IS 'Text alignment for numeric columns (left, right, center)';
COMMENT ON COLUMN invoice_templates.table_total_bg_color IS 'Background color for total row';
COMMENT ON COLUMN invoice_templates.table_total_font_weight IS 'Font weight for total row text (400=normal, 600=semi-bold, 700=bold)';
COMMENT ON COLUMN invoice_templates.accent_color IS 'Accent color used for highlights and special elements';
COMMENT ON COLUMN invoice_templates.custom_elements IS 'Word-like editor layout elements with positions and styles (JSONB array)';
