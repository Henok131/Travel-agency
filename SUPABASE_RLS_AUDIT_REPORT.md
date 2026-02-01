# Supabase Database RLS Status Audit Report

**Generated:** 2026-01-19  
**Type:** READ-ONLY Analysis (No Database Modifications)  
**Purpose:** Audit current Row Level Security (RLS) status across all tables

---

## 📋 EXECUTIVE SUMMARY

### Current RLS Status Overview

| Status | Count | Tables |
|--------|-------|--------|
| **RLS ENABLED** | 6 | organizations, user_profiles, invoice_templates, invoice_settings, time_slots, bookings |
| **RLS DISABLED** | 4 | expenses, main_table, requests, organization_members |
| **RLS UNKNOWN** | 1 | deleted_items (no RLS statement found) |

### Critical Finding
🔴 **RLS DISABLED on all main data tables** (`expenses`, `main_table`, `requests`, `organization_members`)  
⚠️ **Security Risk:** Customer/booking data not protected by RLS policies

---

## 1️⃣ TABLE-BY-TABLE RLS STATUS

### ✅ **RLS ENABLED TABLES**

#### 1. **`organizations`**
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `settings.Pro/migration_multi_tenancy.sql:29`
- **organization_id:** ❌ N/A (this IS the organization table)
- **RLS Policies:**
  - `"Users can view their own organization"` (SELECT)
  - `"Organization owners can update"` (UPDATE)
- **Policy Logic:** Users can view organizations they're members of; owners/admins can update

#### 2. **`user_profiles`**
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `settings.Pro/migration_multi_tenancy.sql:71`
- **organization_id:** ❌ N/A (user-specific table)
- **RLS Policies:**
  - `"Users can view their own profile"` (SELECT)
  - `"Users can update their own profile"` (UPDATE)
  - `"Users can insert their own profile"` (INSERT)
- **Policy Logic:** Users can only access their own profile (`id = auth.uid()`)

#### 3. **`invoice_templates`**
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `006_create_invoice_templates.sql:86`
- **organization_id:** ❌ NO (uses `user_id` instead)
- **RLS Policies:**
  - `"Users view own templates"` (SELECT)
  - `"Users create own templates"` (INSERT)
  - `"Users update own templates"` (UPDATE)
  - `"Users delete own templates"` (DELETE)
- **Policy Logic:** Users can only access templates where `user_id = auth.uid()`

#### 4. **`invoice_settings`**
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `013_create_invoice_settings.sql:19`
- **organization_id:** ❌ NO (uses `user_id` instead)
- **RLS Policies:**
  - `"Invoice settings read own"` (SELECT)
  - `"Invoice settings insert own"` (INSERT)
  - `"Invoice settings update own"` (UPDATE)
  - `"Invoice settings delete own"` (DELETE)
- **Policy Logic:** Users can only access settings where `user_id = auth.uid()`

#### 5. **`time_slots`**
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `009_create_admin_tables.sql:31`
- **organization_id:** ✅ **YES** (added in `migration_multi_tenancy.sql:288`)
- **RLS Policies:**
  - `"Anyone can view open time slots"` (SELECT - public read for open slots)
  - `"Admin can manage all time slots"` (ALL - admin only)
- **Policy Logic:** Public can view open slots; admins can manage all

#### 6. **`bookings`** (Admin bookings table)
- **RLS Status:** ✅ **ENABLED**
- **Migration:** `009_create_admin_tables.sql:32`
- **organization_id:** ✅ **YES** (added in `migration_multi_tenancy.sql:295`)
- **RLS Policies:**
  - `"Admin can manage all bookings"` (ALL - admin only)
- **Policy Logic:** Admins can manage all bookings

---

### ❌ **RLS DISABLED TABLES**

#### 7. **`expenses`**
- **RLS Status:** ❌ **DISABLED**
- **Disabled By:** `011_disable_rls_temporarily.sql:9` and `012_complete_disable_rls.sql:8`
- **organization_id:** ✅ **YES** (added in `migration_multi_tenancy.sql:236`)
- **Previous Policies (DROPPED):**
  - `"Users can view organization expenses"` (SELECT)
  - `"Users can insert organization expenses"` (INSERT)
  - `"Users can update organization expenses"` (UPDATE)
  - `"Users can delete organization expenses"` (DELETE)
- **Current State:** No RLS protection - all data accessible to anyone with anon key
- **Impact:** 🔴 **HIGH** - Expense data not protected

#### 8. **`main_table`** (Bookings/Customers)
- **RLS Status:** ❌ **DISABLED**
- **Disabled By:** `011_disable_rls_temporarily.sql:10` and `012_complete_disable_rls.sql:9`
- **organization_id:** ✅ **YES** (added in `migration_multi_tenancy.sql:184`)
- **Previous Policies (DROPPED):**
  - `"Users can view organization main table"` (SELECT)
  - `"Users can insert organization main table"` (INSERT)
  - `"Users can update organization main table"` (UPDATE)
  - `"Users can delete organization main table"` (DELETE)
- **Current State:** No RLS protection - all booking/customer data accessible
- **Impact:** 🔴 **CRITICAL** - Customer/booking data not protected

#### 9. **`requests`**
- **RLS Status:** ❌ **DISABLED**
- **Disabled By:** `011_disable_rls_temporarily.sql:11` and `012_complete_disable_rls.sql:10`
- **organization_id:** ✅ **YES** (added in `migration_multi_tenancy.sql:132`)
- **Previous Policies (DROPPED):**
  - `"Users can view organization requests"` (SELECT)
  - `"Users can insert organization requests"` (INSERT)
  - `"Users can update organization requests"` (UPDATE)
  - `"Users can delete organization requests"` (DELETE)
- **Current State:** No RLS protection - all request data accessible
- **Impact:** 🔴 **CRITICAL** - Request data not protected

#### 10. **`organization_members`**
- **RLS Status:** ❌ **DISABLED**
- **Disabled By:** `012_complete_disable_rls.sql:13`
- **organization_id:** ✅ **YES** (this table links users to organizations)
- **Previous Policies (DROPPED):**
  - `"Users can view members of their organization"` (SELECT)
  - `"Admins can manage members"` (ALL)
  - `"Users can view own membership"` (SELECT - from 011)
  - `"Users can manage own membership"` (ALL - from 011)
- **Current State:** No RLS protection - organization membership data accessible
- **Impact:** 🔴 **CRITICAL** - Multi-tenant isolation broken

---

### ❓ **RLS STATUS UNKNOWN**

#### 11. **`deleted_items`**
- **RLS Status:** ❓ **UNKNOWN** (no RLS statement in migration)
- **Migration:** `005_create_deleted_items.sql`
- **organization_id:** ✅ **YES** (column exists: `005_create_deleted_items.sql:23`)
- **RLS Policies:** ❌ **NONE FOUND** in migration files
- **Current State:** Unknown - may be enabled/disabled in database
- **Impact:** ⚠️ **MEDIUM** - Deleted items may not be protected

---

## 2️⃣ ORGANIZATION_ID FIELD STATUS

### Tables WITH `organization_id` Column:

| Table | organization_id Added In | Foreign Key | Index |
|-------|-------------------------|-------------|-------|
| `requests` | `migration_multi_tenancy.sql:132` | ✅ YES (references organizations) | ✅ YES (`idx_requests_org_id`) |
| `main_table` | `migration_multi_tenancy.sql:184` | ✅ YES (references organizations) | ✅ YES (`idx_main_table_org_id`) |
| `expenses` | `migration_multi_tenancy.sql:236` | ✅ YES (references organizations) | ✅ YES (`idx_expenses_org_id`) |
| `time_slots` | `migration_multi_tenancy.sql:288` | ✅ YES (references organizations) | ✅ YES (`idx_time_slots_org_id`) |
| `bookings` | `migration_multi_tenancy.sql:295` | ✅ YES (references organizations) | ✅ YES (`idx_bookings_org_id`) |
| `deleted_items` | `005_create_deleted_items.sql:23` | ❌ NO (no FK constraint) | ✅ YES (`idx_deleted_items_organization_id`) |

### Tables WITHOUT `organization_id` Column:

| Table | Reason |
|-------|--------|
| `organizations` | This IS the organization table |
| `user_profiles` | User-specific (uses `id` = auth.uid()) |
| `organization_members` | Links users to organizations (has `organization_id` as part of relationship) |
| `invoice_templates` | Uses `user_id` instead of `organization_id` |
| `invoice_settings` | Uses `user_id` instead of `organization_id` |

---

## 3️⃣ EXISTING RLS POLICIES (CURRENT STATE)

### Policies That SHOULD Exist (Based on Migrations):

#### **organizations** Table:
1. ✅ `"Users can view their own organization"` (SELECT)
2. ✅ `"Organization owners can update"` (UPDATE)

#### **user_profiles** Table:
1. ✅ `"Users can view their own profile"` (SELECT)
2. ✅ `"Users can update their own profile"` (UPDATE)
3. ✅ `"Users can insert their own profile"` (INSERT)

#### **organization_members** Table:
- ❌ **ALL POLICIES DROPPED** (migration 012)
- Previous policies (now dropped):
  - `"Users can view members of their organization"` (SELECT)
  - `"Admins can manage members"` (ALL)
  - `"Users can view own membership"` (SELECT)
  - `"Users can manage own membership"` (ALL)

#### **invoice_templates** Table:
1. ✅ `"Users view own templates"` (SELECT)
2. ✅ `"Users create own templates"` (INSERT)
3. ✅ `"Users update own templates"` (UPDATE)
4. ✅ `"Users delete own templates"` (DELETE)

#### **invoice_settings** Table:
1. ✅ `"Invoice settings read own"` (SELECT)
2. ✅ `"Invoice settings insert own"` (INSERT)
3. ✅ `"Invoice settings update own"` (UPDATE)
4. ✅ `"Invoice settings delete own"` (DELETE)

#### **time_slots** Table:
1. ✅ `"Anyone can view open time slots"` (SELECT)
2. ✅ `"Admin can manage all time slots"` (ALL)

#### **bookings** Table:
1. ✅ `"Admin can manage all bookings"` (ALL)

#### **expenses** Table:
- ❌ **ALL POLICIES DROPPED** (migration 012)
- Previous policies (now dropped):
  - `"Users can view organization expenses"` (SELECT)
  - `"Users can insert organization expenses"` (INSERT)
  - `"Users can update organization expenses"` (UPDATE)
  - `"Users can delete organization expenses"` (DELETE)

#### **main_table** Table:
- ❌ **ALL POLICIES DROPPED** (migration 012)
- Previous policies (now dropped):
  - `"Users can view organization main table"` (SELECT)
  - `"Users can insert organization main table"` (INSERT)
  - `"Users can update organization main table"` (UPDATE)
  - `"Users can delete organization main table"` (DELETE)

#### **requests** Table:
- ❌ **ALL POLICIES DROPPED** (migration 012)
- Previous policies (now dropped):
  - `"Users can view organization requests"` (SELECT)
  - `"Users can insert organization requests"` (INSERT)
  - `"Users can update organization requests"` (UPDATE)
  - `"Users can delete organization requests"` (DELETE)

---

## 4️⃣ ORGANIZATION_MEMBERS TABLE STRUCTURE

### Table Schema:
```sql
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

### Fields:
- `id` - UUID primary key
- `organization_id` - FK to organizations (NOT NULL)
- `user_id` - FK to auth.users (NOT NULL)
- `role` - TEXT with CHECK constraint ('owner', 'admin', 'member')
- `created_at` - Timestamp

### Indexes:
- `idx_org_members_org_id` on `organization_id`
- `idx_org_members_user_id` on `user_id`
- UNIQUE constraint on `(organization_id, user_id)`

### RLS Status:
- ❌ **DISABLED** (migration 012)
- **Impact:** Organization membership data not protected

---

## 5️⃣ HOW ORGANIZATION_ID IS POPULATED IN INSERTS

### ✅ **Expenses Table** - `organization_id` IS Populated

**Location:** `src/pages/ExpensesList.jsx:1730`

**Code:**
```javascript
const dbData = {
  // ... other fields
  organization_id: organization?.id || null
}

await supabase
  .from('expenses')
  .insert([dbData])
```

**Status:** ✅ **Populated** - Uses `organization.id` from AuthContext, falls back to `null` if no organization

---

### ⚠️ **Requests Table** - `organization_id` NOT Populated

**Location:** `src/pages/CreateRequest.jsx:2170-2182`

**Code:**
```javascript
const dbData = {
  first_name: formData.firstName,
  // ... other fields
  // ⚠️ organization_id NOT included in insert
}

await supabase
  .from('requests')
  .insert([dbData])
```

**Status:** ❌ **NOT POPULATED** - `organization_id` field exists but not set in insert

**Impact:** 
- New requests have `organization_id = NULL`
- Cannot filter requests by organization
- Multi-tenant isolation broken for requests

---

### ⚠️ **Main Table** - `organization_id` NOT Directly Populated

**Location:** `003_sync_requests_to_main_table.sql` (trigger function)

**Code:**
```sql
CREATE OR REPLACE FUNCTION sync_requests_to_main_table()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO main_table (
    id, first_name, middle_name, last_name,
    -- ... other fields
    -- ⚠️ organization_id NOT included in trigger
  ) VALUES (
    NEW.id, NEW.first_name, NEW.middle_name, NEW.last_name,
    -- ... other values
    -- ⚠️ organization_id NOT copied from requests
  );
END;
```

**Status:** ❌ **NOT POPULATED** - Trigger doesn't copy `organization_id` from requests

**Impact:**
- When request is inserted → trigger creates main_table row
- `organization_id` is NOT copied (even if it existed in requests)
- Main table rows have `organization_id = NULL`

**Additional Note:** 
- Direct inserts to `main_table` (if any) also don't set `organization_id`
- Code search shows no direct inserts to `main_table` - all go through requests trigger

---

### ✅ **Deleted Items** - `organization_id` IS Populated

**Location:** `src/pages/settings.Pro/SettingsPro.jsx:713`

**Code:**
```javascript
const restoreData = item.data
const { id, created_at, updated_at, organization_id, ...restoreData } = item.data
// Restore with current organization_id
await supabase
  .from(originalTable)
  .insert([{ ...restoreData, organization_id: organization.id }])
```

**Status:** ✅ **Populated** - Uses current `organization.id` when restoring

---

## 6️⃣ MIGRATION HISTORY SUMMARY

### RLS Timeline:

1. **Initial State** (migrations 001-009):
   - No RLS on `requests`, `main_table`, `expenses`
   - RLS enabled on `time_slots`, `bookings` (admin tables)

2. **Multi-Tenancy Migration** (`migration_multi_tenancy.sql`):
   - Added `organization_id` to `requests`, `main_table`, `expenses`, `time_slots`, `bookings`
   - Enabled RLS on `organizations`, `user_profiles`, `organization_members`
   - Created RLS policies for organization-based access

3. **RLS Recursion Fix** (`010_fix_rls_recursion.sql`):
   - Attempted to fix infinite recursion in RLS policies
   - Modified policies to allow `organization_id IS NULL` OR organization check
   - Kept RLS enabled

4. **Temporary Disable** (`011_disable_rls_temporarily.sql`):
   - Disabled RLS on `expenses`, `main_table`, `requests`
   - Kept RLS enabled on `organization_members` (with simplified policies)

5. **Complete Disable** (`012_complete_disable_rls.sql`):
   - Disabled RLS on ALL tables: `expenses`, `main_table`, `requests`, `organization_members`
   - Dropped ALL policies for these tables
   - **Current State:** RLS disabled on all main data tables

---

## 7️⃣ SECURITY ASSESSMENT

### 🔴 **CRITICAL SECURITY RISKS**

#### 1. **No Data Isolation**
- **Risk:** All customer/booking data accessible to anyone with anon key
- **Impact:** Data breach, GDPR violation, multi-tenant data leakage
- **Tables Affected:** `main_table`, `requests`, `expenses`

#### 2. **No Access Control**
- **Risk:** Cannot restrict data by user or organization
- **Impact:** Users can access/modify data from other organizations
- **Tables Affected:** All tables with RLS disabled

#### 3. **Organization Membership Exposed**
- **Risk:** `organization_members` table not protected
- **Impact:** Can see which users belong to which organizations
- **Tables Affected:** `organization_members`

#### 4. **organization_id Not Populated**
- **Risk:** Even if RLS re-enabled, data won't be filtered correctly
- **Impact:** Multi-tenant isolation won't work
- **Tables Affected:** `requests`, `main_table` (via trigger)

---

## 8️⃣ DATA INTEGRITY ISSUES

### Missing `organization_id` in Inserts:

| Table | organization_id Field | Populated in Inserts? | Impact |
|-------|---------------------|----------------------|--------|
| `requests` | ✅ YES | ❌ NO | New requests have NULL organization_id |
| `main_table` | ✅ YES | ❌ NO (trigger doesn't copy) | New bookings have NULL organization_id |
| `expenses` | ✅ YES | ✅ YES | Correctly populated |

### Trigger Issue:

**Problem:** `sync_requests_to_main_table()` trigger doesn't copy `organization_id`

**Current Trigger Code:**
```sql
INSERT INTO main_table (
  id, first_name, ..., -- organization_id NOT listed
) VALUES (
  NEW.id, NEW.first_name, ..., -- organization_id NOT copied
);
```

**Impact:**
- Even if `requests.organization_id` is set, `main_table.organization_id` will be NULL
- Multi-tenant filtering won't work for bookings

---

## 9️⃣ SUMMARY TABLE

| Table | RLS Status | organization_id Exists? | organization_id Populated? | Policies Exist? | Security Risk |
|-------|-----------|------------------------|---------------------------|----------------|---------------|
| `organizations` | ✅ ENABLED | N/A | N/A | ✅ YES | ✅ LOW |
| `user_profiles` | ✅ ENABLED | N/A | N/A | ✅ YES | ✅ LOW |
| `organization_members` | ❌ DISABLED | ✅ YES | N/A | ❌ NO (dropped) | 🔴 CRITICAL |
| `invoice_templates` | ✅ ENABLED | ❌ NO (uses user_id) | N/A | ✅ YES | ✅ LOW |
| `invoice_settings` | ✅ ENABLED | ❌ NO (uses user_id) | N/A | ✅ YES | ✅ LOW |
| `time_slots` | ✅ ENABLED | ✅ YES | ❓ Unknown | ✅ YES | ⚠️ MEDIUM |
| `bookings` | ✅ ENABLED | ✅ YES | ❓ Unknown | ✅ YES | ⚠️ MEDIUM |
| `expenses` | ❌ DISABLED | ✅ YES | ✅ YES | ❌ NO (dropped) | 🔴 HIGH |
| `main_table` | ❌ DISABLED | ✅ YES | ❌ NO | ❌ NO (dropped) | 🔴 CRITICAL |
| `requests` | ❌ DISABLED | ✅ YES | ❌ NO | ❌ NO (dropped) | 🔴 CRITICAL |
| `deleted_items` | ❓ UNKNOWN | ✅ YES | ✅ YES (on restore) | ❓ UNKNOWN | ⚠️ MEDIUM |

---

## 🔟 RECOMMENDATIONS

### 🔴 **IMMEDIATE ACTIONS REQUIRED**

1. **Re-enable RLS on Critical Tables**
   - `main_table` (bookings/customers)
   - `requests`
   - `expenses`
   - `organization_members`

2. **Fix organization_id Population**
   - Update `CreateRequest.jsx` to include `organization_id` in insert
   - Update `sync_requests_to_main_table()` trigger to copy `organization_id`

3. **Recreate RLS Policies**
   - Restore organization-based policies for all tables
   - Test policies to avoid recursion issues

4. **Verify deleted_items RLS**
   - Check if RLS is enabled
   - Add policies if missing

### ⚠️ **BEFORE RE-ENABLING RLS**

1. **Populate Missing organization_id Values**
   - Update existing NULL `organization_id` records
   - Assign to appropriate organization

2. **Test RLS Policies**
   - Verify no recursion issues
   - Test organization isolation
   - Test authenticated vs unauthenticated access

---

## 📊 DETAILED POLICY ANALYSIS

### Policy Pattern (From migration_multi_tenancy.sql):

**Standard Organization-Based Policy:**
```sql
CREATE POLICY "Users can view organization [table]"
  ON [table] FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

**Issue:** This pattern caused recursion when checking `organization_members` table itself.

**Solution Attempted (010_fix_rls_recursion.sql):**
```sql
CREATE POLICY "Users can view [table]"
  ON [table] FOR SELECT
  USING (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

**Current State:** All policies dropped, RLS disabled (migration 012)

---

## 📝 NOTES

1. **Migration 012** was the last migration affecting RLS - completely disabled RLS to restore functionality
2. **organization_id** fields exist but are not consistently populated
3. **Trigger function** needs update to copy `organization_id` from requests to main_table
4. **Application-level filtering** is currently used in some places (e.g., ExpensesList.jsx:452)
5. **RLS policies** exist in migration files but are dropped/disabled in database

---

**Report Generated:** 2026-01-19  
**Analysis Type:** READ-ONLY (No Database Modifications)  
**Next Steps:** Review this report and plan RLS re-enablement strategy
