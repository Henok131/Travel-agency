# RLS INSERT Error - Findings Report

**Date:** 2026-01-19  
**Error:** "new row violates row-level security policy for table 'requests'"  
**Task:** READ-ONLY diagnosis

---

## 🔍 ROOT CAUSE IDENTIFIED

### **Issue: NULL organization_id Blocks INSERT**

**Error Location:** `CreateRequest.jsx` - Insert operation (line 2186)

**Code Pattern:**
```javascript
organization_id: organization?.id || null
```

**Problem:**
- If `organization` is null → `organization_id` becomes NULL
- INSERT policy requires: `organization_id IN (user's organizations)`
- `NULL IN (...)` evaluates to FALSE → Policy blocks insert ❌

---

## 📋 FINDINGS

### ✅ **Policy Structure: CORRECT**
- INSERT policy exists and is correctly configured
- Policy logic is sound

### ⚠️ **Issue: organization Not Loaded in AuthContext**

**AuthContext Logic (lines 86-100):**
```javascript
// Try to get first organization membership
const { data: members, error: membersError } = await supabase
  .from('organization_members')
  .select('*, organization:organizations(*)')
  .eq('user_id', userId)
  .limit(1)
  .single()

if (!membersError && members?.organization) {
  setOrganization(members.organization)
} else {
  setUserProfile(profile)  // ⚠️ organization stays null
}
```

**Potential Issues:**
1. **`.single()` fails if no results** → `membersError` → `organization` stays null
2. **RLS policy blocks query** → `membersError` → `organization` stays null
3. **Organization join fails** → `members.organization` is null → `organization` stays null

---

## 🎯 MOST LIKELY CAUSES

### **Cause 1: User Not Authenticated** ⚠️ **LIKELY**
- If user is not logged in, `auth.uid()` is NULL
- `organization_members` query returns no results
- `organization` stays null
- **Result:** INSERT fails with RLS error

### **Cause 2: RLS Policy Blocks organization_members Query** ⚠️ **POSSIBLE**
- `organization_members` SELECT policy: `user_id = auth.uid()`
- If user not authenticated, `auth.uid()` is NULL
- Query returns no results
- `organization` stays null
- **Result:** INSERT fails with RLS error

### **Cause 3: organization_members Query Fails** ⚠️ **POSSIBLE**
- Query uses `.single()` which fails if 0 or 2+ results
- If query fails, `membersError` exists
- `organization` stays null
- **Result:** INSERT fails with RLS error

---

## 📊 VERIFICATION RESULTS

### ✅ **Organization Membership Exists**
- User ID: `df18b50e-c984-407e-853b-441fd1806098`
- Organization ID: `e17ed5ec-a533-4803-9568-e317ad1f9b3f`
- Role: member
- **Status:** ✅ Membership exists in database

### ✅ **INSERT Policy Exists**
- Policy: "Users can insert their organization requests"
- Condition: `organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())`
- **Status:** ✅ Policy correctly configured

### ⚠️ **User Profile Has NULL organization_id**
- User profile: `organization_id` = NULL
- **Impact:** AuthContext tries to load from `organization_members` (fallback)

---

## 🔍 DIAGNOSIS

### **Scenario Analysis:**

**If User is Authenticated:**
1. AuthContext queries `organization_members` WHERE `user_id = auth.uid()`
2. RLS policy allows: `user_id = auth.uid()` ✅
3. Query should return membership record ✅
4. `organization` should be set ✅
5. INSERT should work ✅

**If User is NOT Authenticated:**
1. `auth.uid()` is NULL
2. `organization_members` query: `WHERE user_id = NULL` → No results
3. `organization` stays null ❌
4. INSERT: `organization_id = null` ❌
5. Policy blocks: `NULL IN (...)` → FALSE ❌
6. **Result:** Error message

---

## ⚠️ FINDINGS SUMMARY

### **Blocking Issue:**
- ❌ **INSERT fails when `organization_id` is NULL**
- ⚠️ **Most likely:** User is not authenticated OR organization not loaded

### **Policy Behavior:**
- ✅ Policies are correctly configured
- ✅ Policies work as designed (block NULL organization_id)

### **Code Behavior:**
- ✅ Code includes `organization_id` in insert
- ⚠️ **Issue:** `organization?.id` can be null if user not authenticated or organization not loaded

---

## 🎯 CONCLUSION

**Status:** ⚠️ **BLOCKING ERROR**

**Root Cause:** 
- User attempting to insert without valid `organization_id`
- Most likely: User not authenticated OR `organization` not loaded in AuthContext

**Policy Behavior:** ✅ **CORRECT** - Policies are working as designed

**Application Behavior:** ⚠️ **EXPECTED** - RLS correctly blocks unauthorized inserts

**Next Steps:**
1. Verify user is authenticated (has valid session)
2. Verify `organization` is loaded in AuthContext
3. Check browser console for AuthContext errors
4. Verify `organization_members` query succeeds

---

**Report Generated:** 2026-01-19  
**Status:** ⚠️ **BLOCKING ERROR** - User cannot create requests  
**Cause:** NULL `organization_id` violates INSERT policy  
**Action Required:** Verify authentication and organization loading
