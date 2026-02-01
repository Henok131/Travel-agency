# LST Travel - Main Table Columns & Financial Logic Report

**Generated:** 2026-01-19  
**Purpose:** Comprehensive report of all columns, financial columns, formulas, and calculation logic for discussion with Claude AI

---

## 📊 ALL COLUMNS IN MAIN_TABLE (Total: 35 columns)

### 1. **Identity & Metadata Columns** (5 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `id` | UUID | NO | ❌ Read-only | Unique booking identifier (UUID) |
| `created_at` | TIMESTAMPTZ | NO | ❌ Read-only | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | ❌ Read-only | Last update timestamp |
| `is_demo` | BOOLEAN | NO | ✅ Yes | Flag for demo/test data |
| `status` | TEXT | NO | ✅ Yes | Request status: draft, submitted, cancelled |

### 2. **Passenger Information Columns** (7 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `first_name` | TEXT | NO | ✅ Yes | Passenger first name |
| `middle_name` | TEXT | YES | ✅ Yes | Passenger middle name(s) |
| `last_name` | TEXT | NO | ✅ Yes | Passenger last name |
| `date_of_birth` | DATE | YES | ✅ Yes | Passenger date of birth |
| `gender` | TEXT | YES | ✅ Yes | Gender (M/F/Other) |
| `nationality` | TEXT | YES | ✅ Yes | Document nationality |
| `passport_number` | TEXT | YES | ✅ Yes | Passport number |

### 3. **Travel Information Columns** (5 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `departure_airport` | TEXT | YES | ✅ Yes | Airport code or full name |
| `destination_airport` | TEXT | YES | ✅ Yes | Airport code or full name |
| `travel_date` | DATE | YES | ✅ Yes | Departure date |
| `return_date` | DATE | YES | ✅ Yes | Return date |
| `airlines` | TEXT | YES | ✅ Yes | Airline name or code (with autocomplete) |

### 4. **Booking Information Columns** (3 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `booking_ref` | TEXT | YES | ✅ Yes | Booking reference number |
| `booking_status` | TEXT | NO | ✅ Yes | Booking status: pending, confirmed, cancelled (color-coded) |
| `print_invoice` | BOOLEAN | NO | ✅ Yes | Flag to indicate if invoice should be printed |

### 5. **Request Types & OCR Columns** (3 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `request_types` | JSONB | NO | ✅ Yes | JSONB array: ["flight", "visa", "package", "other"] |
| `ocr_source` | TEXT | YES | ✅ Yes | OCR service used (NULL if manual-only) |
| `ocr_confidence` | NUMERIC | YES | ✅ Yes | OCR confidence score 0.00-100.00 |

### 6. **Notes Column** (1 column)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `notice` | TEXT | YES | ✅ Yes | Multiline textarea for notes (Excel-like behavior) |

---

## 💰 FINANCIAL COLUMNS (13 columns)

### **A. Payment Method Columns** (2 columns - Input Fields)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `cash_paid` | NUMERIC(10,2) | YES | ✅ Yes | Amount of cash paid (numeric). NULL if no cash payment. |
| `bank_transfer` | NUMERIC(10,2) | YES | ✅ Yes | Amount of bank transfer payment (numeric). NULL if no bank transfer. |

### **B. Ticket Price Columns** (3 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `airlines_price` | NUMERIC(10,2) | YES | ✅ Yes | Price charged by airlines (positive numbers only, min="0") |
| `service_fee` | NUMERIC(10,2) | YES | ✅ Yes | Service fee charged to customer (positive numbers only, min="0") |
| `total_ticket_price` | NUMERIC(10,2) | YES | ❌ **AUTO-CALCULATED** | Total ticket price (automatically calculated: `service_fee + airlines_price`) |

### **C. Visa Fee Columns** (3 columns)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `visa_price` | NUMERIC(10,2) | YES | ✅ Yes | Base visa price (editable) |
| `service_visa` | NUMERIC(10,2) | YES | ✅ Yes | Service fee for visa processing (editable) |
| `tot_visa_fees` | NUMERIC(10,2) | YES | ❌ **AUTO-CALCULATED** | Total visa fees (automatically calculated: `visa_price + service_visa`) |

### **D. Legacy Visa Column** (1 column - DEPRECATED)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `visa_fee` | NUMERIC(10,2) | YES | ✅ Yes | **DEPRECATED** - Kept for data preservation. Will be dropped later. |

### **E. Customer Payment Column** (1 column - AUTO-CALCULATED)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `total_customer_payment` | NUMERIC(10,2) | YES | ❌ **AUTO-CALCULATED** | Total customer payment to LST (automatically calculated: `cash_paid + bank_transfer`) |

### **F. Profit & Commission Columns** (3 columns - Manual Entry)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `lst_profit` | NUMERIC(10,2) | YES | ✅ Yes | LST profit (manual entry) |
| `commission_from_airlines` | NUMERIC(10,2) | YES | ✅ Yes | Commission received from airlines (manual entry) |
| `profit` | NUMERIC(10,2) | YES | ✅ Yes | Overall profit (manual entry) |

### **G. Loan Fee Column** (1 column - Manual Entry)
| Column Name | Data Type | Nullable | Editable | Description |
|------------|-----------|----------|----------|-------------|
| `lst_loan_fee` | NUMERIC(10,2) | YES | ✅ Yes | LST loan fee (manual entry) |

---

## 🧮 MATHEMATICAL FORMULAS & CALCULATION LOGIC

### **Formula 1: Total Customer Payment**
```
total_customer_payment = cash_paid + bank_transfer
```

**Implementation Details:**
- **Trigger Fields:** `cash_paid`, `bank_transfer`
- **Calculation Type:** Real-time (during editing) + Auto-save (on blur)
- **Display Format:** 2 decimal places (e.g., "17.00")
- **Null Handling:** Returns empty string if total = 0
- **Location in Code:**
  - `getCellValue()`: Lines 823-828 (display calculation)
  - `getRawCellValue()`: Lines 868-873 (editing calculation)
  - `saveCell()`: Lines 974-986, 1040-1046, 1080-1083 (auto-save calculation)
  - `handleInputChange()`: Lines 1157-1172 (real-time calculation)

**Behavior:**
- ✅ Calculates in real-time as user types
- ✅ Auto-saves to database when either field changes
- ✅ Read-only field (cannot be edited directly)
- ✅ Shows empty string if both inputs are 0 or null

---

### **Formula 2: Total Ticket Price**
```
total_ticket_price = service_fee + airlines_price
```

**Implementation Details:**
- **Trigger Fields:** `service_fee`, `airlines_price`
- **Calculation Type:** Real-time (during editing) + Auto-save (on blur)
- **Display Format:** 2 decimal places (e.g., "120.00")
- **Null Handling:** Returns empty string if total = 0
- **Validation:** Both `service_fee` and `airlines_price` are restricted to positive numbers only (min="0")
- **Location in Code:**
  - `getCellValue()`: Lines 874-879 (display calculation)
  - `getRawCellValue()`: Lines 874-879 (editing calculation)
  - `saveCell()`: Lines 987-999, 1048-1054, 1085-1088 (auto-save calculation)
  - `handleInputChange()`: Lines 1174-1189 (real-time calculation)

**Behavior:**
- ✅ Calculates in real-time as user types
- ✅ Auto-saves to database when either field changes
- ✅ Read-only field (cannot be edited directly)
- ✅ Shows empty string if both inputs are 0 or null
- ✅ Input validation prevents negative numbers

---

### **Formula 3: Total Visa Fees**
```
tot_visa_fees = visa_price + service_visa
```

**Implementation Details:**
- **Trigger Fields:** `visa_price`, `service_visa`
- **Calculation Type:** Real-time (during editing) + Auto-save (on blur)
- **Display Format:** 2 decimal places (e.g., "120.00")
- **Null Handling:** Returns empty string if total = 0
- **Location in Code:**
  - `getCellValue()`: Lines 817-822 (display calculation)
  - `saveCell()`: Lines 1000-1012, 1056-1062, 1090-1093 (auto-save calculation)

**Behavior:**
- ✅ Calculates in real-time as user types
- ✅ Auto-saves to database when either field changes
- ✅ Read-only field (cannot be edited directly)
- ✅ Shows empty string if both inputs are 0 or null

---

## 📝 IMPLEMENTATION STATUS

### **✅ Fully Implemented Calculations:**
1. ✅ `total_customer_payment` = `cash_paid + bank_transfer`
2. ✅ `total_ticket_price` = `service_fee + airlines_price`
3. ✅ `tot_visa_fees` = `visa_price + service_visa`

### **⚠️ Manual Entry Fields (No Auto-Calculation):**
1. ⚠️ `lst_profit` - Manual entry only
2. ⚠️ `commission_from_airlines` - Manual entry only
3. ⚠️ `profit` - Manual entry only
4. ⚠️ `lst_loan_fee` - Manual entry only

### **🔍 Potential Missing Calculations:**
The following fields are currently **manual entry only**. Consider if they should be auto-calculated:

1. **`profit`** - Could potentially be calculated as:
   - `profit = total_customer_payment - airlines_price - service_fee - visa_price - service_visa + commission_from_airlines - lst_loan_fee`
   - OR: `profit = lst_profit + commission_from_airlines - lst_loan_fee`
   - OR: Some other business logic formula

2. **`lst_profit`** - Could potentially be calculated as:
   - `lst_profit = total_customer_payment - airlines_price - visa_price`
   - OR: Some other business logic formula

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### **Calculation Flow:**

1. **Real-Time Calculation (During Editing):**
   - User types in a trigger field (e.g., `cash_paid`)
   - `handleInputChange()` detects the change
   - Calculates dependent field (e.g., `total_customer_payment`)
   - Updates local state immediately for visual feedback
   - User sees updated value in real-time

2. **Auto-Save Calculation (On Blur/Save):**
   - User finishes editing and moves to next cell
   - `saveCell()` is called
   - Recalculates dependent field using latest database values
   - Saves both the edited field AND the calculated field to database
   - Ensures database consistency

3. **Display Calculation (On Render):**
   - `getCellValue()` calculates value for display
   - Uses current request object values
   - Handles null/undefined values gracefully
   - Formats to 2 decimal places

### **Code Architecture:**

**Key Functions:**
- `getCellValue(request, field)` - Calculates display value
- `getRawCellValue(request, field)` - Gets raw value for editing
- `saveCell(rowId, field, value)` - Saves cell and triggers auto-calculations
- `handleInputChange(e)` - Handles real-time updates during editing

**Calculation Pattern:**
```javascript
// Pattern used for all auto-calculated fields:
case 'calculated_field':
  const field1 = parseFloat(request.field1) || 0
  const field2 = parseFloat(request.field2) || 0
  const total = field1 + field2
  return total > 0 ? total.toFixed(2) : ''
```

---

## 🎯 BUSINESS LOGIC QUESTIONS FOR DISCUSSION

### **Question 1: Profit Calculation**
**Current State:** `profit` is a manual entry field.

**Questions:**
- Should `profit` be auto-calculated?
- What is the correct formula for `profit`?
- Is it: `profit = total_customer_payment - airlines_price - service_fee - visa_price - service_visa + commission_from_airlines - lst_loan_fee`?
- Or: `profit = lst_profit + commission_from_airlines - lst_loan_fee`?
- Or some other formula?

### **Question 2: LST Profit Calculation**
**Current State:** `lst_profit` is a manual entry field.

**Questions:**
- Should `lst_profit` be auto-calculated?
- What is the correct formula for `lst_profit`?
- Is it: `lst_profit = total_customer_payment - airlines_price - visa_price`?
- Or: `lst_profit = service_fee + service_visa`?
- Or some other formula?

### **Question 3: Commission Relationship**
**Current State:** `commission_from_airlines` is a manual entry field.

**Questions:**
- Is `commission_from_airlines` related to `airlines_price`?
- Should it be a percentage of `airlines_price`?
- Or is it a fixed amount per booking?
- Should it be auto-calculated or remain manual?

### **Question 4: Loan Fee Relationship**
**Current State:** `lst_loan_fee` is a manual entry field.

**Questions:**
- Is `lst_loan_fee` related to any other financial fields?
- Should it be auto-calculated or remain manual?
- Is it a fixed fee or percentage-based?

### **Question 5: Data Validation**
**Current State:** Only `airlines_price` and `service_fee` have positive number validation.

**Questions:**
- Should all financial fields have positive number validation?
- Should there be maximum value limits?
- Should there be currency validation?

---

## 📋 SUMMARY

### **Total Columns:** 35
- **Identity/Metadata:** 5 columns
- **Passenger Info:** 7 columns
- **Travel Info:** 5 columns
- **Booking Info:** 3 columns
- **Request Types/OCR:** 3 columns
- **Notes:** 1 column
- **Financial:** 13 columns

### **Financial Columns Breakdown:**
- **Input Fields (Editable):** 8 columns
  - `cash_paid`, `bank_transfer`
  - `airlines_price`, `service_fee`
  - `visa_price`, `service_visa`
  - `lst_profit`, `commission_from_airlines`, `profit`, `lst_loan_fee`
  - `visa_fee` (deprecated)

- **Auto-Calculated Fields (Read-only):** 3 columns
  - `total_customer_payment` = `cash_paid + bank_transfer`
  - `total_ticket_price` = `service_fee + airlines_price`
  - `tot_visa_fees` = `visa_price + service_visa`

### **Implementation Status:**
- ✅ **3 formulas fully implemented** with real-time calculation and auto-save
- ⚠️ **4 financial fields** remain manual entry (potential for auto-calculation)
- ✅ **Input validation** for positive numbers on `airlines_price` and `service_fee`
- ✅ **Real-time updates** during editing
- ✅ **Database persistence** for all calculated fields

---

## 🔄 NEXT STEPS FOR DISCUSSION

1. **Clarify business logic** for `profit` and `lst_profit` calculations
2. **Determine** if `commission_from_airlines` should be auto-calculated
3. **Decide** if `lst_loan_fee` should be auto-calculated
4. **Review** validation rules for all financial fields
5. **Consider** adding more auto-calculated fields based on business requirements

---

**End of Report**
