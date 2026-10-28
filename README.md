# iMovies — Complete MERN Cinema Booking System

A full-stack cinema ticket booking web application built with **React**, **Node.js**, **Express**, **MongoDB (Mongoose)**, and **Socket.io** for real-time seat availability updates.

---

## 🌟 Features

- **Movie Catalog & Search**:
  - Live search movies by title or description
  - Filter movies by genre (Action, Sci-Fi, Drama, Adventure, etc.)
  - Movie detail page with synopsis, genre tags, duration, certificate, and trailer links
- **Real-Time Seat Booking Engine**:
  - Interactive cinema hall seat layout (Screen, Rows A-T, Seat selection)
  - Real-time seat updates via **Socket.io** (locks seats across tabs/users instantly)
  - Dynamic price calculation for up to 10 seats per booking
  - Resilient booking transaction logic with automatic fallback for standalone MongoDB instances
- **Authentication & Security**:
  - User signup and login with hashed passwords (`bcryptjs`)
  - Role-based authorization (`user` & `admin`) with JWT
  - Protected routes for bookings, payment, and admin dashboard
- **Payment & Booking Management**:
  - Checkout flow with demo payment simulator (success / failed simulation)
  - Booking confirmation with unique booking code (`IM-XXXX`)
  - User "My Bookings" page with live status and seat cancellation
- **Admin Management Portal**:
  - Add new movies with poster URLs, genres, languages, and runtime
  - Add theatres with custom screen counts and locations
  - Schedule shows with start times, ticket pricing, and seat dimensions (rows x seats per row)
  - Deactivate movies and manage show schedules

---

## 📁 Project Architecture

```
imovies/
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Navbar, ProtectedRoute
│   │   ├── pages/              # Home, MovieDetails, SeatBooking, Payment, MyBookings, Admin, Login, Register
│   │   ├── api.js              # Axios instance with JWT interceptor
│   │   ├── App.jsx             # Router and Auth state provider
│   │   ├── styles.css          # Custom dark modern cinema theme
│   │   └── main.jsx
│   ├── vite.config.js          # React plugin & Vite configuration
│   ├── .env                    # Frontend environment configuration
│   └── package.json
├── server/                     # Backend (Node.js + Express + Socket.io)
│   ├── config/                 # MongoDB database connection
│   ├── middleware/             # JWT auth & error handling middleware
│   ├── models/                 # Mongoose schemas: User, Movie, Theatre, Show, Booking, Payment
│   ├── routes/                 # auth, movies, theatres, shows, bookings, payments
│   ├── .env                    # Backend environment configuration
│   ├── server.js               # Express app, Socket.io, Seed endpoint
│   └── package.json
├── install-all.bat             # 1-Click dependency installer for Windows
├── start-dev.bat               # 1-Click launcher (starts server + client in separate windows)
├── package.json                # Root package with helper npm scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Requirements
- **Node.js**: v18+ (tested with v24 LTS)
- **MongoDB**: Local Community Server running at `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cloud URI.

### 2. Install Dependencies
You can double-click **`install-all.bat`**, or run:
```bash
# In project root:
npm run install:all
```
*(Or run `npm install` inside both `server/` and `client/` directories)*

### 3. Start MongoDB
Ensure MongoDB is running locally:
```bash
# Example (if MongoDB is installed as a service or via mongod):
mongod
```
*(If using MongoDB Atlas, simply update `MONGO_URI` in `server/.env`)*

### 4. Run the Full Stack App
You can double-click **`start-dev.bat`**, or run in separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
> Server runs on `http://localhost:5000`

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 🎬 Demo Data & Admin Access

### 1-Click Demo Seed
With the backend running, populate blockbuster movies, theatres, and scheduled shows:
```bash
curl -X POST http://localhost:5000/api/seed
```
*(Or use Postman / browser / Thunder Client to send a `POST` request to `http://localhost:5000/api/seed`)*

### Default Admin Account
The seeder creates a ready-to-use Admin account:
- **Email**: `admin@imovies.com`
- **Password**: `admin12345`

Log in with this account to access the **`/admin`** dashboard to create movies, theatres, and schedule shows!

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login & receive JWT
- `GET /api/auth/me` — Current authenticated user

### Movies
- `GET /api/movies` — List movies (supports `?search=...`, `?genre=...`, `?page=...`)
- `GET /api/movies/:id` — Get movie details
- `POST /api/movies` — Create movie *(Admin only)*
- `PUT /api/movies/:id` — Update movie *(Admin only)*
- `DELETE /api/movies/:id` — Deactivate movie *(Admin only)*

### Theatres & Shows
- `GET /api/theatres` — List all theatres
- `POST /api/theatres` — Add theatre *(Admin only)*
- `GET /api/shows` — List upcoming shows (supports `?movieId=...&date=YYYY-MM-DD`)
- `GET /api/shows/:id/seats` — Get seat map & booked status for a show
- `POST /api/shows` — Schedule a new show *(Admin only)*

### Bookings & Payments
- `POST /api/bookings` — Reserve seats (1-10 seats; atomic conflict resolution)
- `GET /api/bookings/my` — Get user bookings
- `PATCH /api/bookings/:id/cancel` — Cancel booking & release seats
- `POST /api/payments/demo` — Simulate payment outcome (`success` or `failed`)

---

## 🔒 Production Readiness Notes
1. **Payments**: Replace the simulated endpoint with Razorpay / Stripe webhook handling.
2. **Secrets**: Update `JWT_SECRET` in `server/.env` to a high-entropy 64-character secret.
3. **Database**: Use MongoDB Atlas with automated backups and replica sets.
