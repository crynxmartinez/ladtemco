# Ladtemco PNG Visual Specification Plan

Status: Proposed — awaiting Ladtemco approval  
Version: 1.0  
Date: 2026-11-19

## Evidence status

### Confirmed

- Product: Ladtemco Cooperative Management and Transparency System.
- Two portals: member and administration.
- Desktop uses persistent left navigation.
- Mobile uses labeled bottom navigation plus a More destination.
- Every formal screen requires desktop/mobile and light/dark outputs.
- Prisma and PostgreSQL are intended later; no application implementation is authorized yet.
- Existing brand source: `logo.jpg`.

### Evidence requested from Ladtemco

1. Articles of Cooperation and bylaws.
2. Organization chart, officer roles, signing limits, and approval authorities.
3. Blank membership application and representative anonymized member record.
4. Contribution, share-capital, savings, and loan ledgers actually in use.
5. Chart of accounts and latest financial statement formats.
6. Blank official receipt, disbursement voucher, cash-advance, reimbursement, and liquidation forms.
7. Examples of an approved, returned, and rejected request with personal data removed.
8. Meeting notices, minutes, resolutions, and member reports.
9. CDA reports currently prepared by Ladtemco.
10. Current spreadsheets, manual registers, and recurring member questions.
11. Common phones, smallest supported screen, and usual desktop resolution.

Until these arrive, amounts, people, policies, terminology, and approval paths in PNGs are design proposals using anonymized examples.

## Portal navigation proposal

### Member desktop

Dashboard; My Contributions; Share Capital; Fund Transparency; Projects & Liquidations; Documents; Meetings; Profile & Security.

### Member mobile

Home; Contributions; Funds; Documents; More.

### Administration desktop

Overview; Members; Contributions; Share Capital; Funds & Budgets; Expenses & Advances; Liquidations; Approvals; Reports; Meetings & Documents; Audit Trail; Users & Roles; Settings.

### Administration mobile

Overview; Members; Approvals; Reports; More.

Mobile administration prioritizes review and monitoring. Dense data entry and reconciliation remain possible but are optimized for desktop unless Ladtemco evidence shows officers routinely perform them on phones.

## Screen register

Every registered screen produces four formal variants: desktop-light, desktop-dark, mobile-light, and mobile-dark. Version begins at v1. Approval is `Proposed` until the user explicitly approves the rendered PNGs.

| Base ID | Screen | Role | Workflow | Required states | Four registered outputs | Status |
|---|---|---|---|---|---|---|
| LAD-auth-01 | Sign in | Member/officer | Authentication | default, invalid credentials, locked, loading | `LAD-auth-sign-in-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-auth-02 | Recover access | Member/officer | Authentication | request, code sent, invalid code, success | `LAD-auth-recovery-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-01 | Member dashboard | Member | Overview | populated, loading, partial-data, error | `LAD-member-overview-dashboard-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-02 | Contribution history | Member | Contributions | populated, empty, filtered, error | `LAD-member-contributions-list-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-03 | Contribution detail | Member | Contributions | posted, reversed, receipt unavailable | `LAD-member-contributions-detail-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-04 | Share-capital summary | Member | Share capital | populated, empty, transaction detail | `LAD-member-shares-summary-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-05 | Fund transparency | Member | Transparency | populated, no published period, error | `LAD-member-funds-overview-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-06 | Project utilization detail | Member | Transparency | active, complete, documents redacted | `LAD-member-funds-project-detail-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-07 | Documents | Member | Documents | populated, empty, unavailable | `LAD-member-documents-library-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-08 | Meetings and resolutions | Member | Governance | upcoming, past, empty | `LAD-member-meetings-list-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-member-09 | Profile and security | Member | Account | view, validation error, saved | `LAD-member-account-profile-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-01 | Administration overview | Authorized officer | Overview | populated, loading, data warning | `LAD-admin-overview-dashboard-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-02 | Member directory | Membership staff | Membership | populated, empty, filtered, permission denied | `LAD-admin-members-directory-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-03 | Member record | Membership staff | Membership | active, pending, inactive, restricted fields | `LAD-admin-members-detail-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-04 | Membership application review | Membership reviewer | Membership | pending, returned, approved, rejected | `LAD-admin-members-application-review-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-05 | Record contribution | Cashier/treasurer | Contributions | entry, validation error, review, posted | `LAD-admin-contributions-create-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-06 | Contribution review | Treasurer/bookkeeper | Contributions | pending, verified, returned, reversed | `LAD-admin-contributions-review-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-07 | Share-capital record | Treasurer/bookkeeper | Share capital | populated, adjustment, permission denied | `LAD-admin-shares-detail-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-08 | Fund and budget detail | Fund officer/board reviewer | Budget control | draft, pending, approved, closed | `LAD-admin-funds-budget-detail-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-09 | Expense or advance request | Requester | Disbursement | draft, invalid, submitted, returned | `LAD-admin-expenses-request-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-10 | Request review | Authorized approver | Approval | pending, returned, approved, rejected | `LAD-admin-expenses-review-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-11 | Liquidation submission | Responsible officer | Liquidation | draft, missing receipt, submitted, returned | `LAD-admin-liquidations-submit-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-12 | Liquidation verification | Auditor/verifier | Liquidation | pending, exception, returned, liquidated | `LAD-admin-liquidations-review-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-13 | Reports and reconciliation | Bookkeeper/accountant | Reporting | ready, discrepancy, locked period, export | `LAD-admin-reports-reconciliation-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-14 | Audit event detail | Auditor | Audit | normal, reversal chain, restricted | `LAD-admin-audit-event-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-15 | Users and roles | System administrator | Access control | active, invited, suspended, permission error | `LAD-admin-access-users-{desktop|mobile}-{light|dark}-v1` | Proposed |
| LAD-admin-16 | Financial reversal | Accountant plus approver | Correction | reason entry, review, approved, posted | `LAD-admin-accounting-reversal-{desktop|mobile}-{light|dark}-v1` | Proposed |

Savings and loan screens are intentionally excluded until Ladtemco confirms those services and supplies the governing rules.

## Workflow order

1. Shared design system and accessibility rules.
2. Authentication shared by members and officers.
3. Member contributions journey: dashboard → history → detail/reversal evidence.
4. Administrative liquidation journey: request → submission → verification → member-safe publication.
5. Membership journey.
6. Fund and budget transparency journey.
7. Share-capital journey.
8. Documents and governance journey.
9. Reports, reconciliation, and audit journey.
10. Users, roles, security, and financial correction journey.

The first two representative workflows are member contributions and administrative liquidation because together they test privacy, responsive behavior, money presentation, evidence, approvals, and auditability.

## Design-system approval plan

### Gate DS-1 — Visual foundation

Approve light/dark colors, typography, spacing, navigation, cards, buttons, fields, tables/lists, statuses, charts, document previews, audit rows, and core system states.

### Gate DS-2 — Responsive behavior

Approve the desktop sidebar, member mobile bottom navigation, admin mobile bottom navigation, table-to-card transformation, and long-content behavior.

### Gate DS-3 — Workflow proof

Approve one member contribution journey and one administrative liquidation journey in all four output variants.

### Gate DS-4 — System lock

Apply corrections from the workflow proof, publish design-system v2 if needed, and lock components before producing remaining screens.

## Independent checks

- WCAG AA contrast measurement for both themes.
- Real-device review at the agreed smallest mobile viewport.
- Permission walkthrough with Ladtemco role owners.
- Terminology and totals review by treasurer/bookkeeper.
- Traceability review by the audit committee.
- Component and responsive-feasibility review before implementation.

