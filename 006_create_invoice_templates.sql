-- Migration: Create invoice_templates table with full customization and RLS security
-- Date: 2026-01-XX
-- Description: Customizable invoice template system with Row Level Security

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  
  -- Header customization
  header_content TEXT,
  header_logo_url TEXT,
  header_height INTEGER DEFAULT 120,
  header_bg_color VARCHAR(20) DEFAULT '#ffffff',
  header_padding_top INTEGER DEFAULT 20,
  header_padding_right INTEGER DEFAULT 40,
  header_padding_bottom INTEGER DEFAULT 20,
  header_padding_left INTEGER DEFAULT 40,
  header_font_family VARCHAR(100) DEFAULT 'Inter',
  header_font_size INTEGER DEFAULT 24,
  header_text_color VARCHAR(20) DEFAULT '#000000',
  header_text_align VARCHAR(20) DEFAULT 'left',
  
  -- Body customization
  body_font_family VARCHAR(100) DEFAULT 'Inter',
  body_font_size INTEGER DEFAULT 14,
  body_line_height DECIMAL DEFAULT 1.6,
  body_text_color VARCHAR(20) DEFAULT '#000000',
  body_bg_color VARCHAR(20) DEFAULT '#ffffff',
  body_padding_top INTEGER DEFAULT 30,
  body_padding_right INTEGER DEFAULT 40,
  body_padding_bottom INTEGER DEFAULT 30,
  body_padding_left INTEGER DEFAULT 40,
  
  -- Footer customization
  footer_content TEXT,
  footer_height INTEGER DEFAULT 80,
  footer_bg_color VARCHAR(20) DEFAULT '#f8f9fa',
  footer_padding_top INTEGER DEFAULT 15,
  footer_padding_right INTEGER DEFAULT 40,
  footer_padding_bottom INTEGER DEFAULT 15,
  footer_padding_left INTEGER DEFAULT 40,
  footer_font_family VARCHAR(100) DEFAULT 'Inter',
  footer_font_size INTEGER DEFAULT 11,
  footer_text_color VARCHAR(20) DEFAULT '#64748b',
  footer_text_align VARCHAR(20) DEFAULT 'center',
  
  -- Table styling
  table_header_bg_color VARCHAR(20) DEFAULT '#2563eb',
  table_header_text_color VARCHAR(20) DEFAULT '#ffffff',
  table_border_color VARCHAR(20) DEFAULT '#e2e8f0',
  table_row_alternate_bg VARCHAR(20) DEFAULT '#f8f9fa',
  table_font_size INTEGER DEFAULT 13,
  
  -- Global styling
  primary_color VARCHAR(20) DEFAULT '#2563eb',
  secondary_color VARCHAR(20) DEFAULT '#64748b',
  border_color VARCHAR(20) DEFAULT '#e2e8f0',
  border_width INTEGER DEFAULT 1,
  border_radius INTEGER DEFAULT 6,
  
  -- Layout
  page_margin_top INTEGER DEFAULT 40,
  page_margin_right INTEGER DEFAULT 40,
  page_margin_bottom INTEGER DEFAULT 40,
  page_margin_left INTEGER DEFAULT 40,
  section_spacing INTEGER DEFAULT 20,
  
  -- Advanced
  custom_css TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comments
COMMENT ON TABLE invoice_templates IS 'Customizable invoice templates with full styling control';
COMMENT ON COLUMN invoice_templates.user_id IS 'Owner of the template (multi-tenant)';
COMMENT ON COLUMN invoice_templates.template_name IS 'User-friendly name for the template';
COMMENT ON COLUMN invoice_templates.is_default IS 'Whether this is the default template for the user';
COMMENT ON COLUMN invoice_templates.custom_css IS 'Additional custom CSS for advanced styling';

-- CRITICAL: Enable RLS for multi-tenant security
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Users can only view their own templates
CREATE POLICY "Users view own templates"
  ON invoice_templates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create templates with their user_id
CREATE POLICY "Users create own templates"
  ON invoice_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own templates
CREATE POLICY "Users update own templates"
  ON invoice_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own templates
CREATE POLICY "Users delete own templates"
  ON invoice_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_templates_user ON invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_default ON invoice_templates(user_id, is_default) WHERE is_default = true;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoice_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_templates_updated_at();

-- Constraint: Only one default template per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_templates_one_default_per_user 
  ON invoice_templates(user_id) 
  WHERE is_default = true;

-- Grant necessary permissions (if using service role)
-- GRANT ALL ON invoice_templates TO authenticated;
-- GRANT USAGE ON SCHEMA public TO authenticated;
