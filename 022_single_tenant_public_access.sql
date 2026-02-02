-- ============================================================================
-- Migration: 022_single_tenant_public_access.sql
-- Purpose: Ensure single-tenant operation without auth by disabling blocking RLS
--          and making the `logos` storage bucket publicly readable/writable.
--          All data access is keyed by fixed APP_ID in the application layer.
-- ============================================================================

-- Disable RLS on core application tables (single tenant, no auth)
ALTER TABLE IF EXISTS main_table DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;

-- Make sure the logos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage objects (required for policies to apply)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public read/write access to the logos bucket
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Public upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Public update logos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete logos" ON storage.objects;

CREATE POLICY "Public read logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'logos');

CREATE POLICY "Public upload logos"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Public update logos"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'logos')
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Public delete logos"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'logos');

-- Verification helper: show RLS status (optional)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN
--   ('main_table','requests','expenses','invoice_settings','invoice_templates','app_settings','customers');
-- SELECT * FROM storage.buckets WHERE id = 'logos';
