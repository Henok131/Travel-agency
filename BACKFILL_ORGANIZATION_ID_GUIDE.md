# Backfill organization_id - Execution Guide

**Date:** 2026-01-19  
**Purpose:** Safe backfilling of NULL `organization_id` values  
**Status:** Analysis queries ready, UPDATE statements proposed (not executed)

---

## 📋 Overview

This guide provides SQL queries to:
1. **Analyze** current NULL `organization_id` values
2. **Propose** safe UPDATE strategies
3. **Verify** results after updates

**All UPDATE statements are commented** - uncomment only after review.

---

## 🔍 Step 1: Run Analysis Queries

Execute all queries in `015_backfill_organization_id.sql` sections:
- **STEP 1:** Count NULL values
- **STEP 2:** Check existing organization_id values
- **STEP 3:** List available organizations
- **STEP 4:** Check requests/main_table relationships
- **STEP 5:** Sample NULL records

**Expected Output:**
- Counts of NULL vs non-NULL organization_id
- List of existing organizations
- Sample records to understand data structure

---

## 🎯 Step 2: Choose Backfill Strategy

### **Strategy A: Copy from Related Records** ✅ Recommended First

**Use when:** Some records have `organization_id` in one table but not the other

**Logic:**
- If `requests` has `organization_id` but `main_table` doesn't → copy to `main_table`
- If `main_table` has `organization_id` but `requests` doesn't → copy to `requests`

**Advantage:** Uses existing data, no assumptions needed

---

### **Strategy B: Assign to Single Organization**

**Use when:** All NULL records belong to one organization

**Requirements:**
- Know the organization UUID
- Confirm all NULL records should belong to this organization

**Steps:**
1. Get organization UUID:
   ```sql
   SELECT id, name FROM organizations;
   ```
2. Replace `'YOUR_ORGANIZATION_ID_HERE'` in UPDATE statements
3. Review and execute

---

### **Strategy C: Assign Based on User** (Future)

**Use when:** Tables have `user_id` field (currently not implemented)

**Note:** This requires schema changes first

---

### **Strategy D: Assign Based on Date/Business Logic**

**Use when:** You have business rules (e.g., "records before date X belong to org Y")

**Example:** All records created before 2025 belong to Organization A

---

## ✅ Step 3: Execute Updates (After Review)

### **Recommended Order:**

1. **Test with 1 record first:**
   ```sql
   -- Test update (only 1 row)
   UPDATE main_table m
   SET organization_id = r.organization_id
   FROM requests r
   WHERE m.id = r.id
     AND m.organization_id IS NULL
     AND r.organization_id IS NOT NULL
   LIMIT 1;
   
   -- Verify
   SELECT * FROM main_table 
   WHERE id = (
     SELECT id FROM main_table 
     WHERE organization_id IS NOT NULL 
     LIMIT 1
   );
   ```

2. **If test successful, run Strategy A updates:**
   ```sql
   -- Copy from requests to main_table
   UPDATE main_table m
   SET organization_id = r.organization_id
   FROM requests r
   WHERE m.id = r.id
     AND m.organization_id IS NULL
     AND r.organization_id IS NOT NULL;
   
   -- Copy from main_table to requests
   UPDATE requests r
   SET organization_id = m.organization_id
   FROM main_table m
   WHERE r.id = m.id
     AND r.organization_id IS NULL
     AND m.organization_id IS NOT NULL;
   ```

3. **If Strategy A doesn't cover all records, use Strategy B:**
   ```sql
   -- Replace UUID with actual organization ID
   UPDATE requests
   SET organization_id = 'YOUR_ORGANIZATION_ID_HERE'
   WHERE organization_id IS NULL;
   
   UPDATE main_table
   SET organization_id = 'YOUR_ORGANIZATION_ID_HERE'
   WHERE organization_id IS NULL;
   ```

---

## 🔍 Step 4: Verify Results

Run verification queries from STEP 7:

```sql
-- Check remaining NULL values
SELECT COUNT(*) AS remaining_null_requests FROM requests WHERE organization_id IS NULL;
SELECT COUNT(*) AS remaining_null_main_table FROM main_table WHERE organization_id IS NULL;

-- Verify organization_id values are valid
SELECT 
  r.organization_id,
  COUNT(*) AS count,
  CASE WHEN o.id IS NULL THEN 'INVALID' ELSE 'Valid' END AS status
FROM requests r
LEFT JOIN organizations o ON r.organization_id = o.id
GROUP BY r.organization_id, o.id
ORDER BY count DESC;
```

**Expected Result:** 
- `remaining_null_requests` = 0
- `remaining_null_main_table` = 0
- All `organization_id` values show "Valid" status

---

## ⚠️ Safety Checklist

Before executing any UPDATE:

- [ ] Database backup created
- [ ] Analysis queries (STEP 1-5) executed and reviewed
- [ ] Strategy chosen based on analysis results
- [ ] Test UPDATE run on 1 record first
- [ ] Test results verified
- [ ] Full UPDATE statements reviewed
- [ ] Organization UUID confirmed (if using Strategy B)
- [ ] Verification queries ready to run after updates

---

## 📊 Expected Scenarios

### **Scenario 1: All NULL, No Existing Values**

**Analysis Shows:**
- `rows_with_org_id` = 0 for both tables
- No existing organization_id values

**Action:** Use Strategy B (assign to single organization)

---

### **Scenario 2: Mixed NULL and Non-NULL**

**Analysis Shows:**
- Some records have `organization_id`, some don't
- Related records (same id) may have different values

**Action:** 
1. Use Strategy A first (copy from related records)
2. Then use Strategy B for remaining NULL values

---

### **Scenario 3: Requests Has Values, Main Table Doesn't**

**Analysis Shows:**
- `requests` has organization_id values
- `main_table` has NULL values
- Records are linked (same id)

**Action:** Use Strategy A (copy from requests to main_table)

---

## 🚨 Important Notes

1. **No Automatic Execution:** All UPDATE statements are commented
2. **Review First:** Always run analysis queries before updates
3. **Test First:** Test on 1 record before bulk updates
4. **Backup:** Always backup database before bulk updates
5. **Verify:** Always verify results after updates

---

## 📝 Example Execution Workflow

```sql
-- 1. Run analysis
-- (Execute STEP 1-5 queries from 015_backfill_organization_id.sql)

-- 2. Review results
-- Check: How many NULL? Any existing values? Available organizations?

-- 3. Test Strategy A (if applicable)
UPDATE main_table m
SET organization_id = r.organization_id
FROM requests r
WHERE m.id = r.id
  AND m.organization_id IS NULL
  AND r.organization_id IS NOT NULL
LIMIT 1; -- Test with 1 row

-- 4. Verify test
SELECT * FROM main_table WHERE organization_id IS NOT NULL LIMIT 1;

-- 5. If test OK, run full update
UPDATE main_table m
SET organization_id = r.organization_id
FROM requests r
WHERE m.id = r.id
  AND m.organization_id IS NULL
  AND r.organization_id IS NOT NULL;

-- 6. Run verification queries
-- (Execute STEP 7 queries)
```

---

**Status:** Ready for execution  
**Next Step:** Run analysis queries and choose strategy
