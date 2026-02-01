# VAT (Value Added Tax) Calculation

## Overview

The system automatically calculates VAT (Mehrwertsteuer) for German tax compliance. All calculations follow German tax law and update **in real-time** as you type.

---

## Formulas

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

---

## Standard VAT Rates (Germany)

- **Standard Rate:** 19% (default for most goods and services)
- **Reduced Rate:** 7% (books, food, certain services)
- **Zero Rate:** 0% (exports, certain services)

---

## Examples

### **Example 1: Standard 19% VAT (From Gross)**

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

---

### **Example 2: Reduced 7% VAT (From Gross)**

**Input:**
- Gross Amount: €107.00
- VAT Rate: 7%

**Calculation:**
```
Net Amount = €107.00 ÷ 1.07 = €100.00
VAT Amount = €107.00 - €100.00 = €7.00
```

---

### **Example 3: From Net Amount (19%)**

**Input:**
- Net Amount: €100.00
- VAT Rate: 19%

**Calculation:**
```
Gross Amount = €100.00 × 1.19 = €119.00
VAT Amount = €119.00 - €100.00 = €19.00
```

---

## Real-Time Calculation

The system calculates VAT **automatically** as you type:

- ✅ **Editing `gross_amount`** → Auto-calculates `net_amount` and `vat_amount`
- ✅ **Editing `vat_rate`** → Auto-calculates `net_amount` and `vat_amount`
- ✅ **Editing `net_amount`** → Auto-calculates `gross_amount` and `vat_amount`

**No save required** - calculations update instantly in the UI.

---

## Rounding

- All amounts rounded to **2 decimal places**
- Uses standard rounding (0.5 rounds up)
- Example: €100.005 → €100.01

---

## Related Documentation

- [SKR03 Tax Categories](./skr03-categories.md) _(coming soon)_
- [Deductible Percentages](./deductible-percentages.md) _(coming soon)_
- [German Tax Reporting](./german-tax-reporting.md) _(coming soon)_
- [Financial Calculations](../02-financial/calculations.md)

---

**Last Updated:** 2026-01-25  
**Version:** 1.0
