# CivicEye - Municipal Grievance & Geotagging Platform

A full-stack MERN application for municipal civic issue reporting and worker dispatch resolution. Citizens geotag civic defects (potholes, burst pipes, hanging wires, garbage dumps) with live photos and GPS coordinates, while municipal field workers manage and update issue statuses on an interactive Leaflet map dashboard.

---

## 🚀 Key Features

- **Geotagged Issue Reporting (Citizen View):**
  - Live photo upload with mobile camera integration (`capture="environment"`).
  - Browser GPS auto-detection (`navigator.geolocation`) with interactive Leaflet location picker & draggable pin.
  - Categories: `pothole`, `burst_pipe`, `hanging_wire`, `garbage`, `other`.
- **Worker Triage & Status Management (Worker View):**
  - Interactive Leaflet map with color-coded status pins:
    - 🔴 **Red:** Pending
    - 🟡 **Yellow / Amber:** In Progress
    - 🟢 **Green:** Resolved
  - Viewport-based issue queries using MongoDB `$geoWithin` `$box` geospatial index (`2dsphere`).
  - One-click status updates (`PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED`).
  - Full-resolution photo inspection popups.
- **Role-Based Authentication:**
  - JWT authentication with secure password hashing (`bcryptjs`).
  - Role-based route protection (`citizen`, `worker`).
- **Multer Disk Storage:**
  - Automated image sanitization and disk persistence under `/server/uploads`.
  - Express static file serving.
- **Docker Compose Orchestration:**
  - Multi-container setup (`mongo`, `server`, `client`) with persistent host volume mounting.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Leaflet, React-Leaflet, Lucide React, Axios, React Router 6.
- **Backend:** Node.js, Express, MongoDB, Mongoose (GeoJSON 2dsphere), Multer, JWT, BcryptJS.
- **DevOps:** Docker, Docker Compose.

---

## 📦 Quick Start with Docker Compose

Run all services (MongoDB, Express API, and React Client) with a single command:

```bash
docker-compose up --build
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **MongoDB Database:** `mongodb://localhost:27017/civic_grievance_db`

---

## 💻 Local Development Setup (Without Docker)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # (Optional) Populates demo accounts & sample geotagged grievances
npm run dev      # Runs on port 5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Runs on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **BMC Field Worker** | `bmc.worker@mumbai.gov.in` | `password123` |
| **Citizen (Reporter)** | `citizen.rahul@example.com` | `password123` |

*(Note: Fast-fill buttons for these accounts are also available on the Login screen)*

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create new Citizen or Worker account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Get current user profile (Protected)

### Grievances
- `POST /api/grievances` - Report grievance with multipart photo & GeoJSON lat/lng (Protected)
- `GET /api/grievances/map-view?swLat=&swLng=&neLat=&neLng=&status=&category=` - Bounding box viewport query
- `PATCH /api/grievances/:id/status` - Update status (Worker only: `PENDING`, `IN_PROGRESS`, `RESOLVED`)
- `GET /api/grievances/my` - Get citizen's submitted reports (Protected)
- `GET /api/grievances/stats` - Summary metrics for dashboard
- `GET /api/grievances/:id` - Single grievance details
