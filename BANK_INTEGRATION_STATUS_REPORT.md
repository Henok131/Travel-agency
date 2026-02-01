# Bank Integration & Real-Time Financial Calculation Status Report

**Generated:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Purpose:** Current status of financial calculations and implementation plan for Nordigen (GoCardless) bank account data integration

> **⚠️ NOTE:** For **read-only owner cashflow visibility**, see `BANK_READONLY_CASHFLOW_DESIGN.md` instead.  
> This document covers the original plan for transaction matching. The read-only design is separate and does NOT modify booking data.

---

## 📊 CURRENT FINANCIAL CALCULATION STATUS

### ✅ **Currently Implemented**

#### **1. Manual Payment Entry System**
- **`cash_paid`**: Manual numeric entry (NUMERIC(10,2))
- **`bank_transfer`**: Manual numeric entry (NUMERIC(10,2))
- **Status**: ✅ Fully functional
- **Location**: `src/pages/MainTable.jsx`

#### **2. Real-Time Auto-Calculations**

**Formula 1: Total Customer Payment**
```
total_customer_payment = cash_paid + bank_transfer
```
- **Status**: ✅ Working
- **Type**: Real-time calculation + auto-save
- **Trigger Fields**: `cash_paid`, `bank_transfer`
- **Code Location**: 
  - Lines 1154-1160: Real-time calculation
  - Lines 1377-1400: Auto-save calculation
  - Lines 1399-1400: Database update

**Formula 2: Total Amount Due**
```
total_amount_due = total_ticket_price + tot_visa_fees
```
- **Status**: ✅ Working
- **Type**: Real-time calculation + auto-save
- **Trigger Fields**: `airlines_price`, `service_fee`, `visa_price`, `service_visa`

**Formula 3: Payment Balance**
```
payment_balance = total_customer_payment - total_amount_due
```
- **Status**: ✅ Working (display-only, color-coded)
- **Type**: Display calculation (not stored in DB)
- **Visual Indicators**:
  - Green: Fully paid (balance = 0)
  - Red: Customer owes money (negative balance)
  - Normal: Positive balance (overpaid)

#### **3. Current Calculation Flow**

```
User Input (Manual)
    ↓
cash_paid + bank_transfer
    ↓
total_customer_payment (Auto-calculated)
    ↓
Display in UI (Real-time)
    ↓
Save to Database (On blur)
```

---

## ❌ **NOT YET IMPLEMENTED**

### **1. Bank Account Connection**
- ❌ No bank account linking system
- ❌ No OAuth/authentication flow for banks
- ❌ No stored bank credentials

### **2. Automatic Transaction Fetching**
- ❌ No API integration for fetching bank transactions
- ❌ No scheduled sync jobs
- ❌ No transaction history storage

### **3. Transaction Matching**
- ❌ No automatic matching of bank transactions to bookings
- ❌ No matching algorithm (amount, reference, date)
- ❌ No confidence scoring system

### **4. Real-Time Bank Data Integration**
- ❌ `bank_transfer` field is **manually entered only**
- ❌ No automatic updates from bank transactions
- ❌ No webhook support for real-time transaction notifications

---

## 🔌 NORDIGEN (GOCARDLESS BANK ACCOUNT DATA) INTEGRATION

### **What is Nordigen/GoCardless?**

Nordigen (now part of GoCardless) provides **Bank Account Data API** that enables:
- Access to bank account information via Open Banking (PSD2)
- Real-time transaction data retrieval
- Account balance monitoring
- Transaction history access

### **Key Features**

1. **Open Banking Compliance**
   - PSD2 compliant (EU regulation)
   - Secure OAuth-based authentication
   - No screen scraping required

2. **Supported Countries**
   - European Union (all PSD2 countries)
   - UK (Open Banking)
   - Other countries via local Open Banking standards

3. **API Capabilities**
   - List available banks/institutions
   - Initiate bank connection (OAuth flow)
   - Fetch account details
   - Retrieve transactions (with date ranges)
   - Get account balances
   - Real-time webhooks (premium feature)

### **Authentication Flow**

```
1. User clicks "Connect Bank Account"
   ↓
2. Select bank from list (e.g., Commerzbank AG)
   ↓
3. Redirect to bank's OAuth page
   ↓
4. User authorizes access (bank login)
   ↓
5. Redirect back with authorization code
   ↓
6. Exchange code for access token
   ↓
7. Store refresh token securely
   ↓
8. Fetch transactions using access token
```

### **API Endpoints Overview**

**GoCardless Bank Account Data API:**
- `POST /api/v2/token/new/` - Get access token
- `GET /api/v2/institutions/` - List available banks
- `POST /api/v2/requisitions/` - Create bank connection
- `GET /api/v2/accounts/{id}/` - Get account details
- `GET /api/v2/accounts/{id}/transactions/` - Get transactions
- `GET /api/v2/accounts/{id}/balances/` - Get balances

**Documentation**: https://developer.gocardless.com/bank-account-data/

---

## 📋 IMPLEMENTATION REQUIREMENTS

### **Phase 1: Setup & Authentication**

#### **1.1 Register with GoCardless**
- [ ] Create GoCardless account
- [ ] Obtain `SECRET_ID` and `SECRET_KEY`
- [ ] Configure redirect URI (e.g., `https://travel.asenaytech.com/bank/callback`)
- [ ] Set up webhook endpoint (optional, for real-time updates)

#### **1.2 Environment Variables**
```env
# Add to .env
VITE_GOCARDLESS_SECRET_ID=your_secret_id
VITE_GOCARDLESS_SECRET_KEY=your_secret_key
VITE_GOCARDLESS_REDIRECT_URI=https://travel.asenaytech.com/bank/callback
```

#### **1.3 Install Dependencies**
```bash
npm install @gocardless/bank-account-data
# OR use REST API directly with fetch/axios
```

### **Phase 2: Database Schema**

#### **2.1 Bank Accounts Table**
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_number TEXT,
  iban TEXT,
  bank_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gocardless',
  provider_account_id TEXT, -- GoCardless account ID
  connection_status TEXT DEFAULT 'disconnected',
  access_token_encrypted TEXT, -- Encrypted storage
  refresh_token_encrypted TEXT, -- Encrypted storage
  last_sync_at TIMESTAMPTZ,
  auto_sync BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2.2 Bank Transactions Table**
```sql
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY,
  bank_account_id UUID REFERENCES bank_accounts(id),
  transaction_id TEXT NOT NULL, -- Unique from GoCardless
  transaction_date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  reference TEXT, -- Payment reference/verwendungszweck
  counterparty_name TEXT,
  counterparty_iban TEXT,
  transaction_type TEXT, -- credit, debit
  matched_booking_id UUID REFERENCES main_table(id),
  match_confidence DECIMAL(5,2), -- 0-100
  match_status TEXT DEFAULT 'unmatched', -- unmatched, matched, verified
  raw_data JSONB, -- Full transaction data from API
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bank_account_id, transaction_id)
);
```

#### **2.3 Sync Logs Table**
```sql
CREATE TABLE bank_sync_logs (
  id UUID PRIMARY KEY,
  bank_account_id UUID REFERENCES bank_accounts(id),
  sync_status TEXT, -- success, error, partial
  transactions_fetched INTEGER DEFAULT 0,
  transactions_new INTEGER DEFAULT 0,
  transactions_matched INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
```

### **Phase 3: Backend Integration Service**

#### **3.1 Create Bank Service** (`src/lib/bankService.js`)

**Functions Needed:**
- `initializeGoCardless()` - Initialize client with credentials
- `getAccessToken()` - Get/refresh access token
- `listInstitutions(country)` - List available banks
- `createRequisition(institutionId, redirectUri)` - Start OAuth flow
- `getAccounts(requisitionId)` - Get connected accounts
- `fetchTransactions(accountId, dateFrom, dateTo)` - Fetch transactions
- `refreshConnection(accountId)` - Refresh expired tokens

#### **3.2 Transaction Matching Service** (`src/lib/transactionMatcher.js`)

**Matching Algorithm:**
```javascript
function matchTransactionToBooking(transaction, bookings) {
  // 1. Match by exact amount + booking reference
  // 2. Match by exact amount + date range (±7 days)
  // 3. Match by partial reference match
  // 4. Calculate confidence score (0-100)
  // 5. Return best match with confidence
}
```

**Matching Criteria:**
- **Amount Match**: Exact match = 50 points, ±1 EUR = 35 points, ±5 EUR = 20 points
- **Reference Match**: Exact booking_ref match = 30 points, partial = 20 points
- **Date Match**: Same day = 20 points, ±3 days = 15 points, ±7 days = 10 points
- **Minimum Confidence**: 50% required for auto-match

### **Phase 4: Frontend UI Components**

#### **4.1 Bank Connection Page** (`src/pages/BankConnection.jsx`)
- List connected bank accounts
- "Connect New Bank" button
- Bank selection dropdown (filter by country)
- Connection status indicators
- Last sync timestamp

#### **4.2 Transaction Matching Page** (`src/pages/TransactionMatching.jsx`)
- List unmatched transactions
- Show suggested matches (with confidence scores)
- Manual match/unmatch interface
- Bulk matching actions
- Transaction details view

#### **4.3 Settings Integration**
- Add bank settings section to existing Settings page
- Configure auto-sync frequency
- Enable/disable auto-matching
- Set matching confidence threshold

### **Phase 5: Real-Time Updates**

#### **5.1 Scheduled Sync Jobs**
- Daily sync at configured time
- Fetch transactions from last sync date
- Auto-match new transactions
- Update `bank_transfer` field in `main_table`

#### **5.2 Webhook Support** (Optional - Premium Feature)
- Receive real-time transaction notifications
- Immediate matching and calculation updates
- Requires webhook endpoint setup

---

## 🔄 INTEGRATION WITH EXISTING FINANCIAL CALCULATIONS

### **Current Flow (Manual)**
```
User manually enters bank_transfer
    ↓
total_customer_payment = cash_paid + bank_transfer (auto-calculated)
    ↓
payment_balance = total_customer_payment - total_amount_due (display)
```

### **New Flow (With Bank Integration)**
```
Bank transaction detected (via API)
    ↓
Match transaction to booking (auto or manual)
    ↓
Update bank_transfer field automatically
    ↓
total_customer_payment = cash_paid + bank_transfer (auto-calculated)
    ↓
payment_balance = total_customer_payment - total_amount_due (display)
    ↓
Real-time UI update
```

### **Code Changes Required**

**File: `src/pages/MainTable.jsx`**

1. **Add transaction sync trigger:**
```javascript
// After fetching requests, check for new bank transactions
useEffect(() => {
  if (requests.length > 0) {
    syncBankTransactions()
  }
}, [requests.length])
```

2. **Update bank_transfer when transaction matched:**
```javascript
// In transaction matching callback
const handleTransactionMatched = async (transactionId, bookingId) => {
  const transaction = await getTransaction(transactionId)
  await updateBookingBankTransfer(bookingId, transaction.amount)
  // This will trigger existing auto-calculation
}
```

---

## 🔐 SECURITY CONSIDERATIONS

### **1. Token Storage**
- **NEVER** store access tokens in plain text
- Use Supabase Vault or encryption at rest
- Store refresh tokens securely (encrypted)
- Implement token rotation

### **2. API Credentials**
- Store `SECRET_ID` and `SECRET_KEY` in environment variables
- Never expose in frontend code
- Use Supabase Edge Functions for API calls (server-side)

### **3. User Authorization**
- Only fetch transactions for connected accounts
- Verify user owns the account before matching
- Implement proper OAuth flow with state validation

### **4. Data Privacy**
- Comply with GDPR requirements
- Encrypt sensitive transaction data
- Implement data retention policies
- Allow users to disconnect accounts

---

## 📈 BENEFITS OF BANK INTEGRATION

### **1. Real-Time Financial Accuracy**
- ✅ Automatic detection of payments
- ✅ No manual entry errors
- ✅ Instant payment status updates

### **2. Time Savings**
- ✅ Eliminates manual bank transfer entry
- ✅ Automatic transaction matching
- ✅ Reduced reconciliation time

### **3. Better Cash Flow Management**
- ✅ Real-time balance tracking
- ✅ Payment status visibility
- ✅ Outstanding payment alerts

### **4. Audit Trail**
- ✅ Complete transaction history
- ✅ Matching confidence scores
- ✅ Sync logs for debugging

---

## 🚧 IMPLEMENTATION CHALLENGES

### **1. OAuth Flow Complexity**
- **Challenge**: Multi-step redirect flow
- **Solution**: Use Supabase Edge Functions for server-side handling

### **2. Token Management**
- **Challenge**: Access tokens expire, need refresh
- **Solution**: Implement automatic token refresh on API calls

### **3. Transaction Matching Accuracy**
- **Challenge**: False positives/negatives
- **Solution**: Configurable confidence thresholds, manual review interface

### **4. Bank API Rate Limits**
- **Challenge**: API rate limits may restrict frequent syncing
- **Solution**: Implement smart sync scheduling, cache results

### **5. Multi-Currency Support**
- **Challenge**: Transactions in different currencies
- **Solution**: Store currency, convert to EUR using exchange rates

---

## 📝 IMPLEMENTATION CHECKLIST

### **Phase 1: Foundation**
- [ ] Register GoCardless account
- [ ] Obtain API credentials
- [ ] Set up environment variables
- [ ] Create database migrations (bank_accounts, bank_transactions, bank_sync_logs)
- [ ] Install GoCardless SDK or set up REST API client

### **Phase 2: Authentication**
- [ ] Create bank connection UI component
- [ ] Implement OAuth redirect flow
- [ ] Store encrypted tokens in database
- [ ] Test connection with test bank (sandbox)

### **Phase 3: Data Fetching**
- [ ] Implement transaction fetching service
- [ ] Create sync job function
- [ ] Store transactions in database
- [ ] Handle pagination for large transaction lists

### **Phase 4: Matching**
- [ ] Implement matching algorithm
- [ ] Create matching UI
- [ ] Auto-match high-confidence transactions
- [ ] Manual match interface for review

### **Phase 5: Integration**
- [ ] Update `bank_transfer` field automatically
- [ ] Trigger existing calculation system
- [ ] Update UI in real-time
- [ ] Add sync status indicators

### **Phase 6: Testing**
- [ ] Test with sandbox/test bank
- [ ] Test matching algorithm accuracy
- [ ] Test token refresh flow
- [ ] Test error handling (API failures, expired tokens)

### **Phase 7: Production**
- [ ] Deploy to production
- [ ] Connect real bank accounts
- [ ] Monitor sync logs
- [ ] Gather user feedback

---

## 🔗 RESOURCES

### **GoCardless Documentation**
- **API Overview**: https://developer.gocardless.com/bank-account-data/overview/
- **Quickstart Guide**: https://developer.gocardless.com/bank-account-data/quick-start-guide/
- **API Endpoints**: https://developer.gocardless.com/bank-account-data/endpoints/
- **Libraries**: https://developer.gocardless.com/bank-account-data/libraries/

### **Open Banking Standards**
- **PSD2**: Payment Services Directive 2 (EU)
- **Open Banking UK**: UK Open Banking Standard
- **Nordigen**: https://nordigen.com/ (GoCardless acquisition)

### **Important Note**
⚠️ **Nordigen Python Library**: The `nordigen` Python package is no longer actively maintained by GoCardless, though it may still function. For new implementations, use the official GoCardless Bank Account Data API directly via REST or official SDKs.

---

## 📊 CURRENT STATUS SUMMARY

| Feature | Status | Notes |
|---------|--------|-------|
| Manual `bank_transfer` entry | ✅ Working | Users manually enter bank transfer amounts |
| Real-time calculations | ✅ Working | `total_customer_payment` auto-calculates |
| Payment balance display | ✅ Working | Color-coded balance indicators |
| Bank account connection | ❌ Not implemented | No OAuth flow, no bank linking |
| Transaction fetching | ❌ Not implemented | No API integration |
| Transaction matching | ❌ Not implemented | No matching algorithm |
| Auto-update `bank_transfer` | ❌ Not implemented | Manual entry only |

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Start with Phase 1**: Register GoCardless account and obtain credentials
2. **Create database schema**: Implement bank_accounts and bank_transactions tables
3. **Build OAuth flow**: Start with bank connection UI and redirect handling
4. **Test with sandbox**: Use GoCardless test environment before production
5. **Implement matching**: Start with simple amount-based matching, then add reference matching
6. **Integrate gradually**: Connect one bank account first, test thoroughly, then expand

---

**End of Report**
