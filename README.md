# 🍽️ StreetBite — Street Food Discovery Platform

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Frontend](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)
![Backend](https://img.shields.io/badge/backend-Render-black?logo=render)
![Database](https://img.shields.io/badge/database-Aiven-orange?logo=mysql)

StreetBite connects food lovers with local street food vendors. It ships a public discovery experience and a vendor/admin backend for moderation, listings, and analytics. Built with **Next.js** (frontend) and **Spring Boot** (backend) on **MySQL**.

## 🚀 Live

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | [streetbitego.vercel.app](https://streetbitego.vercel.app/) | 🟢 Live |
| **Backend API** | [streetbite.onrender.com](https://streetbite.onrender.com) | 🟢 Live |
| **API Docs** | [swagger-ui](https://streetbite.onrender.com/swagger-ui/index.html) | 🟢 Live |

> **Note**: Render free tier can sleep after inactivity. First request can take ~50 seconds.

## ✨ What This App Does

- 🔍 **Discover vendors** by location, cuisine, and live status
- 👤 **Auth** for customers, vendors, and admins
- 🏪 **Vendor management** for listings and status
- 📋 **Menu management** for items and pricing
- 🧭 **Community** for hot topics, comments, and likes
- 📊 **Analytics** for platform and vendor insights
- 🗺️ **Geocoding** for address → coordinates

## 🧱 Architecture Snapshot

**Frontend**
- Next.js 16 (App Router) + TypeScript + Tailwind
- API client in `frontend/lib/api.ts` (Axios + cookie sessions)
- Community features under `frontend/app/community`

**Backend**
- Spring Boot 3.3.5 + Java 21
- REST API under `/api`
- Spring Security + cookie-based JWT
- MySQL (Aiven) with JPA/Hibernate

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Maven** (or use the wrapper)

### One-Command Startup
```powershell
.\start-all.ps1
```

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

## 🔧 Configuration

### Environment Variables (Backend)
```properties
# Database (MySQL/Aiven)
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=<USER>
SPRING_DATASOURCE_PASSWORD=<PASSWORD>

# Auth
JWT_SECRET=<YOUR_SECRET_KEY>
JWT_EXPIRATION_MS=86400000
STREETBITE_ALLOW_INSECURE_DEFAULTS=false
STREETBITE_SEED_ENABLED=false

# Frontend / cookies / CORS
FRONTEND_URL=https://<your-vercel-domain>
ALLOWED_ORIGINS=https://<your-vercel-domain>
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=None

# Firebase (optional realtime + push only)
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-key.json
```

See:
- [DEVELOPMENT_SETUP.md](Documentation/DEVELOPMENT_SETUP.md)
- [DEPLOYMENT.md](Documentation/DEPLOYMENT.md)
- [DATA_STORAGE_AND_REALTIME.md](Documentation/DATA_STORAGE_AND_REALTIME.md)

## 📁 Project Structure

```
StreetBite/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/streetbite/
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Business logic
│   │       ├── model/          # JPA Entities (MySQL)
│   │       ├── repository/     # Spring Data JPA Repositories
│   │       ├── config/         # Security, CORS, Swagger setup
│   │       └── exception/      # Error handling
│   ├── pom.xml                 # Maven dependencies
│   └── ...
│
├── frontend/                   # Next.js React app
│   ├── app/                    # Pages and routes
│   ├── components/             # UI and shared components
│   ├── lib/                    # API client, utilities
│   ├── package.json
│   └── ...
│
├── Documentation/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEVELOPMENT_SETUP.md
│   ├── DATA_STORAGE_AND_REALTIME.md
│   └── FIREBASE_SETUP.md
│
└── ...
```

## 📚 API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Vendors
- `GET /api/vendors`
- `GET /api/vendors/search`
- `POST /api/vendors`
- `GET /api/vendors/{id}`

### Community (Hot Topics)
- `GET /api/hottopics`
- `POST /api/hottopics/community`
- `POST /api/hottopics/{id}/comment`
- `POST /api/hottopics/{id}/like`

Full API docs: `/swagger-ui/index.html`

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 21
- **Database**: MySQL (Aiven Cloud)
- **ORM**: Spring Data JPA / Hibernate
- **Auth**: Spring Security + JWT cookie session
- **Email**: SMTP via `JavaMailSender`
- **Auxiliary**: Firebase Admin SDK + Firebase Web SDK
- **Build**: Maven

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🧪 Testing

No centralized test suite is configured yet. Add frontend unit tests with Vitest or Jest, and backend tests with Spring Boot Test + Testcontainers.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](Documentation/ARCHITECTURE.md)** | **System Design & Explanation** |
| **[DEPLOYMENT.md](Documentation/DEPLOYMENT.md)** | Guide for Vercel & Render deployment |
| **[DATABASE_SCHEMA.md](Documentation/DATABASE_SCHEMA.md)** | MySQL Database Schema & ERD |
| **[DATA_STORAGE_AND_REALTIME.md](Documentation/DATA_STORAGE_AND_REALTIME.md)** | MySQL vs Firebase ownership model |
| **[DEVELOPMENT_SETUP.md](Documentation/DEVELOPMENT_SETUP.md)** | Local development setup guide |
| **[FIREBASE_SETUP.md](Documentation/FIREBASE_SETUP.md)** | Auxiliary Firebase configuration |

---

**Made with ❤️ for street food lovers** 🍽️  
Last Updated: 2026
