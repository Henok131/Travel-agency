# Financial Calculations & Formulas

## Overview

This document explains all financial calculations used in the LST Travel system. All formulas are **auto-calculated in real-time** as you enter data. No manual calculation required.

---

## Table of Contents

1. [Total Ticket Price](#total-ticket-price)
2. [Total Visa Fees](#total-visa-fees)
3. [Total Customer Payment](#total-customer-payment)
4. [Total Amount Due](#total-amount-due)
5. [Payment Balance](#payment-balance)
6. [LST Profit](#lst-profit)
7. [Calculation Dependencies](#calculation-dependencies)
8. [Examples](#examples)
9. [Rounding Rules](#rounding-rules)
10. [Edge Cases](#edge-cases)

---

## Total Ticket Price

**Formula:**
```
total_ticket_price = airlines_price + service_fee
```

**Components:**
- `airlines_price`: Base price charged by airlines (manual entry)
- `service_fee`: Service ticket charged to customer (manual entry)

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0

**Example:**
```
Airlines Price: €500.00
Service Ticket:   €50.00
─────────────────────
Total Ticket:  €550.00
```

**Real-World Scenario:**
- Customer books a flight from Frankfurt to London
- Airlines charges: €500.00
- LST service ticket: €50.00
- **Total ticket price: €550.00**

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

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0

**Example:**
```
Visa Price:    €80.00
Service Visa:  €20.00
─────────────────────
Total Visa:    €100.00
```

**Real-World Scenario:**
- Customer needs a UK visa
- Visa application fee: €80.00
- LST visa processing service fee: €20.00
- **Total visa fees: €100.00**

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

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0

**Example:**
```
Cash Paid:        €200.00
Bank Transfer:    €450.00
─────────────────────────
Total Payment:    €650.00
```

**Real-World Scenario:**
- Customer pays partially in cash: €200.00
- Customer pays remaining via bank transfer: €450.00
- **Total customer payment: €650.00**

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
- 🟠 **Orange/yellow background highlight** in UI (makes it easy to spot)

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0

**Example:**
```
Total Ticket Price: €550.00
Total Visa Fees:    €100.00
────────────────────────────
Total Amount Due:  €650.00
```

**Real-World Scenario:**
- Customer books flight (€550.00) + visa (€100.00)
- **Total amount due: €650.00**

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

**Important:** This field is **display-only** and NOT stored in the database. It's calculated on-the-fly for display purposes.

**Example Scenarios:**

### Scenario 1: Fully Paid ✅
```
Total Customer Payment: €650.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €0.00 ✅ Fully Paid
```

### Scenario 2: Customer Owes ⚠️
```
Total Customer Payment: €500.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         -€150.00 ⚠️ Customer Owes €150
```

### Scenario 3: Overpaid 💰
```
Total Customer Payment: €700.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €50.00 💰 Overpaid by €50
```

**Real-World Use Cases:**

**Case 1: Partial Payment**
- Customer pays €500.00 upfront
- Total amount due: €650.00
- **Balance: -€150.00** (customer still owes €150.00)

**Case 2: Refund Situation**
- Customer paid €700.00
- Total amount due: €650.00
- **Balance: €50.00** (customer overpaid, refund needed)

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
- `service_fee`: Service ticket income (positive)
- `service_visa`: Visa service fee income (positive)
- `commission_from_airlines`: Commission received (positive)
- `lst_loan_fee`: Loan fee deduction (subtracted)

**Business Logic:**
- **Positive Value:** Profit (income exceeds deductions)
- **Negative Value:** Loss (loan fee exceeds income)
- **Zero Value:** Break-even

**Calculation Logic:**
- ✅ Real-time calculation during editing
- ✅ Auto-saves to database when components change
- ✅ Displays with 2 decimal places
- ✅ Shows `-` if result = 0
- ✅ **Can display negative values** (loss situation)

**Example 1: Profit ✅**
```
Service Ticket:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€10.00
──────────────────────────────
LST Profit:             €90.00 ✅ Profit
```

**Example 2: Loss ⚠️**
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

**Example 3: Break-Even**
```
Service Ticket:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€100.00
──────────────────────────────
LST Profit:             €0.00 (Break-even)
```

**Real-World Scenarios:**

**Scenario 1: Successful Booking**
- Service ticket + Service visa: €50 + €20 = €70
- Airline commission: €30
- Loan fee: €10
- **Profit: €90.00**

**Scenario 2: High Loan Fee**
- Service ticket + Service visa: €10 + €5 = €15
- Airline commission: €2
- Loan fee: €20
- **Loss: -€3.00** (loan fee exceeds income)

**Related:**
- [Service Ticket](#total-ticket-price)
- [Service Visa](#total-visa-fees)
- [Commission Logic](./commission-logic.md) _(coming soon)_

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

#### **When Editing `service_fee` (Service Ticket):**
1. Updates `total_ticket_price` (immediate)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)
4. Updates `lst_profit` (immediate)

#### **When Editing `airlines_price`:**
1. Updates `total_ticket_price` (immediate)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)

#### **When Editing `visa_price`:**
1. Updates `tot_visa_fees` (immediate)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)

#### **When Editing `service_visa`:**
1. Updates `tot_visa_fees` (immediate)
2. Updates `total_amount_due` (cascades)
3. Updates `payment_balance` (cascades)
4. Updates `lst_profit` (immediate)

#### **When Editing `cash_paid`:**
1. Updates `total_customer_payment` (immediate)
2. Updates `payment_balance` (cascades)

#### **When Editing `bank_transfer`:**
1. Updates `total_customer_payment` (immediate)
2. Updates `payment_balance` (cascades)

#### **When Editing `commission_from_airlines`:**
1. Updates `lst_profit` (immediate)

#### **When Editing `lst_loan_fee`:**
1. Updates `lst_profit` (immediate)

---

## Examples

### **Complete Booking Example:**

**Input Values:**
- Airlines Price: €500.00
- Service Ticket: €50.00
- Visa Price: €80.00
- Service Visa: €20.00
- Cash Paid: €200.00
- Bank Transfer: €450.00
- Commission from Airlines: €30.00
- LST Loan Fee: €10.00

**Step-by-Step Calculations:**

**Step 1: Calculate Total Ticket Price**
```
total_ticket_price = airlines_price + service_fee
total_ticket_price = €500.00 + €50.00
total_ticket_price = €550.00
```

**Step 2: Calculate Total Visa Fees**
```
tot_visa_fees = visa_price + service_visa
tot_visa_fees = €80.00 + €20.00
tot_visa_fees = €100.00
```

**Step 3: Calculate Total Amount Due**
```
total_amount_due = total_ticket_price + tot_visa_fees
total_amount_due = €550.00 + €100.00
total_amount_due = €650.00
```

**Step 4: Calculate Total Customer Payment**
```
total_customer_payment = cash_paid + bank_transfer
total_customer_payment = €200.00 + €450.00
total_customer_payment = €650.00
```

**Step 5: Calculate Payment Balance**
```
payment_balance = total_customer_payment - total_amount_due
payment_balance = €650.00 - €650.00
payment_balance = €0.00 ✅ Fully Paid
```

**Step 6: Calculate LST Profit**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
lst_profit = €50.00 + €20.00 + €30.00 - €10.00
lst_profit = €90.00 ✅ Profit
```

**Final Summary:**
```
┌─────────────────────────────────────┐
│         BOOKING SUMMARY              │
├─────────────────────────────────────┤
│ Total Ticket Price:    €550.00     │
│ Total Visa Fees:       €100.00     │
│ ─────────────────────────────────── │
│ Total Amount Due:      €650.00     │
│ Total Customer Payment: €650.00     │
│ ─────────────────────────────────── │
│ Payment Balance:        €0.00 ✅     │
│ ─────────────────────────────────── │
│ LST Profit:            €90.00 ✅    │
└─────────────────────────────────────┘
```

---

## Rounding Rules

### **Decimal Precision:**
- All calculations use **2 decimal places**
- Rounding method: **Standard rounding** (0.5 rounds up)
- Display format: `XX.XX` (e.g., `550.00`)

### **Zero Value Display:**
- Zero values display as `-` (empty string)
- Exception: `payment_balance` shows `€0.00` when fully paid

### **Examples:**

**Rounding Examples:**
- `550.004` → `550.00`
- `550.005` → `550.01` (rounds up)
- `550.015` → `550.02` (rounds up)

**Zero Display Examples:**
- `total_ticket_price = 0` → displays as `-`
- `payment_balance = 0` → displays as `€0.00 ✅ Fully Paid`

---

## Edge Cases

### **NULL Values:**
- NULL values are treated as `0` in calculations
- If all components are NULL, result is NULL (displays as `-`)

**Example:**
```
airlines_price = NULL (treated as 0)
service_fee = NULL (treated as 0)
total_ticket_price = 0 + 0 = 0 → displays as "-"
```

### **Negative Values:**
- `cash_paid` and `bank_transfer` can be negative (refunds)
- `lst_loan_fee` is subtracted (can cause negative profit)
- `payment_balance` can be negative (customer owes)

**Example 1: Refund**
```
cash_paid = -€50.00 (refund given)
bank_transfer = €700.00
total_customer_payment = -€50.00 + €700.00 = €650.00
```

**Example 2: Negative Profit**
```
service_fee (Service Ticket) = €10.00
service_visa = €5.00
commission = €2.00
loan_fee = €20.00
lst_profit = €10 + €5 + €2 - €20 = -€3.00 ⚠️ Loss
```

**Example 3: Customer Owes**
```
total_customer_payment = €500.00
total_amount_due = €650.00
payment_balance = €500 - €650 = -€150.00 ⚠️ Customer Owes €150
```

### **Very Large Numbers:**
- System supports up to **€99,999,999.99** (NUMERIC(10,2))
- No automatic validation for maximum values
- Use common sense when entering amounts

### **Partial Payments:**
- Customer can pay in multiple installments
- System tracks cumulative payments
- Payment balance updates automatically

**Example:**
```
Total Amount Due: €650.00

Payment 1: Cash €200.00
  → Payment Balance: -€450.00 (customer owes €450)

Payment 2: Bank Transfer €450.00
  → Payment Balance: €0.00 ✅ Fully Paid
```

---

## Related Documentation

### **Financial System:**
- [Payment Methods](./payment-methods.md) _(coming soon)_
- [Commission Logic](./commission-logic.md) _(coming soon)_
- [Accounting Basics](./accounting-basics.md) _(coming soon)_

### **Tax Compliance:**
- [VAT Calculation](../03-tax/vat-calculation.md) _(coming soon)_
- [SKR03 Categories](../03-tax/skr03-categories.md) _(coming soon)_

### **Features:**
- [Booking Management](../04-features/booking-management.md) _(coming soon)_
- [Request Creation](../04-features/request-creation.md) _(coming soon)_

### **FAQ:**
- [Financial Questions](../05-faq/financial-questions.md) _(coming soon)_

---

## Quick Reference

### **Formula Cheat Sheet:**

```
1. total_ticket_price = airlines_price + service_fee
2. tot_visa_fees = visa_price + service_visa
3. total_customer_payment = cash_paid + bank_transfer
4. total_amount_due = total_ticket_price + tot_visa_fees
5. payment_balance = total_customer_payment - total_amount_due
6. lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```

### **Calculation Order:**

1. Calculate ticket and visa totals first
2. Sum them for total amount due
3. Sum payment methods for total customer payment
4. Calculate balance (payment - due)
5. Calculate profit (income - deductions)

---

**Last Updated:** 2026-01-25  
**Version:** 1.0  
**Status:** ✅ Complete
