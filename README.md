
# 🍽️ StreetBite - Street Food Discovery Platform

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Frontend](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)
![Backend](https://img.shields.io/badge/backend-Render-black?logo=render)
![Database](https://img.shields.io/badge/database-Aiven-orange?logo=mysql)

A full-stack application connecting food lovers with local street food vendors, built with **Next.js (Frontend)** and **Spring Boot (Backend)**, using **MySQL** as the primary database.

## 🚀 Live Demo

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | [StreetBite App](https://streetbitego.vercel.app/) | 🟢 Live |
| **Backend API** | [StreetBite API](https://streetbite.onrender.com) | 🟢 Live |
| **API Docs** | [Swagger UI](https://streetbite.onrender.com/swagger-ui/index.html) | 🟢 Live |

> **Note**: The backend is hosted on Render's free tier and may spin down after inactivity. Please allow up to 50 seconds for the first request to wake it up.

## ✨ Features

- 🔍 **Location-based vendor search** - Find vendors near you using geolocation
- 👤 **User authentication** - Cookie-based session auth for customers and vendors
- 🏪 **Vendor management** - Complete vendor dashboard
- 📋 **Menu management** - Add, edit, delete menu items
- 📊 **Analytics** - Track revenue, orders, and performance
- ⚙️ **Settings** - Manage vendor profile and preferences
- 🗺️ **Geocoding** - Automatic address to coordinates conversion

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (or use Aiven/Remote DB)
- **Maven** (or use included wrapper)

### One-Command Startup
```powershell
.\start-all.ps1
```

This script will:
- ✅ Start backend (Spring Boot on port 8080)
- ✅ Start frontend (Next.js on port 3000)
- ✅ Wait for both servers to be ready

### Manual Startup

**Backend only:**
```powershell
.\start-backend.ps1
```

**Frontend only:**
```powershell
cd frontend
npm run dev
```

---

## 📁 Project Structure

```
final_project/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/streetbite/
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Business logic
│   │       ├── model/          # JPA Entities (MySQL)
│   │       ├── repository/     # Spring Data JPA Repositories
│   │       ├── config/         # Security, CORS, Swagger setup
│   │       └── exception/      # Error handling
│   ├── pom.xml                # Maven dependencies
│   └── ...
│
├── frontend/                   # Next.js React app
│   ├── app/                    # Pages and routes
│   ├── components/             # React components
│   ├── lib/                    # API client, utilities
│   ├── package.json
│   └── ...
│
├── Documentation/
│   ├── README.md              # This file
│   ├── DEPLOYMENT.md          # Deployment guide (Vercel/Render)
│   ├── SETUP.md               # Local setup guide
│   ├── DATABASE_STATUS.md     # MySQL Schema documentation
│   └── .env.example           # Environment variables template
│
└── ...
```

---

## 🔧 Configuration

### Environment Variables

Use environment variables for the backend (local shell, Render dashboard, or IDE run config):

```properties
# Database (MySQL/Aiven)
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=<USER>
SPRING_DATASOURCE_PASSWORD=<PASSWORD>

# Auth
JWT_SECRET=<YOUR_SECRET_KEY>
JWT_EXPIRATION_MS=86400000

# Frontend / cookies / CORS
FRONTEND_URL=https://<your-vercel-domain>
ALLOWED_ORIGINS=https://<your-vercel-domain>
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=None

# Firebase (optional realtime + push only)
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-key.json
```

See [DEVELOPMENT_SETUP.md](Documentation/DEVELOPMENT_SETUP.md), [DEPLOYMENT.md](Documentation/DEPLOYMENT.md), and [DATA_STORAGE_AND_REALTIME.md](Documentation/DATA_STORAGE_AND_REALTIME.md).

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and issue `sb_token` cookie

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/search` - Search by location
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/{id}` - Get vendor details

### Menu
- `GET /api/vendors/{vendorId}/menu` - Get menu
- `POST /api/menu` - Add menu item

Full API documentation available at `/swagger-ui/index.html` on the backend.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 21
- **Database**: MySQL (Aiven Cloud)
- **ORM**: Spring Data JPA / Hibernate
- **Auth**: Spring Security + JWT cookie session
- **Email**: SMTP via `JavaMailSender`
- **Auxiliary**: Firebase Admin SDK and Firebase Web SDK for realtime mirrors and push
- **Build**: Maven

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](Documentation/ARCHITECTURE.md)** | **System Design & Explaination** |
| **[DEPLOYMENT.md](Documentation/DEPLOYMENT.md)** | Guide for Vercel & Render deployment |
| **[DATABASE_SCHEMA.md](Documentation/DATABASE_SCHEMA.md)** | MySQL Database Schema & ERD |
| **[DATA_STORAGE_AND_REALTIME.md](Documentation/DATA_STORAGE_AND_REALTIME.md)** | MySQL vs Firebase ownership model |
| **[DEVELOPMENT_SETUP.md](Documentation/DEVELOPMENT_SETUP.md)** | Local development setup guide |
| **[FIREBASE_SETUP.md](Documentation/FIREBASE_SETUP.md)** | Auxiliary Firebase configuration |

---

## 📝 License

This project is for educational purposes.

---

**Made with ❤️ for street food lovers** 🍽️
Last Updated: 2026
