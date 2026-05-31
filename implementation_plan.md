# Implementation Plan — Yori Web App

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Fully implemented |
| 🔶 | Partially implemented |
| ❌ | Not started |

---

## ✅ Already Implemented

### Must Have

| Feature | Status | Notes |
|---------|--------|-------|
| Restaurant management (CRUD) | ✅ | Server + Client, incl. config fields |
| Table management (CRUD) | ✅ | Server + Client |
| Booking system (CRUD) | ✅ | Server + Client, multi-table support via `booking_tables` join |
| Multi-table assignment | ✅ | `booking_tables` collection, nested endpoints, multi-select UI |
| Menu management (CRUD) | ✅ | Server + Client, incl. general/restaurant menus, import, categories |
| Order management (CRUD) | ✅ | Server + Client, incl. items, payments, split, close, tip |
| Flat tax rate | ✅ | Configurable on Restaurant model |
| Service fee | ✅ | Configurable on Restaurant model |
| Slot duration config | ✅ | On Restaurant model |
| Buffer duration config | ✅ | On Restaurant model |
| Max extension config | ✅ | On Restaurant model |
| Warning timing config | ✅ | On Restaurant model |
| Data retention config | ✅ | On Restaurant model |
| Booking auto-close/extension | ✅ | seat, complete, extend endpoints |

### Infrastructure

| Item | Status | Notes |
|------|--------|-------|
| Express server with CORS | ✅ | Port 3001 |
| Firebase Firestore connection | ✅ | Real project `yori-web-app` |
| React 18 + Vite + Router | ✅ | Port 3000, proxy to backend |
| 5 Context providers | ✅ | Restaurant, Table, Booking, MenuItem, Order |
| 5 Service modules | ✅ | Full HTTP wrappers |
| ESLint | ✅ | Both client and server |
| GitHub CI pipeline | ✅ | Lint + build |
| .git with remote tracking | ✅ | 3 branches, 4 commits |

---

## ❌ Not Started — Ordered by Priority

### Must Have (Critical — blocking everything)

| # | Feature | Effort | Dependencies | Notes |
|---|---------|--------|-------------|-------|
| 1 | **Authentication & Authorization** | Large | None | JWT with refresh token rotation, role-based middleware (Owner/Manager/Staff/Customer), login/logout pages |
| 2 | **User models** (Owner, Manager, Employee, Customer) | Medium | Auth | Simple user records with role field, no HR/staff management |
| 3 | **Walk-in management** | Medium | Auth, Table, Booking | WalkIn model, queue logic, priority over pre-bookings |
| 4 | **Pre-booking priority / waitlist logic** | Medium | Booking | Waitlisted pre-bookings seated before walk-ins |
| 5 | **Auto/Semi-auto mode** | Medium | Booking, Mode config | Per-restaurant mode affects booking flow |
| 6 | **Order notes per item (UI)** | Small | Existing OrderItem | Field exists in model/API, missing from client UI |
| 7 | **Split billing UI** | Small | Existing Order API | API exists, missing from OrdersPage |
| 8 | **Cash payment tracking** | Medium | Existing Payment model | Amount received + change given form |
| 9 | **Payment method reporting** | Small | Payment | Per-transaction display in Orders table |
| 10 | **Receipt (printed + saved)** | Medium | Order, Payment | Receipt model, print view, saved records |
| 11 | **Daily summary report** | Medium | Order, Payment | Covers, revenue, tips — Manager+ dashboard |

### Must Have (Medium Priority)

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 12 | **Customer-facing booking** | Large | Public booking page, cancel/rebook flow |
| 13 | **Automatic email reminders** | Large | Email service (SendGrid?), cron trigger |
| 14 | **Search bookings by name/phone** | Small | Filter on BookingsPage |
| 15 | **Real-time table status board** | Medium | TV display view, polling/WebSocket |
| 16 | **Internal announcements** | Medium | Announcement model, broadcast UI |
| 17 | **Restaurant hours per day** | Medium | RestaurantHours model, config UI |
| 18 | **Wait time estimator** | Medium | Algorithm based on current bookings |
| 19 | **Google Sheets integration** | Medium | Export financial data |
| 20 | **GDPR compliance** | Medium | Data minimization, right to erasure |

### Should Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 21 | **Audit logs** | Medium | Immutable action logs |
| 22 | **Daily cash reconciliation** | Medium | End-of-day cash vs card |

### Could Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 23 | **Automatic tax calculation** | Medium | Requires expense input |
| 24 | **Manual tax rate reconfiguration** | Small | Emergency override |
| 25 | **Kitchen Display System (KDS)** | Large | Kitchen order display |
| 26 | **Inventory management** | Large | Stock tracking |
| 27 | **Predictive analytics** | Large | Busy period forecasting |
| 28 | **Offline mode** | Large | WiFi reliability |

### Won't Have (by design)

| Feature | Notes |
|---------|-------|
| Floor plan/table visualization | Drag-drop assignment |
| Booking modification | Cancel + rebook only |
| SMS notifications | Future potential |
| Customer mobile app | Future potential |
| Loyalty/rewards program | Future potential |
| QR code self-ordering | Waiters handle orders |

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| Scope | Front-of-house only — no HR/staff management (no clock-in/out, shifts, breaks) |
| Multi-table booking | `booking_tables` join collection with nested REST endpoints |
| Table merging | Removed as separate entity — handled by multi-table booking assignment |
| Auth strategy | JWT with short expiry + refresh token rotation (planned) |
| Database | Firebase Firestore |
| State management | React Context API (no Redux) |
| API style | RESTful, nested where natural |
| No ORM | Raw Firestore SDK |
