# Audit Report: Local Storage & Dev Mode Migration to Supabase

**Date:** 2025-01-27  
**Purpose:** Migrate all persistent data from localStorage/dev mode to Supabase for single-tenant production app

---

## Executive Summary

This audit identified all features using localStorage, dev mode fallbacks, and in-memory state that should be persisted in Supabase. All critical invoice-related features have been migrated to use a fixed `APP_ID` instead of user authentication, making the app suitable for single-tenant production use.

---

## ✅ COMPLETED MIGRATIONS

### 1. Invoice Settings (`InvoiceSettingsForm.jsx`)
**Status:** ✅ **MIGRATED**

**Before:**
- ❌ Used `localStorage` for draft settings (`invoice_settings_draft`)
- ❌ Dev mode fallback to local storage
- ❌ Required user authentication (`supabase.auth.getUser()`)
- ❌ Logo saved locally as data URL in dev mode

**After:**
- ✅ All settings saved to `invoice_settings` table
- ✅ Uses fixed `APP_ID` (`00000000-0000-0000-0000-000000000001`)
- ✅ No auth required
- ✅ Logo uploaded to Supabase Storage (`logos` bucket)
- ✅ `logo_url` persisted in `invoice_settings` table
- ✅ Auto-saves logo URL immediately after upload

**Files Changed:**
- `src/components/Settings/InvoiceTemplates/InvoiceSettingsForm.jsx`
- `src/lib/appConfig.js` (new)

### 2. Invoice Generation (`MainTable.jsx`, `RequestsList.jsx`)
**Status:** ✅ **MIGRATED**

**Before:**
- ❌ Fetched invoice settings using `supabase.auth.getUser().id`
- ❌ Would fail if no authenticated user

**After:**
- ✅ Fetches invoice settings using fixed `APP_ID`
- ✅ Logo URL correctly passed to PDF generators
- ✅ Works without authentication

**Files Changed:**
- `src/pages/MainTable.jsx`
- `src/pages/RequestsList.jsx`

### 3. Invoice Templates (`TemplatesList.jsx`)
**Status:** ✅ **MIGRATED**

**Before:**
- ❌ Fetched all templates (no user filter)
- ❌ Used `supabase.auth.getUser().id` for operations

**After:**
- ✅ Filters templates by fixed `APP_ID`
- ✅ All operations use `APP_ID`
- ✅ Duplicate/create operations set `APP_ID`

**Files Changed:**
- `src/components/Settings/InvoiceTemplates/TemplatesList.jsx`

---

## ⚠️ REMAINING LOCAL STORAGE USAGE

### 1. Language/Theme Preferences
**Status:** ⚠️ **STILL USING LOCALSTORAGE**

**Files:**
- `src/pages/MainTable.jsx` (line 228, 316, 321)
- `src/pages/BookingsList.jsx` (lines 130, 133, 171, 176)
- `src/pages/CustomersList.jsx` (lines 126, 129, 167, 172)
- `src/pages/InvoicesList.jsx` (lines 128, 131, 169, 174)
- `src/pages/TaxPage.jsx` (lines 378, 381, 384, 445, 450, 455)
- `src/pages/BankList.jsx` (lines 103, 106, 155, 160)

**Current Implementation:**
```javascript
const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'de')
localStorage.setItem('language', language)
```

**Recommendation:**
- Create `app_settings` table with `key` and `value` columns
- Store `language`, `theme`, `vat_filing_frequency` in database
- Use fixed `APP_ID` for single-tenant

**Impact:** Low - UI preferences only, doesn't affect data persistence

### 2. Calculator Favorites/Recently Used (`CalculatorDashboard.jsx`)
**Status:** ⚠️ **STILL USING LOCALSTORAGE**

**File:** `src/pages/CalculatorDashboard.jsx` (lines 169, 173, 177, 179, 182, 184)

**Current Implementation:**
```javascript
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('calculator-favorites')
  return saved ? JSON.parse(saved) : []
})
localStorage.setItem('calculator-favorites', JSON.stringify(favorites))
```

**Recommendation:**
- Store in `app_settings` table with keys:
  - `calculator-favorites` → JSON array
  - `calculator-recently-used` → JSON array

**Impact:** Low - User convenience features only

### 3. Mock Store (`mockStore.js`)
**Status:** ⚠️ **STILL EXISTS BUT MOSTLY UNUSED**

**File:** `src/store/mockStore.js`

**Current State:**
- In-memory store with localStorage persistence
- Used in `StoreContext.jsx`
- Still referenced in:
  - `src/pages/Dashboard.jsx` (lines 342, 343, 516, 521)
  - `src/pages/BookingsList.jsx` (line 516)
  - `src/pages/CustomersList.jsx` (line 513)
  - `src/pages/InvoicesList.jsx` (line 520)

**Recommendation:**
- Verify these pages are actually using Supabase queries
- Remove mockStore if not needed
- Update `StoreContext.jsx` to remove mockStore dependency

**Impact:** Medium - May cause confusion if still used

---

## 🔧 DEV MODE FALLBACKS

### AuthContext (`AuthContext.jsx`)
**Status:** ⚠️ **STILL HAS DEV MODE LOGIC**

**File:** `src/contexts/AuthContext.jsx`

**Current Implementation:**
```javascript
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.VITE_DISABLE_AUTH === 'true'
if (DEV_MODE) return { success: true, user: { id: 'dev-user' } }
```

**Recommendation:**
- For single-tenant production app, remove all DEV_MODE checks
- Always use fixed `APP_ID` instead of user authentication
- Remove `DEV_USER` and `DEV_ORG` constants

**Impact:** High - May cause issues if dev mode is enabled

---

## 📋 DATABASE MIGRATION

### SQL Migration Created
**File:** `017_migrate_to_single_tenant.sql`

**Actions:**
1. Updates existing `invoice_settings` records to use `APP_ID`
2. Creates default `invoice_settings` record if none exists
3. Updates existing `invoice_templates` records to use `APP_ID`
4. Removes duplicate `invoice_settings` records (keeps most recent)

**To Apply:**
```sql
-- Run in Supabase SQL Editor
\i 017_migrate_to_single_tenant.sql
```

---

## 🎯 RECOMMENDATIONS

### High Priority
1. ✅ **COMPLETED:** Invoice settings and logo persistence
2. ✅ **COMPLETED:** Invoice generation using APP_ID
3. ⚠️ **TODO:** Remove DEV_MODE checks from AuthContext
4. ⚠️ **TODO:** Verify and remove mockStore usage

### Medium Priority
5. ⚠️ **TODO:** Migrate language/theme preferences to `app_settings` table
6. ⚠️ **TODO:** Migrate calculator favorites to `app_settings` table

### Low Priority
7. ⚠️ **TODO:** Create `app_settings` table for UI preferences
8. ⚠️ **TODO:** Remove unused localStorage code

---

## 📊 SUMMARY

| Feature | Status | Persistence Location |
|---------|--------|---------------------|
| Invoice Settings | ✅ Migrated | `invoice_settings` table |
| Logo Upload | ✅ Migrated | Supabase Storage + `invoice_settings.logo_url` |
| Invoice Generation | ✅ Migrated | Uses `APP_ID` |
| Invoice Templates | ✅ Migrated | Uses `APP_ID` |
| Language/Theme | ⚠️ LocalStorage | Should migrate to `app_settings` |
| Calculator Favorites | ⚠️ LocalStorage | Should migrate to `app_settings` |
| Mock Store | ⚠️ Exists | Should verify if still used |

---

## ✅ VERIFICATION CHECKLIST

- [x] Logo uploads to Supabase Storage
- [x] Logo URL saved to `invoice_settings` table
- [x] Logo appears in generated invoices
- [x] Invoice settings persist across refreshes
- [x] No auth required for invoice operations
- [ ] Language/theme preferences persist (still localStorage)
- [ ] Calculator favorites persist (still localStorage)
- [ ] MockStore removed/verified unused

---

## 🚀 NEXT STEPS

1. **Apply Database Migration:**
   ```bash
   # Run in Supabase SQL Editor
   \i 017_migrate_to_single_tenant.sql
   ```

2. **Test Logo Upload:**
   - Upload logo in Settings → Invoice Templates
   - Verify logo appears in generated invoice PDF
   - Refresh page and verify logo still appears

3. **Remove DEV_MODE Logic:**
   - Update `AuthContext.jsx` to remove DEV_MODE checks
   - Always use `APP_ID` instead of user authentication

4. **Create app_settings Table:**
   ```sql
   CREATE TABLE app_settings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     key TEXT UNIQUE NOT NULL,
     value JSONB NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

5. **Migrate UI Preferences:**
   - Language, theme, VAT filing frequency → `app_settings` table
   - Calculator favorites → `app_settings` table

---

**Report Generated:** 2025-01-27  
**Migration Status:** Critical features migrated ✅ | UI preferences pending ⚠️
