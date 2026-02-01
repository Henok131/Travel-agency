# Comprehensive Documentation System Plan for LST Travel SaaS

**Generated:** 2026-01-25  
**Purpose:** Create a powerful, interconnected documentation system similar to real-world SaaS products (Stripe, Linear, Notion, etc.)  
**Status:** Planning & Analysis

---

## 📚 Executive Summary

This document outlines a comprehensive documentation system for the LST Travel SaaS platform, covering:
- **Financial Calculations & Formulas** (accounting logic)
- **System Architecture** (how things work)
- **User Guides** (how to use features)
- **FAQ & Troubleshooting**
- **API Documentation** (for developers)
- **Business Logic** (accounting, tax compliance)

---

## 🎯 Documentation Structure (Real-World SaaS Reference)

### **Reference Examples:**
- **Stripe Docs:** Clear sections, code examples, interactive elements, cross-links
- **Linear Docs:** Visual guides, step-by-step tutorials, FAQ sections
- **Notion Docs:** Hierarchical structure, embedded examples, searchable content
- **GitHub Docs:** Markdown-based, versioned, community-contributed

### **Proposed Structure:**

```
Documentation/
├── 01-Getting-Started/
│   ├── Quick-Start-Guide.md
│   ├── Account-Setup.md
│   ├── First-Booking.md
│   └── Navigation-Guide.md
│
├── 02-Financial-System/
│   ├── Overview.md
│   ├── Calculations-Formulas.md ⭐ (CRITICAL)
│   ├── Payment-Methods.md
│   ├── Profit-Calculation.md
│   ├── Commission-Logic.md
│   └── Accounting-Basics.md
│
├── 03-Tax-Compliance/
│   ├── VAT-Calculation.md ⭐ (CRITICAL)
│   ├── SKR03-Categories.md
│   ├── German-Tax-Reporting.md
│   ├── Deductible-Percentages.md
│   └── Quarterly-Reports.md
│
├── 04-Features/
│   ├── Booking-Management.md
│   ├── Request-Creation.md
│   ├── Expense-Tracking.md
│   ├── Invoice-Generation.md
│   ├── Time-Slot-Management.md
│   └── Data-Export.md
│
├── 05-System-Information/
│   ├── Architecture-Overview.md
│   ├── Database-Schema.md
│   ├── Multi-Tenancy.md
│   ├── Security-Policies.md
│   └── API-Reference.md
│
├── 06-FAQ/
│   ├── General-Questions.md
│   ├── Financial-Questions.md
│   ├── Technical-Support.md
│   └── Troubleshooting.md
│
└── 07-Advanced/
    ├── Custom-Integrations.md
    ├── Bulk-Operations.md
    ├── Reporting-Analytics.md
    └── Best-Practices.md
```

---

## 💰 FINANCIAL CALCULATIONS & FORMULAS (CRITICAL SECTION)

### **Current Implementation Status:**

#### ✅ **Implemented Calculations:**

1. **Total Ticket Price**
   - **Formula:** `total_ticket_price = airlines_price + service_fee`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `MainTable.jsx` lines 987-999, 1048-1054
   - **Example:** Airlines: €500 + Service: €50 = **€550.00**

2. **Total Visa Fees**
   - **Formula:** `tot_visa_fees = visa_price + service_visa`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `MainTable.jsx` lines 995-1006
   - **Example:** Visa: €80 + Service: €20 = **€100.00**

3. **Total Customer Payment**
   - **Formula:** `total_customer_payment = cash_paid + bank_transfer`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `MainTable.jsx` lines 974-986
   - **Example:** Cash: €200 + Transfer: €450 = **€650.00**

4. **Total Amount Due**
   - **Formula:** `total_amount_due = total_ticket_price + tot_visa_fees`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `MainTable.jsx` lines 1048-1054
   - **Example:** Ticket: €550 + Visa: €100 = **€650.00**
   - **Visual:** Orange/yellow background highlight

5. **Payment Balance**
   - **Formula:** `payment_balance = total_customer_payment - total_amount_due`
   - **Status:** ✅ Display-only (not stored in DB)
   - **Location:** `MainTable.jsx` lines 1132-1140
   - **Color Coding:**
     - **Green:** Fully paid (balance = 0)
     - **Red:** Customer owes money (balance < 0)
     - **Blue:** Customer overpaid (balance > 0)

6. **LST Profit**
   - **Formula:** `lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `MainTable.jsx` lines 1007-1019
   - **Example:** Service: €50 + Visa Service: €20 + Commission: €30 - Loan: €10 = **€90.00**
   - **Can be negative** if loan fee exceeds income

#### ✅ **VAT Calculations (Expenses):**

1. **Net Amount from Gross**
   - **Formula:** `net_amount = gross_amount ÷ (1 + vat_rate/100)`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `ExpensesList.jsx` lines 664-679
   - **Example:** Gross: €119.00, VAT: 19% → Net: €100.00

2. **VAT Amount**
   - **Formula:** `vat_amount = gross_amount - net_amount`
   - **Status:** ✅ Auto-calculated, real-time
   - **Location:** `ExpensesList.jsx` lines 664-679
   - **Example:** Gross: €119.00, Net: €100.00 → VAT: €19.00

3. **Gross Amount from Net**
   - **Formula:** `gross_amount = net_amount × (1 + vat_rate/100)`
   - **Status:** ✅ Auto-calculated when editing net_amount
   - **Location:** `ExpensesList.jsx` lines 830-843
   - **Example:** Net: €100.00, VAT: 19% → Gross: €119.00

---

## 📊 ACCOUNTING LOGIC & BUSINESS RULES

### **1. Booking Financial Flow**

```
Customer Payment Flow:
┌─────────────────────────────────────────┐
│ Customer Pays:                           │
│   • Cash: cash_paid                      │
│   • Bank Transfer: bank_transfer         │
│   ↓                                       │
│ total_customer_payment (AUTO)            │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Amount Due Calculation:                 │
│   • Ticket: airlines_price + service_fee│
│   • Visa: visa_price + service_visa     │
│   ↓                                       │
│ total_amount_due (AUTO)                 │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Payment Balance:                        │
│   payment_balance =                     │
│     total_customer_payment -           │
│     total_amount_due                    │
│                                         │
│   • Balance = 0 → ✅ Fully Paid        │
│   • Balance < 0 → ⚠️ Customer Owes     │
│   • Balance > 0 → 💰 Overpaid          │
└─────────────────────────────────────────┘
```

### **2. Profit Calculation Logic**

```
LST Profit Flow:
┌─────────────────────────────────────────┐
│ Income Sources:                         │
│   • Service Fee (ticket processing)     │
│   • Service Visa (visa processing)     │
│   • Commission from Airlines            │
│   ↓                                       │
│ Total Income =                          │
│   service_fee + service_visa +          │
│   commission_from_airlines              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Deductions:                             │
│   • LST Loan Fee                        │
│   ↓                                       │
│ lst_profit =                            │
│   Total Income - lst_loan_fee          │
│                                         │
│   • Positive → Profit                  │
│   • Negative → Loss                    │
│   • Zero → Break-even                   │
└─────────────────────────────────────────┘
```

### **3. Expense Tax Compliance (German SKR03)**

```
Expense Tax Flow:
┌─────────────────────────────────────────┐
│ Expense Entry:                          │
│   • Gross Amount (incl. VAT)            │
│   • VAT Rate (default: 19%)            │
│   • Category (SKR03 code)              │
│   ↓                                       │
│ Auto-Calculate:                         │
│   • Net Amount = Gross ÷ (1 + VAT/100) │
│   • VAT Amount = Gross - Net           │
│   • Deductible % (from SKR03)          │
└─────────────────────────────────────────┘
```

---

## 🏷️ SKR03 TAX CATEGORIES (German Accounting)

### **14 Categories Implemented:**

| Code | Category Name | Deductible % | Use Case |
|------|--------------|--------------|----------|
| 4210 | Vehicle Expenses | 100% | Car fuel, maintenance |
| 4800 | Miscellaneous | 100% | Default fallback |
| 4890 | Bank Fees | 100% | Transaction fees |
| 4910 | Telephone & Internet | 100% | Phone bills, internet |
| 4920 | Office Rent | 100% | Office rental costs |
| 4930 | Utilities | 100% | Electricity, water |
| 4940 | Office Supplies | 100% | Stationery, equipment |
| 4960 | Software & Tools | 100% | Software subscriptions |
| 6000 | Staff Salary | 100% | Employee wages |
| 6300 | Travel Expenses | 100% | Business travel |
| 6400 | Advertising & Marketing | 100% | Marketing costs |
| 6805 | Meal & Entertainment | 70% | Business meals |
| 6825 | Training & Education | 100% | Courses, training |
| 6850 | Legal & Consulting | 100% | Legal fees, consulting |

**Key Rule:** Meal & Entertainment (6805) is only **70% deductible** (German tax law). All others are 100% deductible.

---

## 📋 DOCUMENTATION CONTENT REQUIREMENTS

### **Section 1: Getting Started**
- ✅ Quick start guide
- ✅ Account setup
- ✅ First booking walkthrough
- ✅ Navigation overview

### **Section 2: Financial System** ⭐ **CRITICAL**
- ✅ **Calculation Formulas** (detailed math)
- ✅ **Payment Methods** (cash, bank transfer)
- ✅ **Profit Calculation** (step-by-step)
- ✅ **Commission Logic** (how airlines commission works)
- ✅ **Accounting Basics** (for accountants)

**Content Needed:**
- Mathematical formulas with examples
- Calculation flow diagrams
- Edge cases (negative values, zero values)
- Rounding rules (2 decimal places)
- Currency handling (EUR)

### **Section 3: Tax Compliance** ⭐ **CRITICAL**
- ✅ **VAT Calculation** (German 19% standard)
- ✅ **SKR03 Categories** (complete list with codes)
- ✅ **Deductible Percentages** (70% vs 100%)
- ✅ **German Tax Reporting** (quarterly reports)
- ✅ **Net vs Gross** (when to use which)

**Content Needed:**
- VAT calculation examples
- SKR03 category explanations
- Tax reporting workflow
- Compliance requirements
- Export formats for tax software

### **Section 4: Features**
- ✅ Booking management
- ✅ Request creation
- ✅ Expense tracking
- ✅ Invoice generation
- ✅ Time slot management
- ✅ Data export (CSV, JSON, Excel)

**Content Needed:**
- Step-by-step guides
- Screenshots/videos
- Common workflows
- Keyboard shortcuts
- Bulk operations

### **Section 5: System Information**
- ✅ Architecture overview
- ✅ Database schema
- ✅ Multi-tenancy explanation
- ✅ Security policies (RLS)
- ✅ API reference

**Content Needed:**
- System diagrams
- Database ERD
- API endpoints
- Authentication flow
- Data isolation explanation

### **Section 6: FAQ**
- ✅ General questions
- ✅ Financial questions
- ✅ Technical support
- ✅ Troubleshooting

**Content Needed:**
- Common questions
- Error solutions
- Workarounds
- Contact information

---

## 🔗 CROSS-LINKING STRATEGY

### **Internal Links Format:**
```markdown
For more details, see [Financial Calculations](./02-Financial-System/Calculations-Formulas.md#total-ticket-price)

Related topics:
- [Payment Balance](./02-Financial-System/Calculations-Formulas.md#payment-balance)
- [VAT Calculation](./03-Tax-Compliance/VAT-Calculation.md)
- [SKR03 Categories](./03-Tax-Compliance/SKR03-Categories.md)
```

### **Anchor Links for Sections:**
```markdown
## Table of Contents
- [Total Ticket Price](#total-ticket-price)
- [Total Visa Fees](#total-visa-fees)
- [Payment Balance](#payment-balance)
- [LST Profit](#lst-profit)
```

---

## 📝 DETAILED CONTENT OUTLINE

### **File: `02-Financial-System/Calculations-Formulas.md`**

```markdown
# Financial Calculations & Formulas

## Overview
This document explains all financial calculations used in the LST Travel system. All formulas are auto-calculated in real-time.

## Table of Contents
1. [Total Ticket Price](#total-ticket-price)
2. [Total Visa Fees](#total-visa-fees)
3. [Total Customer Payment](#total-customer-payment)
4. [Total Amount Due](#total-amount-due)
5. [Payment Balance](#payment-balance)
6. [LST Profit](#lst-profit)
7. [Calculation Dependencies](#calculation-dependencies)
8. [Examples](#examples)

---

## Total Ticket Price

**Formula:**
```
total_ticket_price = airlines_price + service_fee
```

**Components:**
- `airlines_price`: Base price charged by airlines (manual entry)
- `service_fee`: Service fee charged to customer (manual entry)

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0

**Example:**
```
Airlines Price: €500.00
Service Fee:   €50.00
─────────────────────
Total Ticket:  €550.00
```

**Related:**
- [Total Amount Due](#total-amount-due) - Uses total_ticket_price
- [LST Profit](#lst-profit) - Uses service_fee

---

## Total Visa Fees

**Formula:**
```
tot_visa_fees = visa_price + service_visa
```

**Components:**
- `visa_price`: Base visa price (manual entry)
- `service_visa`: Service fee for visa processing (manual entry)

**Example:**
```
Visa Price:    €80.00
Service Visa:  €20.00
─────────────────────
Total Visa:    €100.00
```

**Related:**
- [Total Amount Due](#total-amount-due) - Uses tot_visa_fees
- [LST Profit](#lst-profit) - Uses service_visa

---

## Total Customer Payment

**Formula:**
```
total_customer_payment = cash_paid + bank_transfer
```

**Components:**
- `cash_paid`: Amount paid in cash (manual entry)
- `bank_transfer`: Amount paid via bank transfer (manual entry)

**Example:**
```
Cash Paid:        €200.00
Bank Transfer:    €450.00
─────────────────────────
Total Payment:    €650.00
```

**Related:**
- [Payment Balance](#payment-balance) - Uses total_customer_payment

---

## Total Amount Due

**Formula:**
```
total_amount_due = total_ticket_price + tot_visa_fees
```

**Expanded Formula:**
```
total_amount_due = (airlines_price + service_fee) + (visa_price + service_visa)
```

**Visual Indicator:**
- 🟠 Orange/yellow background highlight in UI

**Example:**
```
Total Ticket Price: €550.00
Total Visa Fees:    €100.00
────────────────────────────
Total Amount Due:   €650.00
```

**Related:**
- [Total Ticket Price](#total-ticket-price)
- [Total Visa Fees](#total-visa-fees)
- [Payment Balance](#payment-balance)

---

## Payment Balance

**Formula:**
```
payment_balance = total_customer_payment - total_amount_due
```

**Display Logic:**
- ✅ **Green background** if balance = 0 (Fully Paid)
- ⚠️ **Red text** if balance < 0 (Customer Owes)
- 💰 **Blue text** if balance > 0 (Overpaid)

**Note:** This field is **display-only** and NOT stored in the database.

**Example Scenarios:**

**Scenario 1: Fully Paid**
```
Total Customer Payment: €650.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €0.00 ✅ Fully Paid
```

**Scenario 2: Customer Owes**
```
Total Customer Payment: €500.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         -€150.00 ⚠️ Customer Owes €150
```

**Scenario 3: Overpaid**
```
Total Customer Payment: €700.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €50.00 💰 Overpaid by €50
```

**Related:**
- [Total Customer Payment](#total-customer-payment)
- [Total Amount Due](#total-amount-due)

---

## LST Profit

**Formula:**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```

**Components:**
- `service_fee`: Service fee income (positive)
- `service_visa`: Visa service fee income (positive)
- `commission_from_airlines`: Commission received (positive)
- `lst_loan_fee`: Loan fee deduction (subtracted)

**Business Logic:**
- **Positive Value:** Profit (income exceeds deductions)
- **Negative Value:** Loss (loan fee exceeds income)
- **Zero Value:** Break-even

**Example 1: Profit**
```
Service Fee:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€10.00
──────────────────────────────
LST Profit:             €90.00 ✅ Profit
```

**Example 2: Loss**
```
Service Fee:            €10.00
Service Visa:           €5.00
Commission:             €2.00
──────────────────────────────
Total Income:           €17.00
Loan Fee:              -€20.00
──────────────────────────────
LST Profit:            -€3.00 ⚠️ Loss
```

**Related:**
- [Service Fee](#total-ticket-price)
- [Service Visa](#total-visa-fees)
- [Commission Logic](./Commission-Logic.md)

---

## Calculation Dependencies

### **Dependency Graph:**

```
airlines_price ──┐
                 ├──→ total_ticket_price ──┐
service_fee ─────┘                         │
                                           ├──→ total_amount_due ──┐
visa_price ────┐                           │                      │
               ├──→ tot_visa_fees ─────────┘                      │
service_visa ──┘                                                    │
                                                                   ├──→ payment_balance
cash_paid ─────┐                                                    │
               ├──→ total_customer_payment ─────────────────────────┘
bank_transfer ─┘

service_fee ──────────┐
                      │
service_visa ─────────┼──→ lst_profit
                      │
commission_from_airlines ─┘
                      │
lst_loan_fee ─────────┘ (subtracted)
```

### **Real-Time Update Chain:**

When editing `service_fee`:
1. Updates `total_ticket_price` (immediate)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)
4. Updates `lst_profit` (immediate)

When editing `cash_paid`:
1. Updates `total_customer_payment` (immediate)
2. Updates `payment_balance` (cascades)

---

## Examples

### **Complete Booking Example:**

**Input:**
- Airlines Price: €500.00
- Service Fee: €50.00
- Visa Price: €80.00
- Service Visa: €20.00
- Cash Paid: €200.00
- Bank Transfer: €450.00
- Commission: €30.00
- Loan Fee: €10.00

**Calculations:**
```
Total Ticket Price = €500 + €50 = €550.00
Total Visa Fees = €80 + €20 = €100.00
Total Amount Due = €550 + €100 = €650.00
Total Customer Payment = €200 + €450 = €650.00
Payment Balance = €650 - €650 = €0.00 ✅ Fully Paid
LST Profit = €50 + €20 + €30 - €10 = €90.00 ✅ Profit
```

---

## Rounding Rules

- All calculations use **2 decimal places**
- Rounding method: Standard rounding (0.5 rounds up)
- Display format: `XX.XX` (e.g., `550.00`)
- Zero values display as `-` (empty string)

---

## Edge Cases

### **NULL Values:**
- NULL values are treated as `0` in calculations
- If all components are NULL, result is NULL (displays as `-`)

### **Negative Values:**
- `cash_paid` and `bank_transfer` can be negative (refunds)
- `lst_loan_fee` is subtracted (can cause negative profit)
- `payment_balance` can be negative (customer owes)

### **Zero Values:**
- If result = 0, field displays as `-` (empty)
- Exception: `payment_balance` shows `€0.00` when fully paid

---

**Next:** [VAT Calculations](./../03-Tax-Compliance/VAT-Calculation.md)
```

---

### **File: `03-Tax-Compliance/VAT-Calculation.md`**

```markdown
# VAT (Value Added Tax) Calculation

## Overview
The system automatically calculates VAT (Mehrwertsteuer) for German tax compliance. All calculations follow German tax law (19% standard rate).

## Formula

### **From Gross Amount (Including VAT):**

```
net_amount = gross_amount ÷ (1 + vat_rate/100)
vat_amount = gross_amount - net_amount
```

### **From Net Amount (Excluding VAT):**

```
gross_amount = net_amount × (1 + vat_rate/100)
vat_amount = gross_amount - net_amount
```

## Standard VAT Rates (Germany)

- **Standard Rate:** 19% (default)
- **Reduced Rate:** 7% (books, food, etc.)
- **Zero Rate:** 0% (exports, certain services)

## Examples

### **Example 1: Standard 19% VAT**

**Input:**
- Gross Amount: €119.00
- VAT Rate: 19%

**Calculation:**
```
Net Amount = €119.00 ÷ 1.19 = €100.00
VAT Amount = €119.00 - €100.00 = €19.00
```

**Verification:**
```
Gross = Net + VAT
€119.00 = €100.00 + €19.00 ✅
```

### **Example 2: Reduced 7% VAT**

**Input:**
- Gross Amount: €107.00
- VAT Rate: 7%

**Calculation:**
```
Net Amount = €107.00 ÷ 1.07 = €100.00
VAT Amount = €107.00 - €100.00 = €7.00
```

### **Example 3: From Net Amount**

**Input:**
- Net Amount: €100.00
- VAT Rate: 19%

**Calculation:**
```
Gross Amount = €100.00 × 1.19 = €119.00
VAT Amount = €119.00 - €100.00 = €19.00
```

## Real-Time Calculation

The system calculates VAT **in real-time** as you type:
- ✅ Editing `gross_amount` → Auto-calculates `net_amount` and `vat_amount`
- ✅ Editing `vat_rate` → Auto-calculates `net_amount` and `vat_amount`
- ✅ Editing `net_amount` → Auto-calculates `gross_amount` and `vat_amount`

## Rounding

- All amounts rounded to **2 decimal places**
- Uses standard rounding (0.5 rounds up)
- Example: €100.005 → €100.01

## Related Topics

- [SKR03 Tax Categories](./SKR03-Categories.md)
- [Deductible Percentages](./Deductible-Percentages.md)
- [German Tax Reporting](./German-Tax-Reporting.md)
```

---

### **File: `03-Tax-Compliance/SKR03-Categories.md`**

```markdown
# SKR03 Tax Categories (German Accounting)

## Overview
SKR03 (Standardkontenrahmen 03) is the German standard chart of accounts. Each expense category has a code and deductible percentage.

## Complete Category List

| Code | Category Name | Deductible % | Description | Use Cases |
|------|--------------|--------------|-------------|-----------|
| **4210** | Vehicle Expenses | 100% | Car-related costs | Fuel, maintenance, insurance |
| **4800** | Miscellaneous | 100% | Default fallback | Unspecified expenses |
| **4890** | Bank Fees | 100% | Banking costs | Transaction fees, account fees |
| **4910** | Telephone & Internet | 100% | Communication | Phone bills, internet, mobile |
| **4920** | Office Rent | 100% | Office space | Office rental, workspace costs |
| **4930** | Utilities | 100% | Building utilities | Electricity, water, heating |
| **4940** | Office Supplies | 100% | Office materials | Stationery, equipment, supplies |
| **4960** | Software & Tools | 100% | Software costs | Subscriptions, licenses, tools |
| **6000** | Staff Salary | 100% | Employee wages | Salaries, wages, benefits |
| **6300** | Travel Expenses | 100% | Business travel | Flights, hotels, meals (travel) |
| **6400** | Advertising & Marketing | 100% | Marketing costs | Ads, campaigns, promotions |
| **6805** | Meal & Entertainment | **70%** ⚠️ | Business meals | Restaurant, catering, events |
| **6825** | Training & Education | 100% | Learning costs | Courses, training, education |
| **6850** | Legal & Consulting | 100% | Professional services | Legal fees, consulting |

## Important Rules

### **70% Deductible Rule:**
- **Category 6805 (Meal & Entertainment)** is only **70% tax deductible**
- This is a German tax law requirement
- Example: €100 meal expense → Only €70 is deductible

### **100% Deductible:**
- All other categories are **100% tax deductible**
- Full expense amount can be deducted from taxable income

## Auto-Assignment

When you select a category in the expense form:
- ✅ System automatically assigns SKR03 code
- ✅ System automatically sets deductible percentage
- ✅ No manual entry required

## Related Topics

- [VAT Calculation](./VAT-Calculation.md)
- [Deductible Percentages](./Deductible-Percentages.md)
- [German Tax Reporting](./German-Tax-Reporting.md)
```

---

## 📊 CURRENT STATUS vs REQUIRED

### ✅ **What's Already Documented:**

1. **Financial Formulas** - ✅ Complete
   - Total Ticket Price
   - Total Visa Fees
   - Total Customer Payment
   - Total Amount Due
   - Payment Balance
   - LST Profit

2. **VAT Calculations** - ✅ Complete
   - Net from Gross
   - VAT Amount
   - Gross from Net

3. **SKR03 Categories** - ✅ Complete
   - 14 categories documented
   - Deductible percentages

4. **Calculation Logic** - ✅ Documented
   - Real-time updates
   - Dependencies
   - Edge cases

### ❌ **What Needs to be Created:**

1. **User-Facing Documentation** - ❌ Not Created
   - Getting Started guides
   - Feature tutorials
   - Step-by-step workflows

2. **Interconnected Documentation** - ❌ Not Created
   - Cross-links between sections
   - Table of contents
   - Search functionality

3. **FAQ Section** - ❌ Basic Only
   - Need comprehensive FAQ
   - Troubleshooting guides
   - Common issues

4. **Visual Documentation** - ❌ Missing
   - Diagrams
   - Flowcharts
   - Screenshots
   - Video tutorials

5. **Developer Documentation** - ❌ Partial
   - API reference needed
   - Database schema docs
   - Architecture diagrams

---

## 🎨 DOCUMENTATION FEATURES (Real-World SaaS)

### **1. Search Functionality**
- Full-text search across all docs
- Auto-complete suggestions
- Recent searches

### **2. Interactive Elements**
- Code examples with copy buttons
- Calculator widgets (for formulas)
- Interactive diagrams

### **3. Version Control**
- Version history
- "Last updated" dates
- Change logs

### **4. Multi-Language Support**
- English and German versions
- Language switcher
- Translated formulas

### **5. Related Content**
- "See also" sections
- Related articles
- Breadcrumb navigation

### **6. Feedback System**
- "Was this helpful?" buttons
- Edit suggestions
- Report issues

---

## 📁 PROPOSED FILE STRUCTURE

```
docs/
├── en/ (English)
│   ├── getting-started/
│   ├── financial-system/
│   ├── tax-compliance/
│   ├── features/
│   ├── system-info/
│   ├── faq/
│   └── advanced/
│
├── de/ (German)
│   ├── getting-started/
│   ├── financial-system/
│   ├── tax-compliance/
│   ├── features/
│   ├── system-info/
│   ├── faq/
│   └── advanced/
│
└── assets/
    ├── diagrams/
    ├── screenshots/
    ├── formulas/
    └── examples/
```

---

## 🔧 IMPLEMENTATION PLAN

### **Phase 1: Core Financial Documentation** (Priority: HIGH)
1. Create `Calculations-Formulas.md` with all formulas
2. Create `VAT-Calculation.md` with examples
3. Create `SKR03-Categories.md` with complete list
4. Add cross-links between documents

### **Phase 2: User Guides** (Priority: MEDIUM)
1. Create Getting Started guide
2. Create Feature tutorials
3. Add screenshots
4. Create video walkthroughs

### **Phase 3: Advanced Documentation** (Priority: LOW)
1. API reference
2. Architecture diagrams
3. Developer guides
4. Integration examples

---

## 📝 CONTENT TEMPLATES

### **Formula Documentation Template:**

```markdown
## [Formula Name]

**Formula:**
```
formula = component1 + component2
```

**Components:**
- `component1`: Description (manual entry/auto-calculated)
- `component2`: Description (manual entry/auto-calculated)

**Calculation Logic:**
- ✅ Real-time calculation
- ✅ Auto-saves to database
- ✅ Displays with 2 decimal places

**Example:**
```
Component 1: €100.00
Component 2: €50.00
─────────────────────
Result:      €150.00
```

**Related:**
- [Related Formula](./other-formula.md)
- [Business Logic](./business-logic.md)
```

---

## ✅ NEXT STEPS

1. **Create Documentation Folder Structure**
   ```
   docs/
   ├── en/
   └── de/
   ```

2. **Create Core Financial Docs**
   - Calculations-Formulas.md
   - VAT-Calculation.md
   - SKR03-Categories.md

3. **Add to Settings Page**
   - Link to documentation
   - Search functionality
   - Table of contents

4. **Create FAQ Section**
   - Common questions
   - Troubleshooting
   - Contact info

5. **Add Visual Elements**
   - Diagrams
   - Screenshots
   - Examples

---

**Report Generated:** 2026-01-25  
**Status:** Planning Complete - Ready for Implementation
