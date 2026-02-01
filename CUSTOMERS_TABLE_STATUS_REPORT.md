# Customers Table - End-to-End Status Report

**Generated:** 2026-01-19  
**Status:** ⚠️ **PARTIALLY IMPLEMENTED** - Table exists but not fully integrated

---

## 📊 EXECUTIVE SUMMARY

The `customers` table exists in the database with basic schema, but:
- ❌ **No data** (0 customers)
- ❌ **RLS disabled** (security risk)
- ❌ **Missing organization_id** (incompatible with RLS-SIMPLE)
- ⚠️ **Limited integration** with main application flow
- ✅ **UI exists** (`CustomersList.jsx`) but queries `main_table` instead of `customers` table

---

## 🗄️ DATABASE SCHEMA

### **Table: `customers`**

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| `id` | INTEGER | NO | `nextval('customers_id_seq')` | Primary key (auto-increment) |
| `name` | VARCHAR(255) | NO | - | Customer name (required) |
| `email` | VARCHAR(255) | NO | - | Customer email (required) |
| `phone` | VARCHAR(20) | YES | NULL | Phone number (optional) |
| `user_uid` | VARCHAR(255) | NO | - | User UID (required) |
| `status` | VARCHAR(20) | YES | NULL | Status (optional) |
| `created_at` | TIMESTAMP | YES | `CURRENT_TIMESTAMP` | Creation timestamp |
| `tenant_id` | UUID | YES | NULL | Tenant ID (legacy multi-tenancy) |

**Total Columns:** 8  
**Primary Key:** `id` (INTEGER, auto-increment)  
**Total Rows:** 0 (empty table)

---

## 🔗 RELATIONSHIPS

### **Foreign Keys:**

1. **`customers.tenant_id` → `tenants.id`**
   - Legacy multi-tenancy relationship
   - ⚠️ **Issue:** Uses `tenant_id` instead of `organization_id`
   - ⚠️ **Issue:** Not compatible with current RLS-SIMPLE architecture

2. **`orders.customer_id` → `customers.id`**
   - `orders` table references `customers`
   - ⚠️ **Note:** `orders` table may not be actively used

### **Missing Relationships:**

- ❌ **No direct link** to `main_table` (bookings/requests)
- ❌ **No direct link** to `requests` table
- ❌ **No direct link** to `invoices` table
- ❌ **No direct link** to `expenses` table

---

## 🔒 SECURITY STATUS

### **Row Level Security (RLS):**

- ❌ **RLS Disabled** (`rowsecurity = false`)
- ❌ **No RLS Policies** (0 policies found)
- ⚠️ **Security Risk:** All data accessible without authentication

### **Multi-Tenancy:**

- ❌ **Missing `organization_id` column**
- ⚠️ **Uses `tenant_id`** (legacy architecture)
- ❌ **Not compatible** with RLS-SIMPLE setup

---

## 💻 FRONTEND IMPLEMENTATION

### **Component: `src/pages/CustomersList.jsx`**

**Status:** ✅ **UI EXISTS** but queries wrong table

**Current Behavior:**
- ✅ Displays customer list with statistics
- ✅ Shows customer name, passport number, nationality
- ✅ Shows total bookings, total spent, last booking date
- ✅ Supports search and filtering
- ✅ Supports monthly grouping
- ✅ Bilingual (EN/DE)

**Data Source:**
- ⚠️ **Queries `main_table`** instead of `customers` table
- ⚠️ **Derives customers** from booking data (passenger names)
- ⚠️ **No direct integration** with `customers` table

**Query Pattern:**
```javascript
// Current implementation queries main_table
const { data, error } = await supabase
  .from('main_table')
  .select('*')
  .order('created_at', { ascending: false })

// Then groups by passenger name to create "customers"
const customerMap = {}
data.forEach(booking => {
  const key = `${booking.first_name}_${booking.last_name}_${booking.passport_number}`
  if (!customerMap[key]) {
    customerMap[key] = {
      name: `${booking.first_name} ${booking.last_name}`,
      passportNumber: booking.passport_number,
      nationality: booking.nationality,
      bookings: []
    }
  }
  customerMap[key].bookings.push(booking)
})
```

**Displayed Columns:**
- Customer Name (from `first_name` + `last_name`)
- Passport Number
- Nationality
- Total Bookings (count)
- Total Spent (calculated from bookings)
- Last Booking Date
- Status (Active/Inactive based on last booking)

---

## 🔄 INTEGRATION STATUS

### **Integration with Other Tables:**

| Table | Relationship | Status | Notes |
|-------|-------------|--------|-------|
| `main_table` | None | ❌ | No foreign key, customers derived from passenger names |
| `requests` | None | ❌ | No foreign key |
| `invoices` | None | ❌ | No foreign key |
| `expenses` | None | ❌ | No foreign key |
| `orders` | `orders.customer_id → customers.id` | ⚠️ | Foreign key exists but `orders` table may not be used |

### **Integration Points:**

1. **Create Request Flow:**
   - ❌ Does not create/update `customers` table
   - ❌ Only creates `requests` and `main_table` entries

2. **Booking Management:**
   - ❌ Does not link bookings to `customers` table
   - ⚠️ Customers are derived from `main_table` passenger data

3. **Invoice Generation:**
   - ❌ Does not reference `customers` table
   - ⚠️ Uses passenger data from `main_table`

---

## 📋 CURRENT WORKFLOW

### **How Customers Are Currently Handled:**

1. **Customer Creation:**
   - ❌ **Not created** when a request is submitted
   - ❌ **Not created** when a booking is made
   - ⚠️ Customers are **derived** from existing bookings

2. **Customer Display:**
   - ✅ **UI shows** customers from `main_table` data
   - ✅ **Groups** bookings by passenger name + passport
   - ✅ **Calculates** statistics (total bookings, total spent)

3. **Customer Updates:**
   - ❌ **No update mechanism** for `customers` table
   - ❌ **No edit functionality** in UI
   - ⚠️ Changes to bookings don't update `customers` table

---

## ⚠️ ISSUES & GAPS

### **Critical Issues:**

1. **No Data:**
   - ❌ Table is empty (0 customers)
   - ❌ No customer creation flow

2. **Security:**
   - ❌ RLS disabled (security risk)
   - ❌ No access control

3. **Architecture Mismatch:**
   - ❌ Missing `organization_id` (incompatible with RLS-SIMPLE)
   - ⚠️ Uses `tenant_id` (legacy)

4. **Integration:**
   - ❌ Not integrated with request/booking creation
   - ❌ UI queries wrong table (`main_table` instead of `customers`)

### **Missing Features:**

- ❌ Customer creation form
- ❌ Customer edit functionality
- ❌ Customer deletion
- ❌ Customer contact information management
- ❌ Customer notes/history
- ❌ Customer search in `customers` table
- ❌ Customer linking to bookings

---

## 🎯 RECOMMENDATIONS

### **Immediate Actions:**

1. **Enable RLS:**
   - Add `organization_id` column
   - Enable RLS on `customers` table
   - Create RLS policies (similar to `main_table`, `requests`, `expenses`)

2. **Fix Integration:**
   - Update `CustomersList.jsx` to query `customers` table
   - Create customers when requests/bookings are created
   - Link bookings to customers via foreign key

3. **Add Missing Columns:**
   - Add `organization_id` (UUID, references `organizations.id`)
   - Consider adding: `notes`, `address`, `birth_date`, `passport_number`

### **Future Enhancements:**

- Customer creation form
- Customer edit/delete functionality
- Customer history/interaction tracking
- Customer notes system
- Customer contact preferences
- Customer birthday/holiday reminders

---

## 📊 SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **Table Exists** | ✅ | `customers` table exists |
| **Schema** | ⚠️ | 8 columns, missing `organization_id` |
| **Data** | ❌ | 0 customers |
| **RLS** | ❌ | Disabled, no policies |
| **UI Component** | ✅ | `CustomersList.jsx` exists |
| **Data Source** | ⚠️ | Queries `main_table`, not `customers` |
| **Integration** | ❌ | Not integrated with request/booking flow |
| **Security** | ❌ | RLS disabled, missing `organization_id` |
| **Multi-Tenancy** | ⚠️ | Uses `tenant_id` (legacy) |

---

## 🔍 CODE REFERENCES

**Frontend:**
- `src/pages/CustomersList.jsx` - Customer list UI (queries `main_table`)
- `src/App.jsx:58` - Route: `/customers` → `CustomersList`

**Database:**
- Table: `public.customers`
- Foreign Key: `orders.customer_id → customers.id`
- Foreign Key: `customers.tenant_id → tenants.id`

---

**Status:** ⚠️ **TABLE EXISTS BUT NOT FULLY INTEGRATED**  
**Priority:** 🔴 **HIGH** - Security and integration issues need to be addressed
