-- ========================================
-- Multi-Tenancy Database Migration
-- ========================================
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. Organizations Table
-- ========================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  currency TEXT DEFAULT 'EUR',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  language TEXT DEFAULT 'en',
  time_zone TEXT DEFAULT 'Europe/Berlin',
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ========================================
-- 2. User Profiles Table
-- ========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ========================================
-- 3. Organization Members Table
-- ========================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Create indexes
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_members
CREATE POLICY "Users can view members of their organization"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ========================================
-- 4. Add organization_id to existing tables
-- ========================================

-- Add organization_id to requests table
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_requests_org_id ON requests(organization_id);

-- Update RLS policy for requests
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;
CREATE POLICY "Users can view organization requests"
  ON requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own requests" ON requests;
CREATE POLICY "Users can insert organization requests"
  ON requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own requests" ON requests;
CREATE POLICY "Users can update organization requests"
  ON requests FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own requests" ON requests;
CREATE POLICY "Users can delete organization requests"
  ON requests FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add organization_id to main_table
ALTER TABLE main_table 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_main_table_org_id ON main_table(organization_id);

-- Update RLS policy for main_table
DROP POLICY IF EXISTS "Users can view main table" ON main_table;
CREATE POLICY "Users can view organization main table"
  ON main_table FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert into main table" ON main_table;
CREATE POLICY "Users can insert organization main table"
  ON main_table FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update main table" ON main_table;
CREATE POLICY "Users can update organization main table"
  ON main_table FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete from main table" ON main_table;
CREATE POLICY "Users can delete organization main table"
  ON main_table FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add organization_id to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);

-- Update RLS policy for expenses
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
CREATE POLICY "Users can view organization expenses"
  ON expenses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert expenses" ON expenses;
CREATE POLICY "Users can insert organization expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
CREATE POLICY "Users can update organization expenses"
  ON expenses FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;
CREATE POLICY "Users can delete organization expenses"
  ON expenses FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add organization_id to time_slots table
ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_time_slots_org_id ON time_slots(organization_id);

-- Add organization_id to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON bookings(organization_id);

-- ========================================
-- 5. Create Supabase Storage Bucket
-- ========================================
-- Run this separately or via Supabase dashboard

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-uploads
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ========================================
-- 6. Trigger to update updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. Sample Data (Optional - for testing)
-- ========================================
-- Uncomment to create a test organization

/*
-- Create a test organization
INSERT INTO organizations (name, slug)
VALUES ('LST Travel Agency', 'lst-travel-agency')
RETURNING id;

-- Note: You'll need to manually link this to a user via organization_members
-- after creating a user account through Supabase Auth
*/

-- ========================================
-- Migration Complete!
-- ========================================
-- Next steps:
-- 1. Create a Supabase Auth user via the dashboard or signup flow
-- 2. Insert into user_profiles with the user's ID
-- 3. Create an organization
-- 4. Link user to organization via organization_members
-- 5. Update existing data with organization_id values
