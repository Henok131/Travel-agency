# LST Travel - Financial Columns Formulas & Logic Report

**Generated:** 2026-01-19  
**Purpose:** Complete list of all financial columns with their formulas, mathematical logic, and calculation methods

---

## 💰 FINANCIAL COLUMNS OVERVIEW

**Total Financial Columns:** 13 columns

### Column Categories:
1. **Payment Method Columns** (2 columns - Input Fields)
2. **Ticket Price Columns** (3 columns)
3. **Visa Fee Columns** (3 columns)
4. **Customer Payment Column** (1 column - Auto-Calculated)
5. **Profit & Commission Columns** (2 columns)
6. **Loan Fee Column** (1 column - Input Field)
7. **Legacy Column** (1 column - Deprecated)

---

## 📋 DETAILED FINANCIAL COLUMNS LIST

### **1. CASH PAID** (`cash_paid`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Amount of cash paid by customer (numeric). NULL if no cash payment.
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None (can be positive, negative, or zero)
- **Default Value:** `NULL`
- **Trigger For:** `total_customer_payment` (auto-calculated)

---

### **2. BANK TRANSFER** (`bank_transfer`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Amount of bank transfer payment (numeric). NULL if no bank transfer.
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None (can be positive, negative, or zero)
- **Default Value:** `NULL`
- **Trigger For:** `total_customer_payment` (auto-calculated)

---

### **3. AIRLINES PRICE** (`airlines_price`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Price charged by airlines
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** ✅ Positive numbers only (`min="0"` in input field)
- **Default Value:** `NULL`
- **Trigger For:** `total_ticket_price` (auto-calculated)

---

### **4. SERVICE FEE** (`service_fee`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Service fee charged to customer (numeric). NULL if no service fee.
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** ✅ Positive numbers only (`min="0"` in input field)
- **Default Value:** `NULL`
- **Trigger For:** 
  - `total_ticket_price` (auto-calculated)
  - `lst_profit` (auto-calculated)

---

### **5. TOTAL TICKET PRICE** (`total_ticket_price`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ❌ **READ-ONLY** (Auto-Calculated)
- **Nullable:** Yes
- **Description:** Total ticket price (automatically calculated: `service_fee + airlines_price`). This is the sum of service fee and airlines price.
- **Formula:** 
  ```
  total_ticket_price = service_fee + airlines_price
  ```
- **Calculation Logic:**
  - Real-time calculation during editing
  - Auto-saves to database when `service_fee` or `airlines_price` changes
  - Displays with 2 decimal places
  - Shows empty string (`-`) if result = 0
- **Trigger Fields:** `service_fee`, `airlines_price`
- **Display Format:** `XX.XX` (2 decimal places) or `-` if zero
- **Code Location:**
  - `getCellValue()`: Lines 897-902
  - `getRawCellValue()`: Lines 897-902
  - `saveCell()`: Lines 987-999, 1048-1054, 1085-1088
  - `handleInputChange()`: Lines 1174-1189
  - `renderCell()`: Lines 1871-1890

---

### **6. VISA PRICE** (`visa_price`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Base visa price (editable)
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None
- **Default Value:** `NULL`
- **Trigger For:** `tot_visa_fees` (auto-calculated)

---

### **7. SERVICE VISA** (`service_visa`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Service fee for visa processing (editable)
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None
- **Default Value:** `NULL`
- **Trigger For:** 
  - `tot_visa_fees` (auto-calculated)
  - `lst_profit` (auto-calculated)

---

### **8. TOTAL VISA FEES** (`tot_visa_fees`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ❌ **READ-ONLY** (Auto-Calculated)
- **Nullable:** Yes
- **Description:** Total visa fees: `visa_price + service_visa` (auto-calculated, read-only)
- **Formula:** 
  ```
  tot_visa_fees = visa_price + service_visa
  ```
- **Calculation Logic:**
  - Real-time calculation during editing
  - Auto-saves to database when `visa_price` or `service_visa` changes
  - Displays with 2 decimal places
  - Shows empty string (`-`) if result = 0
- **Trigger Fields:** `visa_price`, `service_visa`
- **Display Format:** `XX.XX` (2 decimal places) or `-` if zero
- **Code Location:**
  - `getCellValue()`: Lines 831-836
  - `saveCell()`: Lines 995-1006, 1051-1057, 1086-1092
  - `renderCell()`: Lines 1892-1913

---

### **9. TOTAL CUSTOMER PAYMENT** (`total_customer_payment`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ❌ **READ-ONLY** (Auto-Calculated)
- **Nullable:** Yes
- **Description:** Total customer payment to LST (automatically calculated: `cash_paid + bank_transfer`). This is the sum of all payment methods.
- **Formula:** 
  ```
  total_customer_payment = cash_paid + bank_transfer
  ```
- **Calculation Logic:**
  - Real-time calculation during editing
  - Auto-saves to database when `cash_paid` or `bank_transfer` changes
  - Displays with 2 decimal places
  - Shows empty string (`-`) if result = 0
- **Trigger Fields:** `cash_paid`, `bank_transfer`
- **Display Format:** `XX.XX` (2 decimal places) or `-` if zero
- **Code Location:**
  - `getCellValue()`: Lines 837-842
  - `getRawCellValue()`: Lines 891-896
  - `saveCell()`: Lines 974-986, 1037-1046, 1076-1083
  - `handleInputChange()`: Lines 1157-1172
  - `renderCell()`: Lines 1848-1869

---

### **10. LST LOAN FEE** (`lst_loan_fee`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** LST loan fee (manual entry)
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None (can be positive, negative, or zero)
- **Default Value:** `NULL`
- **Trigger For:** `lst_profit` (auto-calculated)

---

### **11. COMMISSION FROM AIRLINES** (`commission_from_airlines`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** Commission received from airlines (manual entry)
- **Formula:** None (Manual Entry)
- **Calculation Logic:** Direct user input
- **Validation:** None (can be positive, negative, or zero)
- **Default Value:** `NULL`
- **Trigger For:** `lst_profit` (auto-calculated)

---

### **12. LST PROFIT** (`lst_profit`)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ❌ **READ-ONLY** (Auto-Calculated)
- **Nullable:** Yes
- **Description:** LST profit (automatically calculated)
- **Formula:** 
  ```
  lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
  ```
- **Calculation Logic:**
  - Real-time calculation during editing
  - Auto-saves to database when `service_fee`, `service_visa`, `commission_from_airlines`, or `lst_loan_fee` changes
  - Displays with 2 decimal places
  - Shows empty string (`-`) if result = 0
  - **Can display negative values** (e.g., if loan fee exceeds income)
- **Trigger Fields:** `service_fee`, `service_visa`, `commission_from_airlines`, `lst_loan_fee`
- **Display Format:** `XX.XX` (2 decimal places) or `-` if zero
- **Code Location:**
  - `getCellValue()`: Lines 843-850
  - `getRawCellValue()`: Lines 903-910
  - `saveCell()`: Lines 1007-1019, 1056-1062, 1090-1093
  - `handleInputChange()`: Lines 1191-1210
  - `renderCell()`: Lines 1915-1940
  - `fetchRequests()`: Lines 488-500 (calculates on data load)

---

### **13. VISA FEE** (`visa_fee`) - **DEPRECATED**
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ✅ Yes (Manual Entry)
- **Nullable:** Yes
- **Description:** **DEPRECATED** - Kept for data preservation. Will be dropped later. Replaced by `visa_price`, `service_visa`, and `tot_visa_fees`.
- **Formula:** None (Manual Entry)
- **Status:** ⚠️ Legacy column - Do not use for new entries

---

## 🧮 MATHEMATICAL FORMULAS SUMMARY

### **Formula 1: Total Customer Payment**
```
total_customer_payment = cash_paid + bank_transfer
```
**Components:**
- `cash_paid`: Manual entry (can be NULL)
- `bank_transfer`: Manual entry (can be NULL)
- **Result:** Sum of both payment methods
- **Display:** Shows `-` if result = 0

---

### **Formula 2: Total Ticket Price**
```
total_ticket_price = service_fee + airlines_price
```
**Components:**
- `service_fee`: Manual entry (positive numbers only, min="0")
- `airlines_price`: Manual entry (positive numbers only, min="0")
- **Result:** Sum of service fee and airlines price
- **Display:** Shows `-` if result = 0

---

### **Formula 3: Total Visa Fees**
```
tot_visa_fees = visa_price + service_visa
```
**Components:**
- `visa_price`: Manual entry (can be NULL)
- `service_visa`: Manual entry (can be NULL)
- **Result:** Sum of visa price and service visa
- **Display:** Shows `-` if result = 0

---

### **Formula 4: LST Profit**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```
**Components:**
- `service_fee`: Manual entry (positive numbers only, min="0")
- `service_visa`: Manual entry (can be NULL)
- `commission_from_airlines`: Manual entry (can be NULL)
- `lst_loan_fee`: Manual entry (can be NULL) - **SUBTRACTED**
- **Result:** Income (service_fee + service_visa + commission) minus loan fee
- **Display:** Shows `-` if result = 0, **can show negative values**
- **Business Logic:** 
  - Positive values = profit
  - Negative values = loss (loan fee exceeds income)
  - Zero = break-even

---

## 📊 CALCULATION FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT FIELDS                        │
├─────────────────────────────────────────────────────────────┤
│  cash_paid          bank_transfer                           │
│       │                  │                                   │
│       └──────────┬────────┘                                  │
│                  ▼                                           │
│         total_customer_payment (AUTO)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  airlines_price      service_fee                             │
│       │                  │                                   │
│       └──────────┬────────┘                                  │
│                  ▼                                           │
│         total_ticket_price (AUTO)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  visa_price          service_visa                            │
│       │                  │                                   │
│       └──────────┬────────┘                                  │
│                  ▼                                           │
│         tot_visa_fees (AUTO)                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  service_fee         service_visa                            │
│       │                  │                                   │
│       ├──────────────────┼──────────────────┐              │
│       │                  │                   │              │
│  commission_from_airlines    lst_loan_fee    │              │
│       │                  │                   │              │
│       └──────────┬───────┴───────────┬────────┘              │
│                  │                   │                      │
│                  ▼                   ▼                      │
│              (ADD)              (SUBTRACT)                   │
│                  │                   │                      │
│                  └─────────┬─────────┘                      │
│                            ▼                                 │
│                    lst_profit (AUTO)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 REAL-TIME CALCULATION BEHAVIOR

### **When User Edits a Trigger Field:**

1. **User types in field** (e.g., `service_fee`)
2. **`handleInputChange()` triggers:**
   - Calculates dependent field(s) in real-time
   - Updates local state immediately
   - User sees updated value instantly (no save required)

3. **User moves to next cell** (blur event)
4. **`saveCell()` triggers:**
   - Saves the edited field to database
   - Recalculates dependent field(s) using latest database values
   - Saves both edited field AND calculated field(s) to database
   - Updates local state with saved values

### **Example Flow:**
```
User edits service_fee: 50
  ↓
Real-time: lst_profit updates to show new value
  ↓
User clicks away (blur)
  ↓
Save: service_fee = 50 → Database
Save: lst_profit = calculated value → Database
  ↓
Local state updated with saved values
```

---

## ✅ VALIDATION RULES

### **Positive Numbers Only:**
- `airlines_price`: `min="0"` in input field
- `service_fee`: `min="0"` in input field

### **No Validation (Can be Negative/Zero):**
- `cash_paid`
- `bank_transfer`
- `visa_price`
- `service_visa`
- `lst_loan_fee`
- `commission_from_airlines`

### **Auto-Calculated (Read-Only):**
- `total_customer_payment`
- `total_ticket_price`
- `tot_visa_fees`
- `lst_profit`

---

## 🎯 TEST CASES

### **Test Case 1: Total Customer Payment**
- Input: `cash_paid = 50`, `bank_transfer = 30`
- Expected: `total_customer_payment = 80.00`
- ✅ **PASS**

### **Test Case 2: Total Ticket Price**
- Input: `service_fee = 50`, `airlines_price = 100`
- Expected: `total_ticket_price = 150.00`
- ✅ **PASS**

### **Test Case 3: Total Visa Fees**
- Input: `visa_price = 20`, `service_visa = 10`
- Expected: `tot_visa_fees = 30.00`
- ✅ **PASS**

### **Test Case 4: LST Profit (Positive)**
- Input: `service_fee = 50`, `service_visa = 20`, `commission = 9`, `loan = 0`
- Expected: `lst_profit = 79.00`
- ✅ **PASS**

### **Test Case 5: LST Profit (With Loan)**
- Input: `service_fee = 50`, `service_visa = 20`, `commission = 9`, `loan = 10`
- Expected: `lst_profit = 69.00`
- ✅ **PASS**

### **Test Case 6: LST Profit (Negative)**
- Input: `service_fee = 10`, `service_visa = 5`, `commission = 2`, `loan = 20`
- Expected: `lst_profit = -3.00`
- ✅ **PASS**

### **Test Case 7: All Zeros**
- Input: All fields = 0 or NULL
- Expected: All calculated fields show `-` (empty string)
- ✅ **PASS**

---

## 📝 IMPLEMENTATION NOTES

### **Code Patterns Used:**

1. **Display Calculation:**
   ```javascript
   case 'calculated_field': {
     const field1 = parseFloat(request.field1) || 0
     const field2 = parseFloat(request.field2) || 0
     const total = field1 + field2
     return total !== 0 ? total.toFixed(2) : ''
   }
   ```

2. **Real-Time Calculation:**
   ```javascript
   if (editingCell && editingCell.field === 'trigger_field') {
     const value1 = editingCell.field === 'field1' ? parseFloat(newValue) : parseFloat(request.field1)
     const value2 = editingCell.field === 'field2' ? parseFloat(newValue) : parseFloat(request.field2)
     const calculated = value1 + value2
     setRequests(prev => prev.map(r => 
       r.id === editingCell.rowId 
         ? { ...r, calculated_field: calculated !== 0 ? calculated : null }
         : r
     ))
   }
   ```

3. **Auto-Save Calculation:**
   ```javascript
   if (field === 'trigger_field1' || field === 'trigger_field2') {
     const updatedRequest = requests.find(r => r.id === rowId)
     const value1 = field === 'field1' ? dbValue : (updatedRequest.field1 || 0)
     const value2 = field === 'field2' ? dbValue : (updatedRequest.field2 || 0)
     calculatedValue = (value1 || 0) + (value2 || 0)
     calculatedValue = calculatedValue !== 0 ? calculatedValue : null
   }
   ```

---

## 🔍 SUMMARY TABLE

| Column Name | Type | Editable | Formula | Trigger Fields |
|------------|------|----------|---------|----------------|
| `cash_paid` | Input | ✅ Yes | None | `total_customer_payment` |
| `bank_transfer` | Input | ✅ Yes | None | `total_customer_payment` |
| `airlines_price` | Input | ✅ Yes | None | `total_ticket_price` |
| `service_fee` | Input | ✅ Yes | None | `total_ticket_price`, `lst_profit` |
| `total_ticket_price` | **Auto** | ❌ No | `service_fee + airlines_price` | - |
| `visa_price` | Input | ✅ Yes | None | `tot_visa_fees` |
| `service_visa` | Input | ✅ Yes | None | `tot_visa_fees`, `lst_profit` |
| `tot_visa_fees` | **Auto** | ❌ No | `visa_price + service_visa` | - |
| `total_customer_payment` | **Auto** | ❌ No | `cash_paid + bank_transfer` | - |
| `lst_loan_fee` | Input | ✅ Yes | None | `lst_profit` |
| `commission_from_airlines` | Input | ✅ Yes | None | `lst_profit` |
| `lst_profit` | **Auto** | ❌ No | `service_fee + service_visa + commission_from_airlines - lst_loan_fee` | - |
| `visa_fee` | Input | ✅ Yes | None | - (Deprecated) |

---

## 🎨 UI INDICATORS

### **Read-Only Fields (Auto-Calculated):**
- Grey background (`var(--bg-secondary)`)
- Grey text color (`var(--text-secondary)`)
- Default cursor (not editable)
- Display format: `XX.XX` or `-` if zero

### **Editable Fields:**
- White/theme background
- Normal text color
- Pointer cursor on hover
- Input field with validation (where applicable)

---

**End of Report**
