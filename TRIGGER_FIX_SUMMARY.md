# Trigger Fix Summary: sync_requests_to_main_table

**Date:** 2026-01-19  
**Task:** Fix sync_requests_to_main_table trigger to copy organization_id

---

## ✅ TASK COMPLETED

### **Trigger Function Updated**

The `sync_requests_to_main_table()` function has been updated to include `organization_id` in the INSERT operation.

**Function Definition:**
```sql
CREATE OR REPLACE FUNCTION sync_requests_to_main_table()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO main_table (
    id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    nationality,
    passport_number,
    departure_airport,
    destination_airport,
    travel_date,
    return_date,
    request_types,
    status,
    is_demo,
    ocr_source,
    ocr_confidence,
    organization_id,  -- ✅ ADDED
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.first_name,
    NEW.middle_name,
    NEW.last_name,
    NEW.date_of_birth,
    NEW.gender,
    NEW.nationality,
    NEW.passport_number,
    NEW.departure_airport,
    NEW.destination_airport,
    NEW.travel_date,
    NEW.return_date,
    NEW.request_types,
    NEW.status,
    NEW.is_demo,
    NEW.ocr_source,
    NEW.ocr_confidence,
    NEW.organization_id,  -- ✅ ADDED
    NEW.created_at,
    NEW.updated_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ VERIFICATION

### **Trigger Status:**
- ✅ **Function exists:** `sync_requests_to_main_table()`
- ✅ **Trigger attached:** `trigger_sync_requests_to_main_table` on `requests` table
- ✅ **Trigger enabled:** Active and will fire on INSERT
- ✅ **organization_id included:** Function copies `NEW.organization_id` to `main_table`

### **Behavior:**
- When a new row is inserted into `requests`:
  1. Trigger fires automatically
  2. Function copies all fields including `organization_id`
  3. `main_table` row is created with same `organization_id` as `requests` row

---

## 📋 CHANGES MADE

### **Before:**
- `organization_id` was NOT copied from `requests` to `main_table`
- `main_table` rows had NULL `organization_id` (or default value)

### **After:**
- `organization_id` is copied from `NEW.organization_id` to `main_table`
- `main_table` rows inherit the same `organization_id` as their source `requests` row

---

## 🎯 EXPECTED RESULT

### **For New Inserts:**
- ✅ `requests` table: `organization_id` set from `CreateRequest.jsx`
- ✅ `main_table` table: `organization_id` copied from `requests` via trigger
- ✅ Both tables have matching `organization_id` values

### **For Existing Rows:**
- ⚠️ Existing rows are NOT affected (only new inserts)
- ⚠️ Existing rows may still have NULL `organization_id` (requires backfill if needed)

---

## ✅ COMPLIANCE

### **Rules Followed:**
- ✅ Only modified `organization_id` field copying
- ✅ No other fields changed
- ✅ RLS not touched
- ✅ Application code not modified
- ✅ Trigger function updated only

---

## 📝 NOTES

1. **Trigger is automatic:** No application code changes needed
2. **Backward compatible:** Existing functionality unchanged
3. **RLS ready:** New rows will have `organization_id` for RLS policies
4. **Migration file:** `014_fix_organization_id_trigger.sql` contains the SQL

---

**Status:** ✅ **COMPLETE**  
**Trigger:** ✅ **UPDATED AND VERIFIED**  
**Result:** ✅ **main_table rows now inherit organization_id from requests**
