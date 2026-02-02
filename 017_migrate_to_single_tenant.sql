-- ============================================================================
-- Migration: 017_migrate_to_single_tenant.sql
-- Description: Migrate to single-tenant app with fixed APP_ID
--              Update invoice_settings and invoice_templates to use fixed APP_ID
--              No auth required - single client production app
-- ============================================================================

-- Fixed APP_ID for single-tenant production app
-- This replaces user_id/organization_id for single-client apps
DO $$
DECLARE
  app_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Update existing invoice_settings to use APP_ID
  -- If multiple records exist, keep the most recent one
  UPDATE invoice_settings
  SET user_id = app_id
  WHERE user_id IS NULL 
     OR user_id != app_id
     OR user_id = 'dev-user'::text;
  
  -- If no invoice_settings exists, create one with APP_ID
  INSERT INTO invoice_settings (user_id, logo_url, company_name, contact_person, address, postal, email, phone, mobile, tax_id, website, bank_name, iban, bic, include_qr)
  SELECT app_id, NULL, 'LST Travel Agency', 'Yodli Hagos Mebratu', 'Düsseldorfer Straße 14', '60329 Frankfurt a/M', 'info@lst-travel.de', '069/75848875', '0160/2371650', 'DE340914297', 'www.lsttravel.de', 'Commerzbank AG', 'DE28 5134 0013 0185 3597 00', 'COBADEFFXXX', false
  WHERE NOT EXISTS (SELECT 1 FROM invoice_settings WHERE user_id = app_id);
  
  -- Update existing invoice_templates to use APP_ID
  UPDATE invoice_templates
  SET user_id = app_id
  WHERE user_id IS NULL 
     OR user_id != app_id
     OR user_id = 'dev-user'::text;
  
  -- Clean up: Remove duplicate invoice_settings (keep most recent)
  DELETE FROM invoice_settings a
  USING invoice_settings b
  WHERE a.user_id = app_id 
    AND b.user_id = app_id
    AND a.id < b.id;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN invoice_settings.user_id IS 'Fixed APP_ID for single-tenant app: 00000000-0000-0000-0000-000000000001';
COMMENT ON COLUMN invoice_templates.user_id IS 'Fixed APP_ID for single-tenant app: 00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- Migration Complete
-- ============================================================================
