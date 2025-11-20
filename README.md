
# 🍽️ StreetBite - Street Food Discovery Platform

A full-stack application connecting food lovers with local street food vendors, built with **Next.js (Frontend)** and **Spring Boot (Backend)**.

## ✨ Features

- 🔍 **Location-based vendor search** - Find vendors near you using geolocation
- 👤 **User authentication** - Sign up as customer or vendor
- 🏪 **Vendor management** - Complete vendor dashboard
- 📋 **Menu management** - Add, edit, delete menu items
- 📊 **Analytics** - Track revenue, orders, and performance
- ⚙️ **Settings** - Manage vendor profile and preferences
- 🗺️ **Geocoding** - Automatic address to coordinates conversion

---

## 🚀 Quick Start

### Prerequisites
- **Java 21+** (for backend)
- **Node.js 18+** (for frontend)
- **Maven** (or use included wrapper)
- **JAVA_HOME** environment variable must be set to your Java installation directory

### One-Command Startup
```powershell
.\start-all.ps1
```

This script will:
- ✅ Detect and configure Firebase credentials
- ✅ Detect and configure Google Maps API key
- ✅ Start backend (Spring Boot on port 8080)
- ✅ Start frontend (Next.js on port 3000)
- ✅ Wait for both servers to be ready
- ✅ Display ready status with links

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
│   │       ├── model/          # Data models
│   │       ├── config/         # Firebase, CORS setup
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
│   ├── README.md              # This file (project overview)
│   ├── SETUP.md               # Setup & installation guide
│   ├── FIREBASE_SETUP.md      # Firebase configuration
│   ├── FIREBASE_AUTH_SETUP.md # Authentication setup
│   ├── DATABASE_STATUS.md     # Database documentation
│   └── .env.example           # Environment variables template
│
├── Startup Scripts/
│   ├── start-all.ps1          # Start frontend + backend
│   ├── start-backend.ps1      # Start backend only
│   └── start-project.ps1      # Start with separate windows
│
└── Configuration Files
    ├── .gitignore             # Git ignore rules
    ├── firebase-key.json      # Firebase credentials (placeholder)
    ├── package.json           # Root npm config
    └── .env                   # Environment variables (local only)
```

---

## 🔧 Configuration

### Required Setup (First Time)

1. **Get Firebase Service Account Key**
   - Go to: https://console.firebase.google.com/
   - Select project: `street-bite-v1`
   - Settings → Service Accounts → Generate New Private Key
   - Replace placeholder in `firebase-key.json`

2. **Get Google Maps API Key**
   - Go to: https://console.cloud.google.com/
   - Create API Key
   - Enable Geocoding API
   - When running scripts, you'll be prompted to enter this key

3. **Enable Firebase Authentication**
   - Go to Firebase Console
   - Authentication → Sign-in methods
   - Enable Email/Password

See **[SETUP.md](Documentation/SETUP.md)** for detailed instructions.

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (customer/vendor)
- `POST /api/auth/login` - Login and get token

### Vendors
- `GET /api/vendors/all` - List all vendors
- `GET /api/vendors/search?lat=X&lng=Y&radius=Z` - Search by location
- `POST /api/vendors/register` - Register new vendor
- `GET /api/vendors/{vendorId}` - Get vendor details
- `PUT /api/vendors/{vendorId}` - Update vendor

### Menu
- `GET /api/menu/vendor/{vendorId}` - Get vendor menu
- `POST /api/menu/{vendorId}` - Add menu item
- `PUT /api/menu/{itemId}` - Update menu item
- `DELETE /api/menu/{itemId}` - Delete menu item

### Reviews
- `POST /api/reviews` - Post review
- `GET /api/vendors/{vendorId}/reviews` - Get vendor reviews
- `PUT /api/reviews/{reviewId}` - Update review
- `DELETE /api/reviews/{reviewId}` - Delete review

### Analytics
- `GET /api/analytics/vendor/{vendorId}` - Get vendor analytics

Full API documentation available at: http://localhost:8080 (when running)

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Admin SDK
- **API**: Google Maps Geocoding
- **Build**: Maven

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Firebase Client SDK
- **HTTP**: Fetch API

### Database
- **Firestore**: Real-time NoSQL document database
- **Collections**: users, vendors, menuItems, reviews, promotions, geocoding_cache

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[SETUP.md](Documentation/SETUP.md)** | Complete setup & installation guide |
| **[FIREBASE_SETUP.md](Documentation/FIREBASE_SETUP.md)** | Firebase configuration for backend |
| **[FIREBASE_AUTH_SETUP.md](Documentation/FIREBASE_AUTH_SETUP.md)** | Enable authentication in Firebase |
| **[DATABASE_STATUS.md](Documentation/DATABASE_STATUS.md)** | Database schema & Firestore collections |

---

## 🎯 Common Tasks

### Run Everything
```powershell
.\start-all.ps1
```

### Run Backend Only
```powershell
.\start-backend.ps1
```

### Run Frontend Only
```powershell
cd frontend
npm install  # first time only
npm run dev
```

### Install Frontend Dependencies
```powershell
npm run frontend:install
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Backend Health**: http://localhost:8080/actuator/health

---

## 🔐 Security

- ✅ `firebase-key.json` is in `.gitignore` (never committed)
- ✅ API keys stored in environment variables
- ✅ No hardcoded secrets in source code
- ✅ Firebase Admin SDK for secure backend operations
- ✅ CORS configured for frontend origin only

**Never commit real credentials to Git!**

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Script blocked | Run: `powershell -ExecutionPolicy Bypass -File .\start-all.ps1` |
| Port 8080 in use | Change `server.port` in `backend/src/main/resources/application.properties` |
| Port 3000 in use | Stop the process or change port in `frontend/package.json` |
| Firebase connection error | Verify `GOOGLE_APPLICATION_CREDENTIALS` env var points to valid JSON |
| Geocoding fails | Ensure `GOOGLE_GEOCODING_API_KEY` is set and API is enabled |
| Cannot sign up | Enable Email/Password auth in Firebase Console |

For more troubleshooting, see [SETUP.md](Documentation/SETUP.md#troubleshooting).

---

## 📝 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for street food discovery.

---

**Made with ❤️ for street food lovers** 🍽️

Last Updated: 2025
Version: 1.0.0

=======

