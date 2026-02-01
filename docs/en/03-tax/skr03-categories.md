# SKR03 Tax Categories (German Accounting)

## Overview

SKR03 (Standardkontenrahmen 03) is the German standard chart of accounts. Each expense category has a code and deductible percentage for tax reporting.

---

## Complete Category List

| Code | Category Name | Deductible % | Description | Use Cases |
|------|--------------|--------------|-------------|-----------|
| **4210** | Vehicle Expenses | 100% | Car-related costs | Fuel, maintenance, insurance, repairs |
| **4800** | Miscellaneous | 100% | Default fallback | Unspecified expenses, general costs |
| **4890** | Bank Fees | 100% | Banking costs | Transaction fees, account fees, wire transfers |
| **4910** | Telephone & Internet | 100% | Communication services | Phone bills, internet, mobile plans, VoIP |
| **4920** | Office Rent | 100% | Office space rental | Office rental, workspace costs, co-working spaces |
| **4930** | Utilities | 100% | Building utilities | Electricity, water, heating, gas, waste disposal |
| **4940** | Office Supplies | 100% | Office materials | Stationery, equipment, furniture, supplies |
| **4960** | Software & Tools | 100% | Software costs | Subscriptions, licenses, cloud services, tools |
| **6000** | Staff Salary | 100% | Employee wages | Salaries, wages, benefits, payroll costs |
| **6300** | Travel Expenses | 100% | Business travel | Flights, hotels, meals (during travel), transport |
| **6400** | Advertising & Marketing | 100% | Marketing costs | Ads, campaigns, promotions, social media |
| **6805** | Meal & Entertainment | **70%** ⚠️ | Business meals | Restaurant, catering, events, client entertainment |
| **6825** | Training & Education | 100% | Learning costs | Courses, training, education, certifications |
| **6850** | Legal & Consulting | 100% | Professional services | Legal fees, consulting, accounting, tax advice |

---

## Important Rules

### **70% Deductible Rule**

**Category 6805 (Meal & Entertainment)** is only **70% tax deductible** according to German tax law.

**Why?** German tax authorities consider business meals and entertainment as partially personal expenses, so only 70% can be deducted from taxable income.

**Example:**
```
Expense: €100.00 (business meal)
Deductible: €70.00 (70%)
Non-deductible: €30.00 (30%)
```

**When to Use:**
- Business lunches with clients
- Company dinners
- Catering for events
- Client entertainment expenses

---

### **100% Deductible**

All other categories are **100% tax deductible**. The full expense amount can be deducted from taxable income.

**Example:**
```
Expense: €100.00 (office supplies)
Deductible: €100.00 (100%)
Non-deductible: €0.00
```

---

## Use Case Examples

### **Example 1: Office Rent (4920)**
```
Expense: €1,200.00/month office rent
Category: 4920 - Office Rent
Deductible: 100% (€1,200.00)
Use Case: Monthly office space rental payment
```

### **Example 2: Business Meal (6805)**
```
Expense: €150.00 client lunch
Category: 6805 - Meal & Entertainment
Deductible: 70% (€105.00)
Non-deductible: 30% (€45.00)
Use Case: Business lunch with potential client
```

### **Example 3: Software Subscription (4960)**
```
Expense: €29.99/month cloud service
Category: 4960 - Software & Tools
Deductible: 100% (€29.99)
Use Case: Monthly subscription for project management tool
```

### **Example 4: Travel Expenses (6300)**
```
Expense: €450.00 flight + €120.00 hotel
Category: 6300 - Travel Expenses
Deductible: 100% (€570.00)
Use Case: Business trip to attend conference
```

### **Example 5: Bank Fees (4890)**
```
Expense: €5.00 wire transfer fee
Category: 4890 - Bank Fees
Deductible: 100% (€5.00)
Use Case: International payment processing fee
```

---

## Auto-Assignment

When you select a category in the expense form:

- ✅ System automatically assigns SKR03 code
- ✅ System automatically sets deductible percentage
- ✅ No manual entry required

**Example:**
```
User selects: "Meal & Entertainment"
System assigns:
  - tax_category_code: "6805"
  - deductible_percentage: 70.00
```

---

## Category Selection Tips

### **Choose the Right Category:**

1. **Meal & Entertainment (6805)** - Only for business meals and client entertainment
2. **Travel Expenses (6300)** - For meals during business travel (100% deductible)
3. **Office Supplies (4940)** - For physical office materials
4. **Software & Tools (4960)** - For digital tools and subscriptions
5. **Miscellaneous (4800)** - Use only when no other category fits

---

## Related Documentation

- [VAT Calculation](./vat-calculation.md)
- [Deductible Percentages](./deductible-percentages.md) _(coming soon)_
- [German Tax Reporting](./german-tax-reporting.md) _(coming soon)_
- [Financial Calculations](../02-financial/calculations.md)

---

**Last Updated:** 2026-01-25  
**Version:** 1.0
