# SaaS Production Conversion Analysis Report

**Date:** 2026-01-25  
**Current Application:** LST Travel Backoffice System / Kingstyle Hair & Cosmetics Admin Panel  
**Target:** Multi-tenant SaaS Platform  
**Status:** Analysis & Recommendations

---

## Executive Summary

This report analyzes the current application state and provides a comprehensive roadmap for converting it into a production-ready SaaS platform. The application currently operates as a single-tenant system with basic authentication and needs significant architectural changes for multi-tenancy, security, scalability, and monetization.

### Current State Assessment

| Category | Status | Production Ready? |
|----------|--------|-------------------|
| **Core Functionality** | ✅ Complete | ✅ Yes |
| **Authentication** | ⚠️ Basic (Hardcoded) | ❌ No |
| **Multi-tenancy** | ❌ Not Implemented | ❌ No |
| **Security (RLS)** | ⚠️ Partial | ⚠️ Needs Review |
| **Billing/Subscriptions** | ❌ Not Implemented | ❌ No |
| **API Architecture** | ⚠️ Direct DB Access | ⚠️ Needs Backend |
| **Monitoring/Logging** | ❌ Not Implemented | ❌ No |
| **Error Handling** | ⚠️ Basic | ⚠️ Needs Improvement |
| **Data Isolation** | ❌ Not Implemented | ❌ No |

---

## 1. Current Architecture Analysis

### 1.1 Technology Stack

**Frontend:**
- React 18.2.0
- Vite 5.0.8
- React Router DOM 6.20.0
- Recharts 3.6.0 (analytics)
- jsPDF 4.0.0 (invoice generation)

**Backend/Database:**
- Supabase (PostgreSQL)
- Direct client-side database access
- No traditional backend API layer

**Current Deployment:**
- Static build (`dist` folder)
- Environment variables for Supabase credentials
- No CI/CD pipeline visible

### 1.2 Database Schema

**Current Tables:**
1. `requests` - Travel request data
2. `main_table` - Booking management
3. `expenses` - Expense tracking
4. `time_slots` - Appointment slots
5. `bookings` - Customer appointments
6. Additional tables for products, customers, orders, etc.

**Key Observations:**
- No `organization_id` or `tenant_id` columns
- No user management tables
- No subscription/billing tables
- RLS policies exist but may not be properly configured for multi-tenancy

### 1.3 Authentication System

**Current Implementation:**
- Hardcoded credentials in `AuthContext.jsx`
- Session stored in localStorage (24-hour expiry)
- No password hashing
- No user roles/permissions
- No password reset functionality
- No email verification

**Security Concerns:**
- Credentials exposed in source code
- No encryption for stored sessions
- No rate limiting
- No 2FA support

---

## 2. Critical Gaps for SaaS Production

### 2.1 Multi-Tenancy Architecture

**Required Changes:**

1. **Database Schema Updates:**
   - Add `organizations` table (tenant management)
   - Add `organization_id` to all data tables
   - Implement Row Level Security (RLS) policies for data isolation
   - Add `users` table with organization relationships

2. **Application Architecture:**
   - Tenant context provider
   - Route-level tenant validation
   - Data filtering by organization_id
   - Subdomain/domain-based tenant routing (optional)

3. **Data Isolation:**
   - Ensure all queries filter by organization_id
   - RLS policies enforce tenant boundaries
   - Prevent cross-tenant data access

### 2.2 Authentication & Authorization

**Required Implementation:**

1. **Supabase Auth Integration:**
   - Replace hardcoded auth with Supabase Auth
   - Email/password authentication
   - Social login (Google, etc.) - optional
   - Password reset flow
   - Email verification

2. **User Management:**
   - User registration
   - User profiles
   - Role-based access control (RBAC)
   - Team member invitations
   - User permissions per organization

3. **Session Management:**
   - Secure session tokens (JWT)
   - Refresh token rotation
   - Session invalidation
   - Multi-device session management

### 2.3 Billing & Subscription Management

**Required Components:**

1. **Subscription Plans:**
   - Free tier (limited features)
   - Basic plan (standard features)
   - Pro plan (advanced features)
   - Enterprise plan (custom pricing)

2. **Payment Integration:**
   - Stripe integration (recommended)
   - Subscription management
   - Usage-based billing (if applicable)
   - Invoice generation
   - Payment method management

3. **Database Schema:**
   - `subscriptions` table
   - `plans` table
   - `payments` table
   - `invoices` table
   - `usage_metrics` table

4. **Feature Gating:**
   - Plan-based feature access
   - Usage limits enforcement
   - Upgrade/downgrade flows

### 2.4 Security Enhancements

**Critical Security Requirements:**

1. **Row Level Security (RLS):**
   - Verify all tables have RLS enabled
   - Create tenant-scoped policies
   - Test data isolation thoroughly
   - Prevent SQL injection

2. **API Security:**
   - Rate limiting
   - Request validation
   - CORS configuration
   - API key management (if needed)

3. **Data Protection:**
   - Encryption at rest (Supabase handles this)
   - Encryption in transit (HTTPS)
   - PII data handling (GDPR compliance)
   - Audit logging

4. **Authentication Security:**
   - Password complexity requirements
   - Account lockout after failed attempts
   - Session timeout
   - CSRF protection

### 2.5 Backend API Layer

**Current State:** Direct Supabase client access from frontend

**Recommended Approach:**

1. **Option A: Supabase Edge Functions (Recommended)**
   - Serverless functions for business logic
   - API endpoints for sensitive operations
   - Rate limiting and validation
   - Keep direct access for simple queries

2. **Option B: Traditional Backend**
   - Node.js/Express or Python/FastAPI
   - RESTful API or GraphQL
   - More control but more infrastructure

**Key API Endpoints Needed:**
- `/api/auth/*` - Authentication
- `/api/organizations/*` - Tenant management
- `/api/subscriptions/*` - Billing
- `/api/users/*` - User management
- `/api/admin/*` - Admin operations

### 2.6 Monitoring & Observability

**Required Tools:**

1. **Error Tracking:**
   - Sentry or similar
   - Error logging and alerting
   - User feedback collection

2. **Analytics:**
   - User behavior tracking
   - Feature usage metrics
   - Performance monitoring
   - Business metrics (MRR, churn, etc.)

3. **Logging:**
   - Application logs
   - API request logs
   - Audit trail for sensitive operations
   - Log aggregation (e.g., Logtail, Datadog)

4. **Performance Monitoring:**
   - Database query performance
   - API response times
   - Frontend performance (Core Web Vitals)
   - Uptime monitoring

### 2.7 Scalability Considerations

**Current Limitations:**

1. **Database:**
   - Single Supabase project (shared resources)
   - No read replicas
   - No connection pooling optimization
   - No query optimization for scale

2. **Frontend:**
   - Large bundle size (~2.3MB)
   - No code splitting
   - No CDN optimization
   - No caching strategy

3. **Infrastructure:**
   - No load balancing
   - No auto-scaling
   - No geographic distribution

**Recommendations:**
- Implement database indexing strategy
- Add query result caching (Redis)
- Implement CDN for static assets
- Code splitting for better performance
- Database connection pooling
- Consider read replicas at scale

---

## 3. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Priority: CRITICAL**

1. **Multi-Tenancy Setup**
   - Create `organizations` table
   - Add `organization_id` to all data tables
   - Migrate existing data (assign to default org)
   - Update all queries to include organization filter

2. **Authentication Overhaul**
   - Integrate Supabase Auth
   - Replace hardcoded credentials
   - Implement user registration/login
   - Add password reset flow

3. **RLS Policy Implementation**
   - Enable RLS on all tables
   - Create tenant-scoped policies
   - Test data isolation thoroughly
   - Document security model

**Files to Modify:**
- `src/contexts/AuthContext.jsx` - Complete rewrite
- `src/lib/supabase.js` - Add organization context
- All SQL migration files - Add organization_id columns
- All data fetching components - Add organization filter

### Phase 2: User Management (Weeks 3-4)

**Priority: HIGH**

1. **User Management System**
   - User profiles
   - Team member invitations
   - Role-based permissions
   - User settings

2. **Organization Management**
   - Organization creation
   - Organization settings
   - Member management
   - Organization switching (if multi-org users)

**Database Tables Needed:**
- `users` (extends Supabase auth.users)
- `organization_members` (many-to-many)
- `roles` and `permissions`
- `user_sessions`

### Phase 3: Billing & Subscriptions (Weeks 5-7)

**Priority: HIGH**

1. **Stripe Integration**
   - Stripe account setup
   - Subscription plans configuration
   - Payment method management
   - Webhook handling

2. **Subscription Management**
   - Plan selection UI
   - Subscription creation/updates
   - Usage tracking
   - Billing cycles

3. **Feature Gating**
   - Plan-based feature flags
   - Usage limit enforcement
   - Upgrade prompts
   - Feature comparison UI

**Database Tables Needed:**
- `subscriptions`
- `plans`
- `payments`
- `invoices`
- `usage_metrics`

**New Components:**
- Subscription management page
- Billing settings page
- Plan selection modal
- Usage dashboard

### Phase 4: API & Backend (Weeks 8-9)

**Priority: MEDIUM**

1. **Supabase Edge Functions**
   - Authentication endpoints
   - Subscription webhooks
   - Admin operations
   - Data export/import

2. **API Security**
   - Rate limiting
   - Request validation
   - Error handling
   - Logging

**Edge Functions Needed:**
- `auth-handler` - Custom auth logic
- `stripe-webhook` - Payment processing
- `admin-operations` - Sensitive admin tasks
- `data-export` - GDPR compliance

### Phase 5: Monitoring & Observability (Week 10)

**Priority: MEDIUM**

1. **Error Tracking**
   - Sentry integration
   - Error boundaries
   - User feedback

2. **Analytics**
   - User behavior tracking
   - Feature usage
   - Business metrics

3. **Logging**
   - Application logs
   - Audit trail
   - Performance monitoring

### Phase 6: Performance & Optimization (Week 11)

**Priority: LOW (Can be done post-launch)**

1. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Bundle optimization
   - CDN setup

2. **Database Optimization**
   - Query optimization
   - Indexing strategy
   - Caching layer (Redis)
   - Connection pooling

### Phase 7: Compliance & Legal (Ongoing)

**Priority: HIGH (Before Launch)**

1. **GDPR Compliance**
   - Privacy policy
   - Data export functionality
   - Data deletion (right to be forgotten)
   - Cookie consent

2. **Terms of Service**
   - Terms of service
   - Acceptable use policy
   - SLA definition

3. **Security Audits**
   - Penetration testing
   - Security review
   - Compliance certification

---

## 4. Database Schema Changes Required

### 4.1 New Tables

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id),
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (many-to-many)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Subscription Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Metrics
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  metric_type TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric_type, period_start)
);
```

### 4.2 Schema Modifications

**Add to ALL existing tables:**
```sql
ALTER TABLE requests ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE main_table ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE time_slots ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
-- ... and all other data tables
```

**Create Indexes:**
```sql
CREATE INDEX idx_requests_org ON requests(organization_id);
CREATE INDEX idx_main_table_org ON main_table(organization_id);
-- ... for all tables
```

---

## 5. Code Changes Required

### 5.1 Authentication Context Rewrite

**Current:** `src/contexts/AuthContext.jsx` - Hardcoded credentials

**New Implementation:**
- Use Supabase Auth (`supabase.auth`)
- Session management via Supabase
- Organization context provider
- User profile management

**Key Functions:**
- `signUp(email, password, organizationName)`
- `signIn(email, password)`
- `signOut()`
- `resetPassword(email)`
- `updateProfile(data)`
- `getCurrentOrganization()`

### 5.2 Data Access Layer

**Current:** Direct Supabase queries in components

**New Pattern:**
```javascript
// Instead of:
const { data } = await supabase.from('requests').select('*')

// Use:
const { data } = await supabase
  .from('requests')
  .select('*')
  .eq('organization_id', currentOrganizationId)
```

**Create Helper Functions:**
- `getOrganizationId()` - Get current org from context
- `withOrganization(query)` - Auto-add org filter
- `createDataAccessLayer()` - Centralized data access

### 5.3 Component Updates

**All data-fetching components need:**
- Organization context integration
- Organization ID filtering
- Permission checks
- Error handling improvements

**Files to Update:**
- `src/pages/RequestsList.jsx`
- `src/pages/MainTable.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/ExpensesList.jsx`
- `src/components/Admin/ManageTimeSlots.jsx`
- `src/components/Admin/ViewBookings.jsx`
- All other data components

### 5.4 New Components Needed

1. **Organization Management:**
   - `OrganizationSettings.jsx`
   - `TeamMembers.jsx`
   - `InviteMember.jsx`

2. **Billing:**
   - `SubscriptionPlans.jsx`
   - `BillingSettings.jsx`
   - `PaymentMethods.jsx`
   - `Invoices.jsx`

3. **User Management:**
   - `UserProfile.jsx`
   - `UserSettings.jsx`
   - `PasswordReset.jsx`

---

## 6. Infrastructure Requirements

### 6.1 Hosting & Deployment

**Current:** Static build deployment

**Recommended:**
- **Frontend:** Vercel, Netlify, or Cloudflare Pages
  - Automatic deployments
  - CDN included
  - Environment variables
  - Preview deployments

- **Backend (Edge Functions):** Supabase Edge Functions
  - Serverless
  - Auto-scaling
  - Integrated with Supabase

- **Database:** Supabase PostgreSQL
  - Managed PostgreSQL
  - Automatic backups
  - Point-in-time recovery
  - Read replicas (at scale)

### 6.2 CI/CD Pipeline

**Required:**
- GitHub Actions or similar
- Automated testing
- Build verification
- Deployment automation
- Rollback capability

**Pipeline Stages:**
1. Lint & Format check
2. Unit tests
3. Build verification
4. Deploy to staging
5. E2E tests
6. Deploy to production

### 6.3 Monitoring Services

**Recommended Stack:**
- **Error Tracking:** Sentry
- **Analytics:** PostHog or Mixpanel
- **Logging:** Logtail or Datadog
- **Uptime:** UptimeRobot or Pingdom
- **Performance:** Vercel Analytics or Google Analytics

---

## 7. Security Checklist

### 7.1 Authentication & Authorization
- [ ] Supabase Auth integrated
- [ ] Password complexity enforced
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout implemented
- [ ] 2FA available (optional)
- [ ] Account lockout after failed attempts

### 7.2 Data Security
- [ ] RLS enabled on all tables
- [ ] Tenant isolation verified
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Input validation on all forms

### 7.3 Infrastructure Security
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] Database backups automated
- [ ] Access logs maintained
- [ ] Security headers configured

### 7.4 Compliance
- [ ] GDPR compliance
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Cookie consent

---

## 8. Cost Estimation

### 8.1 Infrastructure Costs (Monthly)

**Supabase:**
- Pro Plan: ~$25/month (up to 8GB database)
- Additional storage: ~$0.125/GB
- Bandwidth: Included in plan
- Edge Functions: Included

**Hosting (Frontend):**
- Vercel Pro: $20/month (or free for small scale)
- Netlify Pro: $19/month
- Cloudflare Pages: Free tier available

**Third-Party Services:**
- Stripe: 2.9% + $0.30 per transaction
- Sentry: Free tier (up to 5k events/month)
- PostHog: Free tier (up to 1M events/month)

**Total Estimated:** $50-100/month for small scale (up to 100 organizations)

### 8.2 Development Costs

**Estimated Timeline:** 10-12 weeks
**Team Size:** 1-2 developers
**Complexity:** Medium-High

**Breakdown:**
- Multi-tenancy: 2 weeks
- Authentication: 1 week
- Billing: 3 weeks
- API/Backend: 2 weeks
- Testing & QA: 2 weeks
- Deployment & Monitoring: 1 week

---

## 9. Risk Assessment

### 9.1 High Risks

1. **Data Migration**
   - Risk: Data loss during migration
   - Mitigation: Comprehensive backup, staged migration, rollback plan

2. **Security Vulnerabilities**
   - Risk: Data breach, unauthorized access
   - Mitigation: Security audit, penetration testing, RLS verification

3. **Performance Degradation**
   - Risk: Slow queries with multi-tenancy
   - Mitigation: Proper indexing, query optimization, caching

### 9.2 Medium Risks

1. **Billing Integration Issues**
   - Risk: Payment failures, subscription errors
   - Mitigation: Thorough testing, webhook monitoring, manual override capability

2. **User Migration**
   - Risk: User confusion, data access issues
   - Mitigation: Clear communication, migration guide, support team

### 9.3 Low Risks

1. **Feature Parity**
   - Risk: Missing features in SaaS version
   - Mitigation: Feature checklist, user testing, gradual rollout

---

## 10. Success Metrics

### 10.1 Technical Metrics
- Uptime: >99.9%
- API response time: <200ms (p95)
- Error rate: <0.1%
- Database query time: <100ms (p95)

### 10.2 Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Churn rate: <5% monthly
- Customer Lifetime Value (LTV)
- Conversion rate (trial to paid)

### 10.3 User Metrics
- Daily Active Users (DAU)
- Feature adoption rate
- User satisfaction score
- Support ticket volume

---

## 11. Recommended Next Steps

### Immediate Actions (Week 1)
1. **Set up Supabase Auth**
   - Configure authentication providers
   - Test user registration/login
   - Implement password reset

2. **Create Organizations Table**
   - Design schema
   - Create migration
   - Test organization creation

3. **Security Audit**
   - Review current RLS policies
   - Test data isolation
   - Identify security gaps

### Short-term (Weeks 2-4)
1. **Multi-tenancy Implementation**
   - Add organization_id to all tables
   - Update all queries
   - Test data isolation

2. **User Management**
   - User profiles
   - Team invitations
   - Role management

### Medium-term (Weeks 5-8)
1. **Billing Integration**
   - Stripe setup
   - Subscription management
   - Feature gating

2. **API Development**
   - Edge functions
   - Webhook handlers
   - Admin APIs

### Long-term (Weeks 9-12)
1. **Monitoring & Analytics**
   - Error tracking
   - User analytics
   - Business metrics

2. **Optimization**
   - Performance tuning
   - Code splitting
   - Caching strategy

---

## 12. Conclusion

The current application has a solid foundation with complete core functionality, but requires significant architectural changes to become a production-ready SaaS platform. The primary focus areas are:

1. **Multi-tenancy** - Critical for SaaS operation
2. **Authentication** - Security and user management
3. **Billing** - Revenue generation
4. **Security** - Data protection and compliance
5. **Monitoring** - Operational excellence

**Estimated Timeline:** 10-12 weeks for full SaaS conversion  
**Estimated Cost:** $50-100/month infrastructure + development time  
**Risk Level:** Medium (manageable with proper planning)

The conversion is feasible and the current codebase provides a good foundation. The main challenge will be ensuring data isolation and security while maintaining performance and user experience.

---

## Appendix A: File Structure Changes

### New Files Needed

```
src/
├── contexts/
│   ├── AuthContext.jsx (rewrite)
│   ├── OrganizationContext.jsx (new)
│   └── SubscriptionContext.jsx (new)
├── lib/
│   ├── supabase.js (update)
│   ├── dataAccess.js (new)
│   └── permissions.js (new)
├── pages/
│   ├── auth/
│   │   ├── Login.jsx (update)
│   │   ├── Register.jsx (new)
│   │   └── ResetPassword.jsx (new)
│   ├── settings/
│   │   ├── OrganizationSettings.jsx (new)
│   │   ├── TeamMembers.jsx (new)
│   │   └── BillingSettings.jsx (new)
│   └── ... (existing pages updated)
├── components/
│   ├── billing/
│   │   ├── SubscriptionPlans.jsx (new)
│   │   ├── PaymentMethods.jsx (new)
│   │   └── UsageDashboard.jsx (new)
│   └── ... (existing components updated)
└── supabase/
    └── functions/
        ├── stripe-webhook/
        ├── auth-handler/
        └── admin-operations/
```

### Database Migrations Needed

```
010_create_organizations.sql
011_create_user_profiles.sql
012_create_organization_members.sql
013_add_organization_id_to_requests.sql
014_add_organization_id_to_main_table.sql
015_add_organization_id_to_expenses.sql
016_add_organization_id_to_time_slots.sql
017_add_organization_id_to_bookings.sql
018_create_plans.sql
019_create_subscriptions.sql
020_create_payments.sql
021_create_usage_metrics.sql
022_update_rls_policies.sql
```

---

**Report Generated:** 2026-01-25  
**Next Review:** After Phase 1 completion
