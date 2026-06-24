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
| Restaurant hours per day | ✅ | Full CRUD, open/close/break times, day-by-day config |
| Receipt (printed + saved) | ✅ | German-standard layout, MwSt. breakdown, Firestore persistence |
| Category management | ✅ | CategoriesPage, rename/delete, default + custom categories |
| Search/filter on all list pages | ✅ | SearchBar + hybridSearch on Bookings, MenuItems, Orders, Users |
| RestaurantHours client | ✅ | Context, service, page (RestaurantHoursPage) |
| Automatic email reminders | ✅ | nodemailer + SMTP (Gmail App Password), cron every 15 min, confirmation/reminder/status/cancellation emails |
| Internal announcements | ✅ | Announcement model/controller/routes, AnnouncementsPage, live banner in AppNav, auto-refresh every 30s |
| Real-time table status board | ✅ | TableStatusBoard — visual grid, color-coded by status, polling every 5s, click to change status |
| Daily summary report | ✅ | Server endpoint + DailyReportPage with revenue, covers, tips, payment breakdown, averages |

### Infrastructure

| Item | Status | Notes |
|------|--------|-------|
| Express server with CORS | ✅ | Port 3001 |
| Firebase Firestore connection | ✅ | Real project `yori-web-app` |
| React 18 + Vite + Router | ✅ | Port 3000, proxy to backend |
| 9 Context providers | ✅ | Restaurant, Table, Booking, MenuItem, Order, User, Auth, RestaurantHour, Announcement |
| 12 Service modules | ✅ | Full HTTP wrappers incl. receipt, restaurantHour, announcement, report |
| nodemailer + node-cron | ✅ | SMTP email (Gmail App Password), cron reminders every 15 min |
| SearchBar component + hybridSearch | ✅ | Reusable debounced search with 3 auto-scaling algorithms |
| Self-contained JWT auth | ✅ | `jsonwebtoken` + `crypto.scryptSync`, no Firebase Auth dependency |
| ESLint | ✅ | Both client and server |
| GitHub CI pipeline | ✅ | Lint + build |
| .git with remote tracking | ✅ | 3 branches, 4 commits |

---

## ❌ Not Started — Ordered by Priority

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 1 | **Customer-facing booking** | Large | Public booking page, cancel/rebook flow |
| 2 | **GDPR compliance** | Medium | Data minimization, right to erasure |

### Should Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 3 | **AI chatbot (booking)** | Large | Full flow (auto) / Confirm (semi-auto) |
| 4 | **AI chatbot (support)** | Medium | Toggle on/off (Owner only) |
| 5 | **Audit logs** | Medium | Immutable action logs |
| 6 | **Daily cash reconciliation** | Medium | End-of-day cash vs card |
| 7 | **Real-time updates** | Medium | Firebase listeners / WebSocket for live table status, bookings, orders |

### Could Have

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 8 | **Google Sheets integration** | Medium | Export financial data |
| 9 | **Automatic tax calculation** | Medium | Requires expense input |
| 10 | **Manual tax rate reconfiguration** | Small | Emergency override |
| 11 | **Kitchen Display System (KDS)** | Large | Kitchen order display |
| 12 | **Inventory management** | Large | Stock tracking |
| 13 | **Predictive analytics** | Large | Busy period forecasting |
| 14 | **Offline mode** | Large | WiFi reliability |

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
