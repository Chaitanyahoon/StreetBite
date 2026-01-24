# StreetBite Backend Architecture Design

## Project Overview
Backend service for StreetBite - a geolocation-driven street food discovery platform built with Spring Boot, integrated with Google Maps Geocoding API and Firebase Admin SDK.

---

## 🏗️ System Architecture

### Technology Stack
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Build Tool**: Maven
- **Database**: Firestore (NoSQL)
- **Geocoding**: Google Maps API
- **Authentication**: Firebase Admin SDK
- **Cloud Hosting**: Render
- **Package Manager**: Maven Central

### Architectural Pattern
- **MVC Pattern**: Controller → Service → Repository
- **REST API**: RESTful endpoints for client communication
- **Dependency Injection**: Spring Framework IoC container
- **Configuration**: Environment-based properties (application.properties)

---

## 📦 Project Structure

\`\`\`
backend/
├── src/main/java/com/streetbite/
│   ├── controller/              # REST API Controllers
│   │   ├── VendorController.java
│   │   ├── UserController.java
│   │   ├── ReviewController.java
│   │   └── SearchController.java
│   │
│   ├── service/                 # Business Logic Layer
│   │   ├── VendorService.java
│   │   ├── UserService.java
│   │   ├── ReviewService.java
│   │   ├── GeocodingService.java
│   │   ├── SearchService.java
│   │   └── NotificationService.java
│   │
│   ├── repository/              # Data Access Layer
│   │   ├── VendorRepository.java
│   │   ├── UserRepository.java
│   │   ├── ReviewRepository.java
│   │   └── FirestoreRepository.java
│   │
│   ├── model/                   # Data Models & DTOs
│   │   ├── Vendor.java
│   │   ├── User.java
│   │   ├── Review.java
│   │   ├── Location.java
│   │   ├── MenuItem.java
│   │   └── dto/
│   │       ├── VendorDTO.java
│   │       ├── VendorRegistrationRequest.java
│   │       └── SearchRequestDTO.java
│   │
│   ├── exception/               # Custom Exception Handling
│   │   ├── StreetbiteException.java
│   │   ├── VendorNotFoundException.java
│   │   └── GlobalExceptionHandler.java
│   │
│   ├── config/                  # Configuration Classes
│   │   ├── FirebaseConfig.java
│   │   ├── GoogleMapsConfig.java
│   │   └── CorsConfig.java
│   │
│   ├── util/                    # Utility Classes
│   │   ├── GeocodingUtil.java
│   │   ├── ValidationUtil.java
│   │   └── DateUtil.java
│   │
│   └── StreetbiteBackendApplication.java  # Main Entry Point
│
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│   └── firebase-service-account.json (add to .gitignore)
│
├── pom.xml                      # Maven Dependencies
└── README.md
\`\`\`

---

## 🗂️ Firestore Database Schema

### Collections Structure

#### 1. **vendors** Collection
\`\`\`
vendors/{vendorId}
├── name: string
├── description: string
├── cuisineTypes: array<string>  // ["Indian", "Chinese", "Momos"]
├── location:
│   ├── latitude: number
│   ├── longitude: number
│   ├── address: string
│   ├── city: string
│   └── zipCode: string
├── contact:
│   ├── phone: string
│   ├── email: string
│   └── whatsapp: string
├── operatingHours:
│   ├── monday: {open: "10:00", close: "22:00"}
│   ├── tuesday: {open: "10:00", close: "22:00"}
│   └── ... (rest of days)
├── menu: array<MenuItem>
│   └── [
│       {id, name, description, price, image, category},
│       ...
│     ]
├── averageRating: number        // 1-5
├── totalReviews: number
├── imageUrl: string             // vendor photo
├── openNow: boolean
├── priceRange: string           // "Budget", "Medium", "Premium"
├── isVerified: boolean
├── createdAt: timestamp
├── updatedAt: timestamp
├── tags: array<string>          // ["Popular", "Trending", "New"]
└── status: string               // "active", "inactive", "suspended"
\`\`\`

#### 2. **users** Collection
\`\`\`
users/{userId}
├── uid: string                  // Firebase Auth UID
├── email: string
├── displayName: string
├── photoUrl: string
├── phoneNumber: string
├── location:
│   ├── latitude: number
│   ├── longitude: number
│   ├── address: string
│   └── city: string
├── favorites: array<string>     // [vendorId1, vendorId2, ...]
├── reviews: array<string>       // [reviewId1, reviewId2, ...]
├── accountType: string          // "customer", "vendor", "admin"
├── createdAt: timestamp
├── updatedAt: timestamp
└── isActive: boolean
\`\`\`

#### 3. **reviews** Collection
\`\`\`
reviews/{reviewId}
├── vendorId: string
├── userId: string
├── userName: string
├── userPhoto: string
├── rating: number               // 1-5
├── comment: string
├── images: array<string>        // [imageUrl1, imageUrl2, ...]
├── likes: number
├── helpful: number
├── createdAt: timestamp
├── updatedAt: timestamp
└── isVerified: boolean          // verified purchase
\`\`\`

#### 4. **search_index** Collection (for advanced search)
\`\`\`
search_index/{vendorId}
├── vendorName: string
├── cuisineTypes: array<string>
├── tags: array<string>
├── city: string
├── location: geopoint          // Special Firestore type for geo-queries
├── keywords: array<string>     // lowercase search keywords
└── isActive: boolean
\`\`\`

---

## 🔌 API Endpoints Design

### Base URL
\`\`\`
https://streetbite-backend.onrender.com/api/v1
\`\`\`

### Authentication
- All protected endpoints require Firebase Auth Token in header
- Header: `Authorization: Bearer <Firebase_ID_Token>`

---

### **Vendor Endpoints**

#### 1. Register Vendor
\`\`\`
POST /vendors/register
Content-Type: application/json

Request Body:
{
  "name": "Street Chai Corner",
  "description": "Authentic Indian chai and snacks",
  "cuisineTypes": ["Indian", "Beverages"],
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Delhi, India",
    "city": "Delhi",
    "zipCode": "110001"
  },
  "contact": {
    "phone": "+919876543210",
    "email": "vendor@streetbite.com",
    "whatsapp": "+919876543210"
  },
  "operatingHours": {
    "monday": {"open": "06:00", "close": "22:00"},
    ...
  },
  "priceRange": "Budget"
}

Response (201):
{
  "vendorId": "vendor_uuid",
  "message": "Vendor registered successfully",
  "status": "active"
}
\`\`\`

#### 2. Get Vendor Profile
\`\`\`
GET /vendors/{vendorId}

Response (200):
{
  "vendorId": "vendor_uuid",
  "name": "Street Chai Corner",
  "description": "...",
  "location": {...},
  "menu": [...],
  "averageRating": 4.5,
  "totalReviews": 230,
  "openNow": true,
  ...
}
\`\`\`

#### 3. Update Vendor Profile
\`\`\`
PUT /vendors/{vendorId}
Authorization: Bearer <Token>

Request Body: (partial update)
{
  "name": "New Name",
  "operatingHours": {...},
  "priceRange": "Medium"
}

Response (200): Updated vendor object
\`\`\`

#### 4. Delete Vendor
\`\`\`
DELETE /vendors/{vendorId}
Authorization: Bearer <Token>

Response (200):
{
  "message": "Vendor deleted successfully"
}
\`\`\`

#### 5. List All Vendors (with pagination)
\`\`\`
GET /vendors?page=0&size=20&city=Delhi

Response (200):
{
  "content": [{...}, {...}],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0
}
\`\`\`

---

### **Search & Discovery Endpoints**

#### 1. Search Vendors by Location (Geospatial)
\`\`\`
GET /search/nearby?latitude=28.6139&longitude=77.2090&radius=2&unit=km

Response (200):
{
  "vendors": [
    {
      "vendorId": "vendor_uuid",
      "name": "Chai Corner",
      "distance": 0.8,  // km
      "averageRating": 4.5
    },
    ...
  ]
}
\`\`\`

#### 2. Search by Cuisine/Filters
\`\`\`
GET /search/filter?cuisine=Indian&priceRange=Budget&city=Delhi&page=0

Response (200):
{
  "content": [{...}],
  "filters": {
    "appliedCuisines": ["Indian"],
    "appliedPriceRange": ["Budget"]
  }
}
\`\`\`

#### 3. Global Search
\`\`\`
GET /search?query=chai&city=Delhi

Response (200):
{
  "vendors": [{...}],
  "dishes": [{...}],
  "results_count": 45
}
\`\`\`

#### 4. Trending Vendors
\`\`\`
GET /search/trending?city=Delhi&limit=10

Response (200):
{
  "vendors": [
    {
      "vendorId": "...",
      "name": "...",
      "tag": "Trending",
      "recentReviews": 50
    },
    ...
  ]
}
\`\`\`

---

### **Review & Rating Endpoints**

#### 1. Post Review
\`\`\`
POST /reviews
Authorization: Bearer <Token>

Request Body:
{
  "vendorId": "vendor_uuid",
  "rating": 4,
  "comment": "Great food, quick service!",
  "images": ["imageUrl1", "imageUrl2"],
  "isVerifiedPurchase": true
}

Response (201):
{
  "reviewId": "review_uuid",
  "message": "Review posted successfully"
}
\`\`\`

#### 2. Get Reviews for Vendor
\`\`\`
GET /vendors/{vendorId}/reviews?page=0&size=10

Response (200):
{
  "content": [
    {
      "reviewId": "...",
      "userName": "John Doe",
      "rating": 4,
      "comment": "...",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ],
  "averageRating": 4.5
}
\`\`\`

#### 3. Update Review
\`\`\`
PUT /reviews/{reviewId}
Authorization: Bearer <Token>

Request Body:
{
  "rating": 5,
  "comment": "Updated comment"
}

Response (200): Updated review
\`\`\`

#### 4. Delete Review
\`\`\`
DELETE /reviews/{reviewId}
Authorization: Bearer <Token>

Response (200):
{
  "message": "Review deleted"
}
\`\`\`

---

### **User Endpoints**

#### 1. Create User Profile
\`\`\`
POST /users
Authorization: Bearer <Token>

Request Body:
{
  "displayName": "John Doe",
  "phoneNumber": "+919876543210",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "city": "Delhi"
  }
}

Response (201):
{
  "userId": "user_uuid",
  "message": "User profile created"
}
\`\`\`

#### 2. Get User Profile
\`\`\`
GET /users/{userId}
Authorization: Bearer <Token>

Response (200):
{
  "userId": "...",
  "displayName": "...",
  "favorites": ["vendor_id1", "vendor_id2"],
  "reviews": [{...}]
}
\`\`\`

#### 3. Add Vendor to Favorites
\`\`\`
POST /users/{userId}/favorites/{vendorId}
Authorization: Bearer <Token>

Response (200):
{
  "message": "Added to favorites",
  "favoriteCount": 12
}
\`\`\`

#### 4. Remove from Favorites
\`\`\`
DELETE /users/{userId}/favorites/{vendorId}
Authorization: Bearer <Token>

Response (200):
{
  "message": "Removed from favorites"
}
\`\`\`

---

## 🔐 Security & Validation

### Request Validation
- All inputs validated server-side
- Email format, phone number format validation
- Latitude/Longitude bounds checking
- String length limits

### Authentication
- Firebase Admin SDK for token verification
- Role-based access control (customer, vendor, admin)
- Protected endpoints require valid Firebase token

### Error Handling
\`\`\`java
400 Bad Request - Invalid input
401 Unauthorized - Missing/invalid token
403 Forbidden - Access denied
404 Not Found - Resource not found
409 Conflict - Duplicate vendor email
500 Internal Server Error - Server error
\`\`\`

---

## 📊 Database Indexing Strategy

### Firestore Indexes Needed
\`\`\`
1. vendors: city, isActive (for city-wide queries)
2. vendors: cuisineTypes, city (for cuisine filtering)
3. search_index: location (geospatial indexing)
4. reviews: vendorId, createdAt (for recent reviews)
5. users: accountType, isActive (for admin queries)
\`\`\`

---

## 🚀 Deployment Configuration

### Environment Variables Required
\`\`\`
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_BACKEND_URL=https://streetbite-backend.onrender.com
SERVER_PORT=8080
\`\`\`

### Cloud Run Deployment
- Memory: 512MB
- CPU: 1 vCPU
- Timeout: 300s
- Concurrency: 80

---

## 📝 Next Steps

1. ✅ Backend Architecture Design (COMPLETED)
2. ⏳ Spring Boot Project Setup & Dependencies
3. ⏳ Entity Models & DTOs
4. ⏳ Firestore Repository Layer
5. ⏳ Service Layer Implementation
6. ⏳ Controller & REST Endpoints
7. ⏳ Exception Handling & Validation
8. ⏳ Testing & Deployment
