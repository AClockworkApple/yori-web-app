# Implementation Plan — Yori Web App

## Legend

| Status | Meaning |
|--------|---------|
| Fully implemented | Feature is complete and functional |
| Partially implemented | Core functionality present; minor gaps remain |
| Not started | Feature has not been implemented yet |

---

## Must Have (32 features)

These features are critical to the core functionality of the system. Without them, the application cannot fulfil its primary purpose of digitising front-of-house operations.

| Feature | Status | Notes |
|---------|--------|-------|
| Restaurant management (CRUD) | Fully implemented | Server + Client, incl. config fields |
| Table management (CRUD) | Fully implemented | Server + Client |
| Booking system (CRUD) | Fully implemented | Server + Client, multi-table support via `booking_tables` join |
| Multi-table assignment | Fully implemented | `booking_tables` collection, nested endpoints, multi-select UI |
| Menu management (CRUD) | Fully implemented | Server + Client, incl. general/restaurant menus, import, categories |
| Order management (CRUD) | Fully implemented | Server + Client, incl. items, payments, split, close, tip |
| User management (CRUD) | Fully implemented | Server + Client, roles: OWNER/MANAGER/STAFF/CUSTOMER |
| Authentication & Authorization | Fully implemented | JWT, role-based middleware, login/register/logout pages |
| Walk-in management | Fully implemented | WalkInPage, source field, queue endpoint |
| Flat tax rate | Fully implemented | Configurable on Restaurant model |
| Service fee | Fully implemented | Configurable line item on every order |
| Slot duration config | Fully implemented | Controls booking time slot generation |
| Buffer duration config | Fully implemented | Prevents back-to-back scheduling conflicts |
| Max extension config | Fully implemented | Limits how long a table can be held beyond scheduled end |
| Warning timing config | Fully implemented | Controls when extension warnings are shown to staff |
| Data retention config | Fully implemented | Required for GDPR compliance |
| Booking auto-close/extension | Fully implemented | seat, complete, extend endpoints for live table management |
| Restaurant hours per day | Fully implemented | Full CRUD, open/close/break times, day-by-day config |
| Receipt generation (printed + saved) | Fully implemented | German-standard layout, MwSt. breakdown, Firestore persistence |
| Public customer website (3 pages) | Fully implemented | Home (hero/about/features/animations), Menu (restaurant dropdown + category groups), Booking (form + confirmation) |
| Express server with CORS | Fully implemented | Port 3001 |
| Firebase Firestore connection | Fully implemented | Real project `yori-web-app` |
| React 18 + Vite + Router | Fully implemented | Port 3000, proxy to backend |
| 9 Context providers | Fully implemented | Restaurant, Table, Booking, MenuItem, Order, User, Auth, RestaurantHour, Announcement |
| 13 Service modules | Fully implemented | Full HTTP wrappers incl. receipt, restaurantHour, announcement, report, gdpr |
| Self-contained JWT auth | Fully implemented | `jsonwebtoken` + `crypto.scryptSync`, no Firebase Auth dependency |
| Public API mount (`/api/public`) | Fully implemented | Separate from JWT-protected routes; exposes restaurants, menu, booking creation |
| Category management | Fully implemented | CategoriesPage, rename/delete, default + custom categories |
| Search/filter on all list pages | Fully implemented | SearchBar + hybridSearch on Bookings, MenuItems, Orders, Users |
| Role-based access control | Fully implemented | requireRole() on all sensitive routes |
| Auth token refresh | Fully implemented | Auto-refresh before expiry, 401 retry logic |
| Real-time updates (Socket.IO) | Fully implemented | JWT auth, restaurant-scoped rooms |

---

## Should Have (12 features)

These features add significant value to the system and improve the user experience, but the application remains functional without them. They were implemented once the Must Have features were stable.

| Feature | Status | Notes |
|---------|--------|-------|
| Automatic email reminders | Fully implemented | nodemailer + SMTP (Gmail App Password), cron every 15 min, confirmation/reminder/status/cancellation emails |
| Internal announcements | Fully implemented | Announcement model/controller/routes, AnnouncementsPage, live banner in AppNav, auto-refresh every 30s |
| Real-time table status board | Fully implemented | TableStatusBoard — visual grid, colour-coded by status, click to change status |
| Daily summary report | Fully implemented | Server endpoint + DailyReportPage with revenue, covers, tips, payment breakdown, averages |
| Daily cash reconciliation | Fully implemented | End-of-day cash vs card, declared vs expected variance tracking, reconciliation history |
| Real-time updates (Socket.IO) | Fully implemented | Socket.IO with JWT auth, restaurant-scoped rooms, live table/booking/order/announcement events |
| GDPR compliance | Fully implemented | Data retention scheduler (auto-anonymise old data), GDPR page with lookup/export/erase by email |
| Audit logs | Fully implemented | Immutable action logs for CREATE, UPDATE, DELETE, STATUS_CHANGE across all entities |
| Customer-facing website | Fully implemented | Public home/menu/booking pages with dark theme, scroll animations, separate nav; public API endpoints |
| Customer AI chat (support) | Fully implemented | Chain-level floating chat widget — aggregates menu/hours from all restaurants, no restaurant selector needed |
| AI chatbot (booking) | Fully implemented | Marker-based booking request, auto-creates via Booking model; AI asks customer to specify restaurant when chain has multiple locations; Manual mode restaurants decline bookings politely |
| node-cron | Fully implemented | Reminder scheduler, data retention scheduler |

---

## Could Have (5 features)

These features enhance developer experience and code quality but are not visible to end users. They were implemented when time permitted.

| Feature | Status | Notes |
|---------|--------|-------|
| ESLint | Fully implemented | Both client and server codebases |
| GitHub CI pipeline | Fully implemented | Lint + build + server-verify on every push |
| .git with remote tracking | Fully implemented | Multiple branches, feature-based workflow |
| SearchBar component + hybridSearch | Fully implemented | Reusable debounced search with 3 auto-scaling algorithms |
| Category management | Fully implemented | Rename/delete, default + custom categories |

---

## Won't Have (by design)

These features were considered but deliberately excluded from the project scope to maintain focus on front-of-house operations and avoid feature creep.

| Feature | Rationale |
|---------|-----------|
| Floor plan / table visualisation | Drag-drop complexity exceeds benefit; multi-table assignment via checkboxes is sufficient |
| Booking modification | Cancel + rebook pattern avoids state complexity of partial modification |
| SMS notifications | Requires third-party SMS provider and additional costs |
| Customer mobile app | Web-based SPA is sufficient for customer-facing features |
| Loyalty / rewards program | Out of scope for front-of-house focus |
| QR code self-ordering | Waiters handle all order entry per current workflow |
| Kitchen Display System (KDS) | Large effort; paper tickets remain adequate for current volume |
| Inventory management | Back-of-house, excluded by design scope |
| Predictive analytics | Requires historical data accumulation before becoming useful |
| Offline mode | Significant architectural complexity; network reliability is assumed |
| Google Sheets integration | Export feature, medium priority |
| Automatic tax calculation | Requires expense input, out of scope |

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Front-of-house only | No HR, staff management, clock-in/out, shifts, or breaks |
| Multi-table booking | `booking_tables` join collection | Enables many-to-many relationship between bookings and tables |
| Table merging | Removed as separate entity | Handled by multi-table booking assignment instead |
| Auth strategy | Self-contained JWT | No Firebase Auth dependency; short expiry + refresh token rotation |
| Database | Google Firestore | Serverless NoSQL; scales automatically; real-time listeners available |
| State management | React Context API | No Redux overhead; sufficient for the component tree depth |
| API style | RESTful | Nested routes where natural; flat for simple CRUD |
| ORM | None (raw Firestore SDK) | Direct control over queries and document structure |
| Firestore access | Admin SDK only | Via service account; hard-exits if `FIREBASE_SERVICE_ACCOUNT_PATH` not set |
| AI integration | Provider-agnostic abstraction | Six providers (Gemini, OpenAI, Claude, DeepSeek, Grok, Mistral) via unified interface; marker-based booking avoids function-calling dependency |
| Restaurant mode | Auto / Manual (2 modes) | Auto: automatic table assignment + AI chat can create bookings. Manual: no auto-assign, AI chat can answer questions but cannot create bookings. All existing SEMI_AUTO/FULL_AUTO restaurants migrated to Auto. |

---

## Development Timeline

| Sprint | Duration | Focus | Key Deliverables |
|--------|----------|-------|------------------|
| 1 | Week 1–2 | Foundation | Express server, Firestore connection, React scaffold, auth system |
| 2 | Week 3–4 | Core entities | Restaurant, table, booking, menu, order CRUD with full server + client |
| 3 | Week 5–6 | Polish & config | Receipt generation, restaurant hours, walk-ins, category management |
| 4 | Week 7 | Real-time & reports | Socket.IO integration, table status board, daily report, cash reconciliation |
| 5 | Week 8 | Customer & AI | Public customer website, AI chat widget, booking via chat |
| 6 | Week 9 | Compliance & ops | GDPR tooling, audit logs, announcements, email reminders |
| 7 | Week 10 | Infrastructure | ESLint, CI pipeline, search/filter, final testing |

---

## Codebase Statistics

| Metric | Value |
|--------|-------|
| Source files | ~90 (client + server) |
| React components | ~40 |
| Server routes | ~60 |
| Context providers | 9 |
| Service modules | 13 |
| Firestore collections | 15 |
| Email templates | 4 |
| AI providers supported | 6 |
