# RLS INSERT Error Diagnosis

**Date:** 2026-01-19  
**Error:** "new row violates row-level security policy for table 'requests'"  
**Location:** CreateRequest.jsx - Insert operation

---

## 🔍 ERROR ANALYSIS

### Error Message
```
new row violates row-level security policy for table "requests"
```

### Root Cause
The INSERT policy requires:
```sql
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
)
```

**Problem:** If `organization_id` is NULL, the policy check fails:
- `NULL IN (SELECT ...)` evaluates to NULL/FALSE
- Policy blocks the insert ❌

---

## 📋 FINDINGS

### ✅ **Policy Structure: CORRECT**
- INSERT policy exists and is correctly structured
- Policy checks organization membership via `organization_members` table

### ⚠️ **Issue: NULL organization_id Handling**

**Code Pattern (CreateRequest.jsx:2180):**
```javascript
organization_id: organization?.id || null
```

**Problem Scenarios:**
1. **User Not Authenticated:** `organization` is null → `organization_id` = NULL → ❌ Blocked
2. **Organization Not Loaded:** `organization` is null → `organization_id` = NULL → ❌ Blocked
3. **AuthContext Issue:** Organization not loaded from `organization_members` → `organization_id` = NULL → ❌ Blocked

---

## 🔍 ROOT CAUSE ANALYSIS

### **Scenario 1: User Not Authenticated**
**Status:** ⚠️ **LIKELY**
- If user is not logged in, `organization` from `useAuth()` is null
- `organization_id` becomes NULL
- Policy blocks NULL organization_id
- **Result:** Error message shown

### **Scenario 2: Organization Not Loaded**
**Status:** ⚠️ **POSSIBLE**
- User is authenticated but `organization` is null in AuthContext
- AuthContext tries to load organization from `organization_members`
- If query fails or returns no results, `organization` stays null
- **Result:** Error message shown

### **Scenario 3: AuthContext Loading Issue**
**Status:** ⚠️ **POSSIBLE**
- AuthContext queries `organization_members` (line 88-93)
- If user has no membership or query fails, `organization` is null
- **Result:** Error message shown

---

## 📊 POLICY BEHAVIOR

### Current INSERT Policy
```sql
CREATE POLICY "Users can insert their organization requests"
  ON requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

**Behavior:**
- ✅ Allows INSERT if `organization_id` matches user's membership
- ❌ Blocks INSERT if `organization_id` is NULL
- ❌ Blocks INSERT if `organization_id` doesn't match user's membership
- ❌ Blocks INSERT if user has no organization membership

---

## 🎯 DIAGNOSIS CHECKLIST

### Check 1: Is User Authenticated?
- [ ] User must be logged in (have valid session)
- [ ] `auth.uid()` must return user ID (not NULL)

### Check 2: Does User Have Organization Membership?
- [ ] User must exist in `organization_members` table
- [ ] `organization_members.user_id` must match `auth.uid()`
- [ ] `organization_members.organization_id` must exist

### Check 3: Is Organization Loaded in AuthContext?
- [ ] `AuthContext.loadUserData()` must successfully query `organization_members`
- [ ] `organization` state must be set in AuthContext
- [ ] `organization.id` must be available

### Check 4: Is organization_id Included in Insert?
- [x] ✅ Code includes `organization_id: organization?.id || null`
- [ ] `organization?.id` must not be null/undefined

---

## ⚠️ POTENTIAL ISSUES

### Issue 1: User Not Authenticated
**Symptom:** `organization` is null in AuthContext  
**Cause:** User not logged in or session expired  
**Fix:** User must log in first

### Issue 2: Organization Not Loaded
**Symptom:** `organization` is null even though user is authenticated  
**Cause:** AuthContext fails to load organization from `organization_members`  
**Fix:** Check AuthContext `loadUserData()` function

### Issue 3: No Organization Membership
**Symptom:** User authenticated but no membership record  
**Cause:** User not added to `organization_members` table  
**Fix:** Add user to `organization_members` table

### Issue 4: AuthContext Query Issue
**Symptom:** Organization query fails silently  
**Cause:** RLS policy on `organization_members` blocks query  
**Fix:** Verify `organization_members` SELECT policy allows user to see own membership

---

## 🔧 VERIFICATION QUERIES

### Check User Authentication Status
```sql
-- This would need to be run as the authenticated user
-- Cannot verify directly, but can check if user exists
SELECT id FROM user_profiles WHERE id = 'user-id-here';
```

### Check Organization Membership
```sql
SELECT 
  om.user_id,
  om.organization_id,
  om.role,
  o.name AS organization_name
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = 'user-id-here';
```

### Check INSERT Policy
```sql
SELECT 
  policyname,
  with_check AS policy_condition
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';
```

---

## 📝 RECOMMENDATIONS

### Immediate Fix Options

**Option 1: Ensure User is Authenticated**
- User must log in before creating requests
- Verify session is active

**Option 2: Verify Organization Loading**
- Check browser console for AuthContext errors
- Verify `organization` is loaded in AuthContext
- Check if `organization_members` query succeeds

**Option 3: Add User to Organization**
- If user exists but has no membership, add to `organization_members`
- Ensure `organization_id` matches existing organization

**Option 4: Check AuthContext Logic**
- Verify `loadUserData()` successfully queries `organization_members`
- Check if RLS policy on `organization_members` allows SELECT
- Verify `organization` state is set correctly

---

## 🎯 MOST LIKELY CAUSE

Based on the error and code analysis:

**Most Likely:** User is either:
1. **Not authenticated** (no session) → `organization` is null → `organization_id` is NULL → Policy blocks
2. **Authenticated but organization not loaded** → `organization` is null → `organization_id` is NULL → Policy blocks

**Less Likely:** User authenticated, organization loaded, but `organization.id` is undefined/null

---

## ✅ VERIFICATION STEPS

1. **Check Browser Console:**
   - Look for authentication errors
   - Check if `organization` is null in React DevTools
   - Verify AuthContext state

2. **Check Network Tab:**
   - Verify Supabase auth session exists
   - Check if `organization_members` query succeeds
   - Verify organization is loaded

3. **Check Application State:**
   - Verify user is logged in
   - Check if `useAuth().organization` returns null
   - Verify `organization.id` exists

---

**Status:** ⚠️ **BLOCKING ERROR** - User cannot create requests  
**Root Cause:** NULL `organization_id` violates INSERT policy  
**Next Step:** Verify user authentication and organization loading
