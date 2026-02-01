# Cash Paid Fields - Explanation

## Overview

The `main_table` has two related but different fields for tracking cash payments:

1. **`cash_paid`** - Boolean flag (Yes/No)
2. **`cash_paid_to_lst_account`** - Numeric amount (decimal)

---

## Field Details

### 1. `cash_paid` (Boolean)

**Database Type:** `BOOLEAN NOT NULL DEFAULT false`

**Display Label:** "Cash Paid"

**Purpose:** A flag/indicator that shows whether cash payment was made for this booking.

**Values:**
- `true` = Yes (cash was paid)
- `false` = No (cash was not paid)

**In UI:** Displayed as "Yes" or "No" in a dropdown

**Database Comment:** "Flag to indicate if payment was made in cash"

---

### 2. `cash_paid_to_lst_account` (Numeric)

**Database Type:** `NUMERIC(10,2)` (nullable)

**Display Label:** "Cash Paid to LST Account"

**Purpose:** The actual monetary amount of cash that was paid to the LST account.

**Values:**
- Any decimal number (e.g., 100.00, 250.50, 1500.00)
- `NULL` if no amount has been entered

**In UI:** Displayed as a numeric input field (can enter decimal amounts)

**Format:** Up to 10 digits total, 2 decimal places (e.g., 99999999.99)

---

## Key Differences

| Aspect | `cash_paid` | `cash_paid_to_lst_account` |
|--------|-------------|---------------------------|
| **Type** | Boolean (Yes/No) | Numeric (Amount) |
| **Purpose** | Indicates IF cash was paid | Shows HOW MUCH cash was paid |
| **Required** | Yes (NOT NULL, default: false) | No (nullable) |
| **Example Values** | true, false | 100.00, 250.50, 1500.00, NULL |
| **UI Display** | Dropdown (Yes/No) | Number input field |

---

## Current Implementation Status

### ✅ **What IS Implemented:**

1. **Both fields exist in database** (`main_table`)
2. **Both fields are editable** in the Main Table UI
3. **Both fields are displayed** in the table columns
4. **Data types are correctly handled:**
   - `cash_paid` is treated as boolean (Yes/No dropdown)
   - `cash_paid_to_lst_account` is treated as numeric (decimal input)

### ❌ **What is NOT Implemented (No Logic):**

**There is NO automatic logic or relationship between these fields.**

Currently:
- Setting `cash_paid = Yes` does NOT automatically set `cash_paid_to_lst_account`
- Setting `cash_paid_to_lst_account` to a value does NOT automatically set `cash_paid = Yes`
- There is NO validation that requires both to be set together
- There is NO calculation that uses these fields together
- They are **completely independent** fields

---

## Use Cases / Business Logic Scenarios

### Scenario 1: Cash Payment with Amount
- `cash_paid` = **Yes**
- `cash_paid_to_lst_account` = **250.00**
- **Meaning:** Customer paid 250.00 EUR in cash to LST account

### Scenario 2: Cash Payment Flag Only (No Amount Yet)
- `cash_paid` = **Yes**
- `cash_paid_to_lst_account` = **NULL** (or 0)
- **Meaning:** Cash payment was made, but amount not yet recorded

### Scenario 3: Amount Recorded but Flag Not Set
- `cash_paid` = **No**
- `cash_paid_to_lst_account` = **100.00**
- **Meaning:** Amount exists but flag not set (data inconsistency)

### Scenario 4: No Cash Payment
- `cash_paid` = **No**
- `cash_paid_to_lst_account` = **NULL**
- **Meaning:** No cash payment for this booking

---

## Potential Business Logic (Not Currently Implemented)

If you want to add automatic logic, here are some options:

### Option 1: Auto-set Flag When Amount is Entered
```javascript
// When cash_paid_to_lst_account is set to a value > 0
if (cash_paid_to_lst_account > 0) {
  cash_paid = true
}
```

### Option 2: Auto-set Amount When Flag is Set
```javascript
// When cash_paid is set to Yes
if (cash_paid === true && !cash_paid_to_lst_account) {
  // Prompt user to enter amount, or set to 0
  cash_paid_to_lst_account = 0
}
```

### Option 3: Validation (Require Both)
```javascript
// Validation: If cash_paid = Yes, require cash_paid_to_lst_account > 0
if (cash_paid === true && (!cash_paid_to_lst_account || cash_paid_to_lst_account <= 0)) {
  // Show error: "Please enter cash amount"
}
```

### Option 4: Auto-clear Amount When Flag is No
```javascript
// When cash_paid is set to No
if (cash_paid === false) {
  cash_paid_to_lst_account = null
}
```

---

## Recommendations

1. **Current State:** Fields work independently - users can set them separately
2. **If you want consistency:** Consider implementing validation or auto-logic (see options above)
3. **For reporting:** You can query both fields together to get complete cash payment information

---

## Database Schema Reference

```sql
-- From 002_create_main_table.sql

-- Payment / Accounting Columns
cash_paid BOOLEAN NOT NULL DEFAULT false,
-- Flag to indicate if payment was made in cash

-- Financial Amounts (NUMERIC / DECIMAL)
cash_paid_to_lst_account NUMERIC(10,2),
-- Actual amount of cash paid to LST account
```

---

## Summary

- **`cash_paid`** = Boolean flag (Yes/No) - "Was cash paid?"
- **`cash_paid_to_lst_account`** = Numeric amount - "How much cash was paid?"
- **No automatic logic** currently connects them
- They are **independent fields** that can be set separately
- Both fields are **editable** in the Main Table UI
