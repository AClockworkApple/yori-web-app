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
| User management (CRUD) | ✅ | Server + Client, roles: OWNER/MANAGER/STAFF/CUSTOMER |
| Authentication & Authorization | ✅ | JWT, role-based middleware, login/register/logout pages |
| Role-based access control | ✅ | requireRole() on all sensitive routes |
| Auth token refresh | ✅ | Auto-refresh before expiry, 401 retry logic |
| Walk-in management | ✅ | WalkInPage, source field, queue endpoint |
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
| 6 Context providers | ✅ | Restaurant, Table, Booking, MenuItem, Order, User |
| 6 Service modules | ✅ | Full HTTP wrappers |
| Self-contained JWT auth | ✅ | `jsonwebtoken` + `crypto.scryptSync`, no Firebase Auth dependency |
| ESLint | ✅ | Both client and server |
| GitHub CI pipeline | ✅ | Lint + build |
| .git with remote tracking | ✅ | 3 branches, 4 commits |

---

## ❌ Not Started — Ordered by Priority

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 1 | **Customer-facing booking** | Large | Public booking page, cancel/rebook flow |
| 2 | **Automatic email reminders** | Large | Email service (SendGrid?), cron trigger |
| 3 | **Search bookings by name/phone** | Small | Filter on BookingsPage |
| 4 | **Real-time table status board** | Medium | TV display view, polling/WebSocket |
| 5 | **Internal announcements** | Medium | Announcement model, broadcast UI |
| 6 | **Restaurant hours per day** | ✅ | Full CRUD, open/close/break times, day-by-day config |
| 7 | **Receipt (printed + saved)** | Medium | Itemized receipt, Manager+ access |
| 8 | **Daily summary report** | Medium | Covers, revenue, tips |
| 9 | **GDPR compliance** | Medium | Data minimization, right to erasure |

### Should Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 10 | **AI chatbot (booking)** | Large | Full flow (auto) / Confirm (semi-auto) |
| 11 | **AI chatbot (support)** | Medium | Toggle on/off (Owner only) |
| 12 | **Audit logs** | Medium | Immutable action logs |
| 13 | **Daily cash reconciliation** | Medium | End-of-day cash vs card |
| 14 | **Real-time updates** | Medium | Firebase listeners / WebSocket for live table status, bookings, orders |

### Could Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 15 | **Google Sheets integration** | Medium | Export financial data |
| 16 | **Automatic tax calculation** | Medium | Requires expense input |
| 17 | **Manual tax rate reconfiguration** | Small | Emergency override |
| 18 | **Kitchen Display System (KDS)** | Large | Kitchen order display |
| 19 | **Inventory management** | Large | Stock tracking |
| 20 | **Predictive analytics** | Large | Busy period forecasting |
| 21 | **Offline mode** | Large | WiFi reliability |
| 23 | **Manual tax rate reconfiguration** | Small | Emergency override |
| 24 | **Kitchen Display System (KDS)** | Large | Kitchen order display |
| 25 | **Inventory management** | Large | Stock tracking |
| 26 | **Predictive analytics** | Large | Busy period forecasting |
| 27 | **Offline mode** | Large | WiFi reliability |

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
| Auth strategy | JWT with short expiry + refresh token rotation | Self-contained, no Firebase Auth dependency |
| Database | Firebase Firestore |
| State management | React Context API (no Redux) |
| API style | RESTful, nested where natural |
| No ORM | Raw Firestore SDK |
