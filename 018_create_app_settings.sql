-- ============================================================================
-- Migration: 018_create_app_settings.sql
-- Purpose: Create app_settings table for single-tenant preferences (no auth)
--          Use fixed APP_ID: 00000000-0000-0000-0000-000000000001
--          Disable RLS for single-tenant use
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS app_settings (
  app_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (app_id, key)
);

-- Disable RLS for single-tenant use (can switch to APP_ID-based policy if desired)
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Upsert helper to ensure APP_ID row exists for a given key
CREATE OR REPLACE FUNCTION ensure_app_setting(p_app_id UUID, p_key TEXT, p_value JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO app_settings (app_id, key, value)
  VALUES (p_app_id, p_key, p_value)
  ON CONFLICT (app_id, key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Seed defaults for the fixed APP_ID
DO $$
DECLARE
  app_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  PERFORM ensure_app_setting(app_id, 'language', to_jsonb('de'));
  PERFORM ensure_app_setting(app_id, 'theme', to_jsonb('dark'));
  PERFORM ensure_app_setting(app_id, 'vat_filing_frequency', to_jsonb('quarterly'));
  PERFORM ensure_app_setting(app_id, 'calculator-favorites', '[]'::jsonb);
  PERFORM ensure_app_setting(app_id, 'calculator-recently-used', '[]'::jsonb);
END $$;

COMMENT ON TABLE app_settings IS 'Single-tenant application settings keyed by app_id and key';
COMMENT ON COLUMN app_settings.app_id IS 'Fixed APP_ID for single-tenant: 00000000-0000-0000-0000-000000000001';

-- ============================================================================ 
-- Storage policy note (manual):
-- Ensure the `logos` bucket is public or has a policy allowing upload/read
-- without auth for the single tenant. Example policy if RLS is enabled:
--   allow upload/update/delete/read for all objects where bucket = ''logos''.
-- ============================================================================ 
