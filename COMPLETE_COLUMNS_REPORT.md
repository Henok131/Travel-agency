# LST Travel - Complete Columns Report

**Generated:** 2026-01-19  
**Purpose:** Complete reference for all columns in Main Table, including order, logic, formulas, dependencies, and behaviors

---

## 📋 COLUMN ORDER (Current Sequence)

The columns are displayed in the following order (left to right in the table):

| # | Column Name | Field Name | Type | Editable | Storage |
|---|-------------|------------|------|----------|---------|
| 1 | `#` | `row_number` | Computed | ❌ No | Not stored |
| 2 | `Booking Ref` | `booking_ref` | TEXT | ✅ Yes | Database |
| 3 | `Booking Status` | `booking_status` | TEXT | ✅ Yes | Database |
| 4 | `Print Invoice` | `print_invoice` | BOOLEAN | ✅ Yes | Database |
| 5 | `First Name` | `first_name` | TEXT | ✅ Yes | Database |
| 6 | `Middle Name` | `middle_name` | TEXT | ✅ Yes | Database |
| 7 | `Last Name` | `last_name` | TEXT | ✅ Yes | Database |
| 8 | `Date of Birth` | `date_of_birth` | DATE | ✅ Yes | Database |
| 9 | `Gender` | `gender` | TEXT | ✅ Yes | Database |
| 10 | `Passport Number` | `passport_number` | TEXT | ✅ Yes | Database |
| 11 | `Travel Details` | `travel_details` | Computed | ❌ No | Not stored (contains: nationality, departure_airport, destination_airport, travel_date, return_date, airlines, notice) |
| 12 | `Request Types` | `request_types` | JSONB | ✅ Yes | Database |
| 13 | `Airlines Price` | `airlines_price` | NUMERIC(10,2) | ✅ Yes | Database |
| 14 | `Service Ticket` | `service_fee` | NUMERIC(10,2) | ✅ Yes | Database |
| 15 | `Total Ticket Price` | `total_ticket_price` | NUMERIC(10,2) | ❌ **AUTO** | Database |
| 16 | `Visa Price` | `visa_price` | NUMERIC(10,2) | ✅ Yes | Database |
| 17 | `Service Visa` | `service_visa` | NUMERIC(10,2) | ✅ Yes | Database |
| 18 | `Total Visa Fees` | `tot_visa_fees` | NUMERIC(10,2) | ❌ **AUTO** | Database |
| 19 | `Total Amount Due` | `total_amount_due` | NUMERIC(10,2) | ❌ **AUTO** | Database |
| 20 | `Cash Paid` | `cash_paid` | NUMERIC(10,2) | ✅ Yes | Database |
| 21 | `Bank Transfer` | `bank_transfer` | NUMERIC(10,2) | ✅ Yes | Database |
| 22 | `Total Customer Payment` | `total_customer_payment` | NUMERIC(10,2) | ❌ **AUTO** | Database |
| 23 | `Payment Balance` | `payment_balance` | Computed | ❌ **Display** | **NOT stored** |
| 24 | `Commission from Airlines` | `commission_from_airlines` | NUMERIC(10,2) | ✅ Yes | Database |
| 25 | `LST Loan Fee` | `lst_loan_fee` | NUMERIC(10,2) | ✅ Yes | Database |
| 26 | `LST Profit` | `lst_profit` | NUMERIC(10,2) | ❌ **AUTO** | Database |
| 27 | `Created At` | `created_at` | TIMESTAMPTZ | ❌ No | Database |

**Total Columns:** 27  
**Editable Columns:** 16  
**Auto-Calculated Columns:** 6  
**Display-Only Columns:** 2  
**Computed Columns:** 2

---

## 🔄 AUTO-CALCULATED FIELDS (Detailed Logic)

### **1. `total_ticket_price`** (Column 15)
**Formula:** `total_ticket_price = service_fee + airlines_price`

**Dependencies:**
- `service_fee` (Column 14)
- `airlines_price` (Column 13)

**Calculation Logic:**
- **Real-time:** Updates immediately when `service_fee` or `airlines_price` is being edited
- **On Save:** Auto-calculates and saves to database when `service_fee` or `airlines_price` changes
- **On Load:** Calculated during initial data fetch

**Display:**
- Shows with 2 decimal places (e.g., `998.00`)
- Shows `-` if result is 0 or empty
- Read-only field with grey background

**Trigger Fields:**
- `service_fee` changes
- `airlines_price` changes

**Database:** ✅ Stored in `main_table.total_ticket_price`

---

### **2. `tot_visa_fees`** (Column 18)
**Formula:** `tot_visa_fees = visa_price + service_visa`

**Dependencies:**
- `visa_price` (Column 16)
- `service_visa` (Column 17)

**Calculation Logic:**
- **Real-time:** Updates immediately when `visa_price` or `service_visa` is being edited
- **On Save:** Auto-calculates and saves to database when `visa_price` or `service_visa` changes
- **On Load:** Calculated during initial data fetch

**Display:**
- Shows with 2 decimal places (e.g., `10.00`)
- Shows `-` if result is 0 or empty
- Read-only field with grey background

**Trigger Fields:**
- `visa_price` changes
- `service_visa` changes

**Database:** ✅ Stored in `main_table.tot_visa_fees`

---

### **3. `total_amount_due`** (Column 19)
**Formula:** `total_amount_due = total_ticket_price + tot_visa_fees`

**Dependencies:**
- `total_ticket_price` (Column 15) → depends on `service_fee` + `airlines_price`
- `tot_visa_fees` (Column 18) → depends on `visa_price` + `service_visa`

**Calculation Logic:**
- **Real-time:** Updates immediately when any component field is being edited
- **On Save:** Auto-calculates and saves to database when any component field changes
- **On Load:** Calculated during initial data fetch

**Cascade Triggers:**
- `service_fee` changes → `total_ticket_price` updates → `total_amount_due` updates
- `airlines_price` changes → `total_ticket_price` updates → `total_amount_due` updates
- `visa_price` changes → `tot_visa_fees` updates → `total_amount_due` updates
- `service_visa` changes → `tot_visa_fees` updates → `total_amount_due` updates

**Display:**
- Shows with 2 decimal places (e.g., `1008.00`)
- Shows `-` if result is 0 or empty
- Read-only field with grey background

**Trigger Fields:**
- `total_ticket_price` changes
- `tot_visa_fees` changes
- `service_fee` changes (cascades)
- `airlines_price` changes (cascades)
- `visa_price` changes (cascades)
- `service_visa` changes (cascades)

**Database:** ✅ Stored in `main_table.total_amount_due`

---

### **4. `total_customer_payment`** (Column 22)
**Formula:** `total_customer_payment = cash_paid + bank_transfer`

**Dependencies:**
- `cash_paid` (Column 20)
- `bank_transfer` (Column 21)

**Calculation Logic:**
- **Real-time:** Updates immediately when `cash_paid` or `bank_transfer` is being edited
- **On Save:** Auto-calculates and saves to database when `cash_paid` or `bank_transfer` changes
- **On Load:** Calculated during initial data fetch

**Display:**
- Shows with 2 decimal places (e.g., `1050.00`)
- Shows `-` if result is 0 or empty
- Read-only field with grey background

**Trigger Fields:**
- `cash_paid` changes
- `bank_transfer` changes

**Database:** ✅ Stored in `main_table.total_customer_payment`

---

### **5. `lst_profit`** (Column 26)
**Formula:** `lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee`

**Dependencies:**
- `service_fee` (Column 14)
- `service_visa` (Column 17)
- `commission_from_airlines` (Column 24)
- `lst_loan_fee` (Column 25)

**Calculation Logic:**
- **Real-time:** Updates immediately when any component field is being edited
- **On Save:** Auto-calculates and saves to database when any component field changes
- **On Load:** Calculated during initial data fetch

**Display:**
- Shows with 2 decimal places (e.g., `905.00`)
- Shows `-` if result is 0 or empty
- Read-only field with grey background

**Trigger Fields:**
- `service_fee` changes
- `service_visa` changes
- `commission_from_airlines` changes
- `lst_loan_fee` changes

**Database:** ✅ Stored in `main_table.lst_profit`

---

### **6. `payment_balance`** (Column 23)
**Formula:** `payment_balance = total_customer_payment - total_amount_due`

**Dependencies:**
- `total_customer_payment` (Column 22) → depends on `cash_paid` + `bank_transfer`
- `total_amount_due` (Column 19) → depends on `total_ticket_price` + `tot_visa_fees`

**Calculation Logic:**
- **Real-time:** Updates immediately when any component field is being edited
- **Display-only:** NOT stored in database (computed on-the-fly)
- **On Load:** Calculated during initial data fetch

**Display Logic (Color-Coded):**
- **Green background** (`#4caf50`) if `balance = 0` → Shows: `✅ Fully Paid`
- **Yellow background** (`#ffc107`) if `balance > 0` → Shows: `⚠️ Overpaid: €X.XX`
- **Red background** (`#f44336`) if `balance < 0` → Shows: `🔴 Underpaid: €X.XX`

**Examples:**
- Customer paid: 600, Amount due: 600 → `✅ Fully Paid` (green)
- Customer paid: 650, Amount due: 600 → `⚠️ Overpaid: €50.00` (yellow)
- Customer paid: 550, Amount due: 600 → `🔴 Underpaid: €50.00` (red)

**Cascade Triggers:**
- `cash_paid` changes → `total_customer_payment` updates → `payment_balance` updates
- `bank_transfer` changes → `total_customer_payment` updates → `payment_balance` updates
- `total_ticket_price` changes → `total_amount_due` updates → `payment_balance` updates
- `tot_visa_fees` changes → `total_amount_due` updates → `payment_balance` updates

**Trigger Fields:**
- `total_customer_payment` changes
- `total_amount_due` changes
- `cash_paid` changes (cascades)
- `bank_transfer` changes (cascades)
- `service_fee` changes (cascades)
- `airlines_price` changes (cascades)
- `visa_price` changes (cascades)
- `service_visa` changes (cascades)

**Database:** ❌ **NOT stored** (display-only indicator)

---

## 🔗 CALCULATION DEPENDENCY CHAIN

```
INPUT FIELDS
├── airlines_price (13)
├── service_fee (14) ────────────┐
├── visa_price (16)               │
├── service_visa (17) ────────────┤
├── cash_paid (20)                │
├── bank_transfer (21)            │
├── commission_from_airlines (24) │
└── lst_loan_fee (25)             │
                                  │
CALCULATED LEVEL 1                │
├── total_ticket_price (15) ←─────┘
│   = service_fee + airlines_price
│
├── tot_visa_fees (18) ←──────────┘
│   = visa_price + service_visa
│
└── total_customer_payment (22) ←─┘
    = cash_paid + bank_transfer
                                  │
CALCULATED LEVEL 2                │
├── total_amount_due (19) ←───────┤
│   = total_ticket_price + tot_visa_fees
│
└── lst_profit (26) ←─────────────┘
    = service_fee + service_visa + commission_from_airlines - lst_loan_fee
                                  │
DISPLAY-ONLY                      │
└── payment_balance (23) ←────────┘
    = total_customer_payment - total_amount_due
    (Color-coded: green/yellow/red)
```

---

## 📊 DETAILED COLUMN SPECIFICATIONS

### **System Columns**

#### **1. `row_number`** (Column 1)
- **Type:** Computed (not stored)
- **Display:** Sequential row number (1, 2, 3...)
- **Logic:** Incremental counter based on filtered/sorted data
- **Editable:** ❌ No
- **Database:** ❌ Not stored

---

### **Booking Columns**

#### **2. `booking_ref`** (Column 2)
- **Type:** TEXT
- **Display:** Booking reference number
- **Logic:** User-entered reference code
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.booking_ref`

#### **3. `booking_status`** (Column 3)
- **Type:** TEXT
- **Display:** Color-coded dropdown
- **Options:**
  - `pending` → Yellow background (`#ffd700`), black text
  - `confirmed` → Green background (`#90ee90`), black text
  - `cancelled` → Red background (`#ff6b6b`), white text
- **Logic:** Single dropdown with custom arrow, color-coded
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.booking_status` (NOT NULL, default: 'pending')

#### **4. `print_invoice`** (Column 4)
- **Type:** BOOLEAN
- **Display:** Checkbox
- **Logic:** Flag to indicate if invoice should be printed
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.print_invoice` (NOT NULL, default: false)

---

### **Passenger Information Columns**

#### **5-10. Passenger Details** (Columns 5-10)
- **5. `first_name`** - TEXT, NOT NULL, ✅ Editable
- **6. `middle_name`** - TEXT, nullable, ✅ Editable
- **7. `last_name`** - TEXT, NOT NULL, ✅ Editable
- **8. `date_of_birth`** - DATE, nullable, ✅ Editable
- **9. `gender`** - TEXT, nullable, ✅ Editable (typically M/F/Other)
- **10. `passport_number`** - TEXT, nullable, ✅ Editable

**Database:** All stored in `main_table`

---

### **Travel Information Columns**

#### **11. `travel_details`** (Column 11)
- **Type:** Computed (expandable panel)
- **Display:** Expandable panel with toggle button (▶/▼)
- **Contains (Not displayed as separate columns):**
  - `nationality` - TEXT, ✅ Editable
  - `departure_airport` - TEXT, ✅ Editable
  - `destination_airport` - TEXT, ✅ Editable
  - `travel_date` - DATE, ✅ Editable
  - `return_date` - DATE, ✅ Editable
  - `airlines` - TEXT, ✅ Editable (autocomplete with search by name, code, country)
  - `notice` - TEXT, ✅ Editable (multiline textarea)
- **Logic:**
  - Toggle button to expand/collapse panel
  - Only one panel can be open at a time
  - Panel collapses when clicking outside
  - Panel remains stable while editing any field within it
- **Editable:** ❌ No (but fields within panel are editable)
- **Database:** ✅ All nested fields stored separately in `main_table`

---

### **Request Columns**

#### **12. `request_types`** (Column 12)
- **Type:** JSONB
- **Display:** Comma-separated list
- **Options:** `["flight", "visa", "package", "other"]`
- **Logic:** Multiple selection (stored as JSONB array)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.request_types` (NOT NULL)

---

### **Ticket Cost Columns**

#### **13. `airlines_price`** (Column 13)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Validation:**
  - ✅ Positive numbers only (min: 0)
  - ❌ Negative numbers blocked
- **Logic:** Price charged by airlines
- **Triggers:** Updates `total_ticket_price` (Column 15)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.airlines_price`

#### **14. `service_fee`** (Column 14) - **Label: "Service Ticket"**
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Validation:**
  - ✅ Positive numbers only (min: 0)
  - ❌ Negative numbers blocked
- **Logic:** Service fee charged to customer for ticket
- **Triggers:**
  - Updates `total_ticket_price` (Column 15)
  - Updates `lst_profit` (Column 26)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.service_fee`

#### **15. `total_ticket_price`** (Column 15) - **AUTO-CALCULATED**
- **Type:** NUMERIC(10,2)
- **Formula:** `total_ticket_price = service_fee + airlines_price`
- **Display:** Read-only, grey background, 2 decimal places
- **Logic:** Auto-calculated sum of service fee and airlines price
- **Triggers:** Updates `total_amount_due` (Column 19)
- **Editable:** ❌ No
- **Database:** ✅ `main_table.total_ticket_price`

---

### **Visa Cost Columns**

#### **16. `visa_price`** (Column 16)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** Base visa price
- **Triggers:** Updates `tot_visa_fees` (Column 18)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.visa_price`

#### **17. `service_visa`** (Column 17)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** Service fee for visa processing
- **Triggers:**
  - Updates `tot_visa_fees` (Column 18)
  - Updates `lst_profit` (Column 26)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.service_visa`

#### **18. `tot_visa_fees`** (Column 18) - **AUTO-CALCULATED**
- **Type:** NUMERIC(10,2)
- **Formula:** `tot_visa_fees = visa_price + service_visa`
- **Display:** Read-only, grey background, 2 decimal places
- **Logic:** Auto-calculated sum of visa price and service visa
- **Triggers:** Updates `total_amount_due` (Column 19)
- **Editable:** ❌ No
- **Database:** ✅ `main_table.tot_visa_fees`

---

### **Amount Due Column**

#### **19. `total_amount_due`** (Column 19) - **AUTO-CALCULATED**
- **Type:** NUMERIC(10,2)
- **Formula:** `total_amount_due = total_ticket_price + tot_visa_fees`
- **Display:** Read-only, grey background, 2 decimal places
- **Logic:** Total amount due from customer (ticket + visa)
- **Triggers:** Updates `payment_balance` (Column 23)
- **Editable:** ❌ No
- **Database:** ✅ `main_table.total_amount_due`

---

### **Payment Columns**

#### **20. `cash_paid`** (Column 20)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** Amount of cash paid by customer
- **Triggers:** Updates `total_customer_payment` (Column 22)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.cash_paid`

#### **21. `bank_transfer`** (Column 21)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** Amount of bank transfer payment
- **Triggers:** Updates `total_customer_payment` (Column 22)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.bank_transfer`

#### **22. `total_customer_payment`** (Column 22) - **AUTO-CALCULATED**
- **Type:** NUMERIC(10,2)
- **Formula:** `total_customer_payment = cash_paid + bank_transfer`
- **Display:** Read-only, grey background, 2 decimal places
- **Logic:** Total customer payment to LST (mixed payment)
- **Triggers:** Updates `payment_balance` (Column 23)
- **Editable:** ❌ No
- **Database:** ✅ `main_table.total_customer_payment`

#### **23. `payment_balance`** (Column 23) - **DISPLAY-ONLY**
- **Type:** Computed (not stored)
- **Formula:** `payment_balance = total_customer_payment - total_amount_due`
- **Display:** Color-coded indicator
  - **Green** (`#4caf50`) if `= 0` → `✅ Fully Paid`
  - **Yellow** (`#ffc107`) if `> 0` → `⚠️ Overpaid: €X.XX`
  - **Red** (`#f44336`) if `< 0` → `🔴 Underpaid: €X.XX`
- **Logic:** Visual indicator of payment status
- **Editable:** ❌ No
- **Database:** ❌ **NOT stored** (computed on-the-fly)

---

### **Financial Columns**

#### **24. `commission_from_airlines`** (Column 24)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** Commission received from airlines (manual entry)
- **Triggers:** Updates `lst_profit` (Column 26)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.commission_from_airlines`

#### **25. `lst_loan_fee`** (Column 25)
- **Type:** NUMERIC(10,2)
- **Display:** Number input with 2 decimal places
- **Logic:** LST loan fee (manual entry, subtracted from profit)
- **Triggers:** Updates `lst_profit` (Column 26)
- **Editable:** ✅ Yes
- **Database:** ✅ `main_table.lst_loan_fee`

#### **26. `lst_profit`** (Column 26) - **AUTO-CALCULATED**
- **Type:** NUMERIC(10,2)
- **Formula:** `lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee`
- **Display:** Read-only, grey background, 2 decimal places
- **Logic:** LST profit after all fees and commissions
- **Editable:** ❌ No
- **Database:** ✅ `main_table.lst_profit`

---

### **System Columns**

#### **27. `created_at`** (Column 27)
- **Type:** TIMESTAMPTZ
- **Display:** Date and time
- **Logic:** Creation timestamp (automatic, not editable)
- **Editable:** ❌ No
- **Database:** ✅ `main_table.created_at` (NOT NULL)

---

## 🧮 FORMULA REFERENCE

### **Direct Formulas:**
1. `total_ticket_price = service_fee + airlines_price`
2. `tot_visa_fees = visa_price + service_visa`
3. `total_amount_due = total_ticket_price + tot_visa_fees`
4. `total_customer_payment = cash_paid + bank_transfer`
5. `lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee`
6. `payment_balance = total_customer_payment - total_amount_due` (display-only)

### **Expanded Formulas:**
1. `total_ticket_price = service_fee + airlines_price`
2. `tot_visa_fees = visa_price + service_visa`
3. `total_amount_due = (service_fee + airlines_price) + (visa_price + service_visa)`
4. `total_customer_payment = cash_paid + bank_transfer`
5. `lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee`
6. `payment_balance = (cash_paid + bank_transfer) - ((service_fee + airlines_price) + (visa_price + service_visa))`

---

## ⚙️ REAL-TIME UPDATE LOGIC

### **When Editing `service_fee`:**
1. Updates `total_ticket_price` (immediately visible)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)
4. Updates `lst_profit` (immediately visible)

### **When Editing `airlines_price`:**
1. Updates `total_ticket_price` (immediately visible)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)

### **When Editing `visa_price`:**
1. Updates `tot_visa_fees` (immediately visible)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)

### **When Editing `service_visa`:**
1. Updates `tot_visa_fees` (immediately visible)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)
4. Updates `lst_profit` (immediately visible)

### **When Editing `cash_paid`:**
1. Updates `total_customer_payment` (immediately visible)
2. Updates `payment_balance` (cascades)

### **When Editing `bank_transfer`:**
1. Updates `total_customer_payment` (immediately visible)
2. Updates `payment_balance` (cascades)

### **When Editing `commission_from_airlines`:**
1. Updates `lst_profit` (immediately visible)

### **When Editing `lst_loan_fee`:**
1. Updates `lst_profit` (immediately visible)

---

## 💾 DATABASE STORAGE

### **Stored Fields (25 columns):**
All editable fields + all auto-calculated fields are stored in the database:

**Editable Fields (16):**
- `booking_ref`, `booking_status`, `print_invoice`
- `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `passport_number`
- `request_types`
- `nationality`, `departure_airport`, `destination_airport`, `travel_date`, `return_date`, `airlines`, `notice` (within travel_details)
- `airlines_price`, `service_fee`, `visa_price`, `service_visa`
- `cash_paid`, `bank_transfer`
- `commission_from_airlines`, `lst_loan_fee`

**Auto-Calculated Fields (6):**
- `total_ticket_price`
- `tot_visa_fees`
- `total_amount_due`
- `total_customer_payment`
- `lst_profit`
- `created_at` (system)

### **NOT Stored (2 fields):**
- `row_number` - Computed on-the-fly
- `payment_balance` - Display-only indicator (computed on-the-fly)

---

## 🎨 DISPLAY FORMATTING

### **Numeric Fields:**
- **Input Fields:** Number input with 2 decimal places
- **Calculated Fields:** Display with 2 decimal places or `-` if 0/empty
- **Read-only Fields:** Grey background (`var(--bg-secondary)`), grey text (`var(--text-secondary)`)

### **Color-Coded Fields:**
- **`booking_status`:**
  - Pending: Yellow (`#ffd700`), black text
  - Confirmed: Green (`#90ee90`), black text
  - Cancelled: Red (`#ff6b6b`), white text

- **`payment_balance`:**
  - Fully Paid (0): Green (`#4caf50`)
  - Overpaid (>0): Yellow (`#ffc107`)
  - Underpaid (<0): Red (`#f44336`)

---

## ✅ VALIDATION RULES

### **Positive Numbers Only:**
- `airlines_price` - min: 0
- `service_fee` - min: 0

### **Required Fields (NOT NULL):**
- `first_name` - NOT NULL
- `last_name` - NOT NULL
- `booking_status` - NOT NULL, default: 'pending'
- `print_invoice` - NOT NULL, default: false
- `request_types` - NOT NULL
- `created_at` - NOT NULL

---

## 🔄 CALCULATION FLOW EXAMPLE

### **Scenario: User enters ticket and visa costs**

1. User enters `airlines_price = 98`
2. User enters `service_fee = 900`
   - → `total_ticket_price` calculates: `900 + 98 = 998.00` (visible immediately)
3. User enters `visa_price = 5`
4. User enters `service_visa = 5`
   - → `tot_visa_fees` calculates: `5 + 5 = 10.00` (visible immediately)
   - → `total_amount_due` calculates: `998.00 + 10.00 = 1008.00` (cascades)
5. User enters `cash_paid = 500`
6. User enters `bank_transfer = 508`
   - → `total_customer_payment` calculates: `500 + 508 = 1008.00` (visible immediately)
   - → `payment_balance` calculates: `1008.00 - 1008.00 = 0` (cascades)
   - → Shows: `✅ Fully Paid` (green background)
7. User enters `commission_from_airlines = 100`
8. User enters `lst_loan_fee = 10`
   - → `lst_profit` calculates: `900 + 5 + 100 - 10 = 995.00` (visible immediately)

**On Save:** All calculated fields are saved to the database.

---

## 📝 NOTES

1. **Real-time Updates:** All calculations update immediately while editing (before saving)
2. **Auto-Save:** Calculated fields are automatically saved to the database when their trigger fields are saved
3. **Cascade Calculations:** Some fields trigger multiple levels of calculations (e.g., `service_fee` updates `total_ticket_price`, which updates `total_amount_due`, which updates `payment_balance`)
4. **Display-Only:** `payment_balance` is never stored in the database; it's computed on-the-fly for display purposes
5. **Validation:** `airlines_price` and `service_fee` are restricted to positive numbers only (min: 0)
6. **Travel Details:** The expandable panel allows editing nested fields without affecting the main table layout
7. **Single Panel:** Only one "Travel Details" panel can be open at a time for better UX

---

**End of Complete Columns Report**
