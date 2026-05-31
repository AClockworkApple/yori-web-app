# Yori Web App

A restaurant management system for Yori Deggendorf chain.

## Project Structure

```
Yori Web App/
├── server/              # Backend (Node.js + Express + Firebase)
│   ├── src/
│   │   ├── config/      # Firebase configuration
│   │   ├── controllers/# Route controllers
│   │   ├── models/     # Data models
│   │   ├── routes/     # API routes
│   │   └── index.js    # Server entry point
│   └── package.json
│
├── client/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/    # React contexts
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── App.jsx     # Main app component
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled

### Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

Server runs on: http://localhost:3001

### Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs on: http://localhost:3000

## API Endpoints

### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/restaurants | Get all restaurants |
| GET | /api/restaurants/:id | Get restaurant by ID |
| POST | /api/restaurants | Create restaurant |
| PUT | /api/restaurants/:id | Update restaurant |
| DELETE | /api/restaurants/:id | Delete restaurant |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bookings | Get all bookings |
| GET | /api/bookings/:id | Get booking by ID (includes assigned tables) |
| GET | /api/bookings/restaurant/:restaurantId | Get bookings by restaurant |
| GET | /api/bookings/restaurant/:restaurantId/status/:status | Get bookings by status |
| GET | /api/bookings/restaurant/:restaurantId/date/:date | Get bookings by date |
| POST | /api/bookings | Create booking (accepts `tableIds[]` for auto-assignment) |
| PUT | /api/bookings/:id | Update booking |
| PATCH | /api/bookings/:id/status | Update booking status |
| PATCH | /api/bookings/:id/seat | Seat customer |
| PATCH | /api/bookings/:id/complete | Complete booking |
| PATCH | /api/bookings/:id/extend | Extend booking |
| GET | /api/bookings/:id/tables | Get tables assigned to booking |
| POST | /api/bookings/:id/tables | Assign a table to booking |
| DELETE | /api/bookings/:id/tables/:tableId | Remove a table from booking |
| DELETE | /api/bookings/:id | Delete booking |

### Tables

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tables | Get all tables |
| GET | /api/tables/:id | Get table by ID |
| GET | /api/tables/restaurant/:restaurantId | Get tables by restaurant |
| POST | /api/tables | Create table |
| PUT | /api/tables/:id | Update table |
| PATCH | /api/tables/:id/status | Update table status |
| DELETE | /api/tables/:id | Delete table |

### Menu Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu-items | Get all menu items |
| GET | /api/menu-items/general | Get general menu |
| GET | /api/menu-items/:id | Get menu item by ID |
| GET | /api/menu-items/restaurant/:restaurantId | Get menu items by restaurant |
| GET | /api/menu-items/restaurant/:restaurantId/menu | Get merged restaurant menu (general + custom) |
| POST | /api/menu-items/restaurant/:restaurantId/import | Import general menu to restaurant |
| GET | /api/menu-items/restaurant/:restaurantId/category/:category | Get items by category |
| GET | /api/menu-items/restaurant/:restaurantId/categories | Get all categories |
| POST | /api/menu-items | Create menu item |
| PUT | /api/menu-items/:id | Update menu item |
| PATCH | /api/menu-items/:id/toggle | Toggle availability |
| DELETE | /api/menu-items/:id | Delete menu item |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get order by ID |
| GET | /api/orders/restaurant/:restaurantId | Get orders by restaurant |
| GET | /api/orders/booking/:bookingId | Get orders by booking |
| GET | /api/orders/restaurant/:restaurantId/date/:date | Get orders by date |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id | Update order |
| POST | /api/orders/:id/items | Add item to order |
| GET | /api/orders/:orderId/items | Get order items |
| PUT | /api/orders/:orderId/items/:itemId | Update order item |
| DELETE | /api/orders/:orderId/items/:itemId | Remove order item |
| PATCH | /api/orders/:id/tip | Update tip |
| POST | /api/orders/:id/payment | Process payment |
| GET | /api/orders/:id/payments | Get payments for order |
| PATCH | /api/orders/:id/close | Close order |
| PATCH | /api/orders/:id/split | Split order |
| GET | /api/orders/:orderId/split-groups | Get split groups |
| GET | /api/orders/:id/calculate | Calculate totals |
| DELETE | /api/orders/:id | Delete order |

## Features (Implemented)

- CRUD operations for restaurants, tables, bookings, menu items, and orders
- Multi-table booking assignment via `booking_tables` join collection
- General menu + per-restaurant custom menu items with import
- Order management with items, payments, split billing, and tips
- Configuration options (slot duration, buffer, tax rate, service fee, etc.)
- Context-based state management
- Responsive table-based UI