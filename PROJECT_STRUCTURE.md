# 📁 StreetBite Project Structure

## ✅ Consolidated Structure

The project has been reorganized into a clean, standardized structure:

```
final_project/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/streetbite/
│   │       │       ├── config/          # Configuration classes
│   │       │       ├── controller/      # REST API endpoints
│   │       │       ├── model/           # Data models
│   │       │       ├── service/         # Business logic
│   │       │       └── StreetBiteApplication.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
├── frontend/                   # Next.js Frontend
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities and API functions
│   ├── public/                 # Static assets
│   └── package.json
│
├── Documentation/
│   ├── README.md              # Main project documentation
│   ├── SETUP.md               # Setup instructions
│   └── FIREBASE_SETUP.md      # Firebase configuration guide
│
└── Scripts/
    ├── start-all.ps1          # Start both backend and frontend
    ├── start-backend.ps1      # Start backend only
    └── start-project.ps1      # Alternative startup script
```

## 📦 Backend Structure

### Controllers (7 total)
- `AuthController.java` - Authentication endpoints
- `VendorController.java` - Vendor management
- `MenuController.java` - Menu item management
- `AnalyticsController.java` - Analytics endpoints
- `ReviewController.java` - Reviews and ratings
- `PromotionController.java` - Promotions/offers
- `UserController.java` - User favorites

### Models (5 total)
- `User.java` - User model
- `Vendor.java` - Vendor model
- `MenuItem.java` - Menu item model
- `Review.java` - Review model
- `Promotion.java` - Promotion model

### Services (3 total)
- `FirestoreService.java` - Firestore database operations
- `GeocodingService.java` - Address geocoding with caching
- `VendorSearchService.java` - Vendor search with caching

### Configuration (2 total)
- `CacheConfig.java` - Caching configuration
- `CorsConfig.java` - CORS configuration

## 🎨 Frontend Structure

### Pages (App Router)
- `/` - Home page
- `/explore` - Vendor discovery with map
- `/signup` - User registration
- `/signin` - User login
- `/vendor/*` - Vendor dashboard
- `/admin/*` - Admin dashboard

### Key Components
- `vendor-map.tsx` - Google Maps integration
- `vendor-card.tsx` - Vendor display card
- `navbar.tsx` - Navigation bar
- Dashboard components (vendor/admin)

### Libraries
- `api.ts` - Backend API functions
- `firebase.ts` - Firebase configuration
- `useUserLocation.tsx` - Location hook with cookie caching

## 🚀 Quick Access

- **Backend**: `cd backend`
- **Frontend**: `cd frontend` (or `cd final_project\frontend` if not moved yet)
- **Start All**: `.\start-all.ps1`

## 📝 Notes

- Backend is now consolidated at root level
- Frontend may still be in `final_project\frontend` if it's currently running
- All scripts have been updated to use the new structure

