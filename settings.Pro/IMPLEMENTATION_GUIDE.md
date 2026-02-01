# Professional Settings Implementation Guide

## 🎯 Overview

This guide walks you through replacing your basic Settings page with a **production-ready, professional Settings system** that includes:

- ✅ Tab-based modern UI (like Stripe, Vercel, Linear)
- ✅ Supabase integration (no localStorage)
- ✅ Multi-tenancy support (organization-aware)
- ✅ Toast notifications (no ugly alerts)
- ✅ Form validation & error handling
- ✅ Avatar & logo upload to Supabase Storage
- ✅ Password change functionality
- ✅ Data export (GDPR-ready)
- ✅ Professional styling with light/dark theme
- ✅ Mobile responsive
- ✅ Confirmation modals for destructive actions

---

## 📋 Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Supabase Storage**: Enable Storage in your project
3. **React App**: Your LST Travel application

---

## 🚀 Step-by-Step Implementation

### Step 1: Run Database Migration

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `migration_multi_tenancy.sql`
4. Run the migration
5. Verify tables were created:
   - `organizations`
   - `user_profiles`
   - `organization_members`
   - Check that `organization_id` was added to existing tables

**Verification:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'user_profiles', 'organization_members');

-- Check if organization_id was added to requests
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'organization_id';
```

---

### Step 2: Set Up Supabase Storage

1. Go to **Storage** in Supabase Dashboard
2. Verify the `user-uploads` bucket was created
3. If not, create it manually:
   - Click "Create a new bucket"
   - Name: `user-uploads`
   - Public: Yes
   - Enable policies for authenticated users

**Storage Structure:**
```
user-uploads/
  ├── avatars/
  │   └── {user_id}-{timestamp}.{ext}
  └── logos/
      └── {org_id}-{timestamp}.{ext}
```

---

### Step 3: Create Test Organization & User

For testing, you need to create an organization and link a user to it:

```sql
-- 1. Create a test organization
INSERT INTO organizations (name, slug)
VALUES ('LST Travel Agency', 'lst-travel-agency')
RETURNING id;

-- 2. Create user via Supabase Auth Dashboard or signup
-- Then get the user ID and link to organization:

-- 3. Link user to organization (replace with actual IDs)
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (
  '{your-organization-id}',  -- From step 1
  '{your-user-id}',           -- From Supabase Auth
  'owner'
);

-- 4. Create user profile (replace with actual IDs)
INSERT INTO user_profiles (id, email, full_name)
VALUES (
  '{your-user-id}',
  'your-email@example.com',
  'Your Name'
);
```

**Alternative - Use Signup Flow:**

The `AuthContext.jsx` includes a `signUp` function that automatically:
1. Creates user account
2. Creates organization
3. Links user to organization
4. Creates user profile

---

### Step 4: Replace AuthContext

1. **Backup your current AuthContext:**
   ```bash
   cp src/contexts/AuthContext.jsx src/contexts/AuthContext.jsx.backup
   ```

2. **Replace with new AuthContext:**
   ```bash
   cp /path/to/AuthContext.jsx src/contexts/AuthContext.jsx
   ```

3. **Verify imports in App.jsx:**
   ```javascript
   import { AuthProvider } from './contexts/AuthContext'

   function App() {
     return (
       <AuthProvider>
         {/* Your app content */}
       </AuthProvider>
     )
   }
   ```

---

### Step 5: Add Settings Files to Your Project

1. **Copy SettingsPro component:**
   ```bash
   cp /path/to/SettingsPro.jsx src/pages/SettingsPro.jsx
   ```

2. **Copy SettingsPro CSS:**
   ```bash
   cp /path/to/SettingsPro.css src/pages/SettingsPro.css
   ```

3. **Update your router** (in `App.jsx` or wherever you define routes):
   ```javascript
   import SettingsPro from './pages/SettingsPro'

   // In your routes:
   <Route path="/settings" element={<SettingsPro />} />
   ```

---

### Step 6: Update Existing Data (If You Have Data)

If you have existing data in your tables, you need to assign it to an organization:

```sql
-- Get your organization ID
SELECT id FROM organizations WHERE slug = 'lst-travel-agency';

-- Update existing requests
UPDATE requests 
SET organization_id = '{your-org-id}' 
WHERE organization_id IS NULL;

-- Update existing bookings
UPDATE main_table 
SET organization_id = '{your-org-id}' 
WHERE organization_id IS NULL;

-- Update existing expenses
UPDATE expenses 
SET organization_id = '{your-org-id}' 
WHERE organization_id IS NULL;

-- Update other tables as needed
UPDATE time_slots 
SET organization_id = '{your-org-id}' 
WHERE organization_id IS NULL;

UPDATE bookings 
SET organization_id = '{your-org-id}' 
WHERE organization_id IS NULL;
```

---

### Step 7: Update Data Fetching Queries

Now update all your data fetching to include organization filtering:

**Before:**
```javascript
const { data } = await supabase
  .from('requests')
  .select('*')
```

**After:**
```javascript
const { data } = await supabase
  .from('requests')
  .select('*')
  .eq('organization_id', currentOrganization.id)
```

**Files to Update:**
- `src/pages/RequestsList.jsx`
- `src/pages/MainTable.jsx`
- `src/pages/ExpensesList.jsx`
- `src/pages/Dashboard.jsx`
- Any other components that fetch data

**Example Update:**
```javascript
// At the top of your component
import { useAuth } from '../contexts/AuthContext'

function RequestsList() {
  const { currentOrganization } = useAuth()
  
  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('organization_id', currentOrganization?.id)  // Add this line
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error loading requests:', error)
      return
    }
    
    setRequests(data)
  }
  
  // ... rest of component
}
```

---

### Step 8: Update Insert/Update Queries

When inserting new data, include organization_id:

**Before:**
```javascript
const { data, error } = await supabase
  .from('requests')
  .insert([{ name: 'John Doe', ... }])
```

**After:**
```javascript
const { data, error } = await supabase
  .from('requests')
  .insert([{ 
    name: 'John Doe',
    organization_id: currentOrganization.id,  // Add this
    ...
  }])
```

---

### Step 9: Test the Settings Page

1. **Navigate to Settings:**
   - Go to `/settings` in your browser
   - Or click the Settings link in your sidebar

2. **Test Each Tab:**

   **Profile Tab:**
   - ✅ Upload avatar (test with image < 2MB)
   - ✅ Update full name
   - ✅ Update phone number
   - ✅ Change timezone
   - ✅ Click "Save Changes" and verify toast notification

   **Organization Tab:**
   - ✅ Upload organization logo
   - ✅ Update organization name
   - ✅ Change currency
   - ✅ Change date format
   - ✅ Change language
   - ✅ Save and verify

   **Preferences Tab:**
   - ✅ Toggle language (EN/DE)
   - ✅ Toggle theme (Light/Dark)
   - ✅ Toggle auto-save
   - ✅ Toggle email notifications
   - ✅ Change default date filter

   **Security Tab:**
   - ✅ Change password (requires at least 8 characters)
   - ✅ Verify passwords match validation
   - ✅ Test successful password change

   **Data & Privacy Tab:**
   - ✅ Export data (should download JSON file)
   - ✅ Test delete account confirmation modal

---

### Step 10: Verify Multi-Tenancy

**Test Data Isolation:**

1. Create a second test organization:
   ```sql
   INSERT INTO organizations (name, slug)
   VALUES ('Test Company', 'test-company');
   ```

2. Create a second test user and link to the new organization

3. Log in as User 1, create some data
4. Log in as User 2, verify you CANNOT see User 1's data
5. If you can see it, there's an RLS policy issue

**Debug RLS Issues:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 🎨 Customization

### Change Color Scheme

Edit the CSS variables in `SettingsPro.css`:

```css
:root[data-theme="light"] {
  /* Change primary color */
  --color-primary: #2563eb;  /* Blue */
  --color-primary-hover: #1d4ed8;
  
  /* Or use a different color */
  --color-primary: #10b981;  /* Green */
  --color-primary: #8b5cf6;  /* Purple */
  --color-primary: #ef4444;  /* Red */
}
```

### Add New Settings Tab

1. **Add tab button** in `SettingsPro.jsx`:
   ```javascript
   <button
     className={`settings-tab ${activeTab === 'billing' ? 'active' : ''}`}
     onClick={() => setActiveTab('billing')}
   >
     <svg>...</svg>
     Billing
   </button>
   ```

2. **Add tab content**:
   ```javascript
   {activeTab === 'billing' && (
     <div className="settings-section">
       <div className="section-header">
         <h2>Billing & Subscription</h2>
         <p>Manage your subscription and billing information</p>
       </div>
       
       {/* Your billing UI here */}
     </div>
   )}
   ```

### Add Form Fields

```javascript
<div className="form-group">
  <label htmlFor="company_name">Company Name</label>
  <input
    type="text"
    id="company_name"
    value={organization.company_name}
    onChange={(e) => setOrganization({ 
      ...organization, 
      company_name: e.target.value 
    })}
    placeholder="Enter company name"
  />
  <p className="form-hint">This will appear on invoices</p>
</div>
```

---

## 🔧 Troubleshooting

### Issue: "Cannot read property 'id' of null" (currentOrganization)

**Cause:** User is not linked to an organization

**Solution:**
```sql
-- Check if user has organization membership
SELECT * FROM organization_members WHERE user_id = '{your-user-id}';

-- If not, create one:
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('{your-org-id}', '{your-user-id}', 'owner');
```

### Issue: Avatar/Logo upload fails

**Causes:**
1. Storage bucket doesn't exist
2. Storage policies not set correctly
3. File size > 2MB

**Solutions:**
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'user-uploads';

-- Recreate policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Issue: Settings not saving

**Cause:** RLS policies blocking updates

**Solution:**
```sql
-- Check if you're the organization owner/admin
SELECT * FROM organization_members 
WHERE user_id = auth.uid() 
AND role IN ('owner', 'admin');

-- If not, grant permission:
UPDATE organization_members 
SET role = 'owner' 
WHERE user_id = '{your-user-id}';
```

### Issue: Data not filtering by organization

**Cause:** Queries missing organization_id filter

**Solution:** Add `.eq('organization_id', currentOrganization.id)` to all queries

---

## 📱 Mobile Responsiveness

The Settings page is fully responsive. Test on mobile:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test iPhone 12, iPad, etc.

**Mobile Optimizations:**
- Tabs become horizontal scrollable
- Forms stack vertically
- Avatar/logo uploads adapt
- Toast notifications adjust position

---

## 🔐 Security Best Practices

1. **Always use RLS policies** - Never query without them
2. **Validate organization_id** - Always check user has access
3. **Sanitize uploads** - Check file types and sizes
4. **Rate limit** - Add rate limiting to password changes
5. **Audit logs** - Consider logging sensitive changes

---

## 🚀 Next Steps

After implementing the professional Settings page:

1. **Add Team Members Management**
   - Invite team members
   - Assign roles (owner, admin, member)
   - Manage permissions

2. **Add Billing Integration**
   - Stripe integration
   - Subscription plans
   - Usage tracking

3. **Add API Keys**
   - Generate API keys for integrations
   - Manage API key permissions

4. **Add Activity Log**
   - Track user actions
   - Security audit trail

5. **Add 2FA (Two-Factor Authentication)**
   - TOTP (Time-based One-Time Password)
   - SMS verification

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 You're Done!

Your Settings page is now:
- ✅ Production-ready
- ✅ Multi-tenant aware
- ✅ Professionally designed
- ✅ Secure with RLS
- ✅ Mobile responsive
- ✅ Ready for SaaS conversion

**Need help?** Check the troubleshooting section or review the code comments in the implementation files.

---

## 🔄 Migrating Users

If you have existing users using the old hardcoded auth:

1. Export their data
2. Create Supabase Auth accounts for them
3. Create organizations for each
4. Link users to organizations
5. Import their data with organization_id
6. Send password reset emails

**Migration Script Example:**
```javascript
// migration-script.js
const migrateUsers = async () => {
  // 1. Get old users from localStorage or database
  const oldUsers = [
    { email: 'user@example.com', name: 'John Doe' }
  ]
  
  for (const oldUser of oldUsers) {
    // 2. Create Supabase Auth account
    const { data: authData, error } = await supabase.auth.admin.createUser({
      email: oldUser.email,
      email_confirm: true,
      user_metadata: { full_name: oldUser.name }
    })
    
    if (error) {
      console.error('Error creating user:', error)
      continue
    }
    
    // 3. Create organization
    const { data: org } = await supabase
      .from('organizations')
      .insert([{ name: `${oldUser.name}'s Organization`, slug: ... }])
      .select()
      .single()
    
    // 4. Link user to org
    await supabase
      .from('organization_members')
      .insert([{
        organization_id: org.id,
        user_id: authData.user.id,
        role: 'owner'
      }])
    
    // 5. Create profile
    await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email: oldUser.email,
        full_name: oldUser.name
      }])
    
    // 6. Update their data with organization_id
    await supabase
      .from('requests')
      .update({ organization_id: org.id })
      .eq('email', oldUser.email)  // or however you identify their data
  }
}
```

---

**Happy coding! 🎉**
