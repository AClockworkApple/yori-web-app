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

## Features (Implemented)

- CRUD operations for restaurants
- Configuration options (slot duration, buffer, tax rate, etc.)
- Context-based state management
- Responsive table-based UI