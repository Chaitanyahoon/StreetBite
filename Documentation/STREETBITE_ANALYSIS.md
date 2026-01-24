# 🍽️ StreetBite Project Analysis

## Project Overview

**StreetBite** is a full-stack street food discovery platform that connects food lovers with local street food vendors. The application enables users to find nearby vendors using geolocation, view menus, read reviews, and discover authentic local food experiences. Vendors can manage their profiles, menus, promotions, and track analytics through a comprehensive dashboard.

---

## 🏗️ Architecture

### High-Level Architecture

StreetBite follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │ (App Router) │  │   (React)    │  │  (API Calls) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │→ │   Services   │→ │  Firestore   │      │
│  │  (REST API)  │  │ (Business)   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Firestore (NoSQL)                  │
│  users | vendors | menuItems | reviews | promotions         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### **Frontend**
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 (Canary)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: React Hooks
- **Authentication**: Firebase Client SDK
- **HTTP Client**: Fetch API
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

#### **Backend**
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Build Tool**: Maven
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Admin SDK 9.2.0
- **Caching**: Caffeine Cache 3.1.8
- **API Integration**: Google Maps Geocoding API
- **JSON Processing**: Jackson

#### **Infrastructure**
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: 
  - **Frontend**: Vercel
  - **Backend**: Render
- **Email Service**: Resend (via SDK)
- **Development**: Local development with hot reload

---

## 📁 Project Structure

### Root Directory
```
StreetBite/
├── StreetBite/                    # Main project directory
│   ├── frontend/                  # Next.js application
│   ├── backend/                   # Spring Boot application
│   ├── Documentation/             # Project documentation
│   ├── package.json              # Root npm scripts
│   ├── start-all.ps1             # Start both frontend & backend
│   ├── start-backend.ps1         # Start backend only
│   └── firebase-key.json.local   # Firebase credentials (template)
```

### Frontend Structure
```
frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Home/Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── explore/                 # Vendor discovery page
│   ├── vendor/                  # Vendor dashboard
│   │   ├── page.tsx            # Dashboard home
│   │   ├── menu/               # Menu management
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── promotions/         # Promotions management
│   │   └── settings/           # Vendor settings
│   ├── admin/                   # Admin dashboard
│   │   ├── page.tsx            # Admin home
│   │   ├── vendors/            # Vendor management
│   │   └── analytics/          # System analytics
│   ├── profile/                 # User profile
│   ├── signin/                  # Sign in page
│   ├── signup/                  # Sign up page
│   ├── offers/                  # Promotions/offers
│   └── about/                   # About page
│
├── components/                   # React components
│   ├── navbar.tsx               # Navigation bar
│   ├── hero-section.tsx         # Landing hero
│   ├── vendor-card.tsx          # Vendor display card
│   ├── vendor-map.tsx           # Map with vendor markers
│   ├── search-bar.tsx           # Search component
│   ├── feature-card.tsx         # Feature display
│   ├── logo.tsx                 # Logo component
│   ├── dashboard/               # Dashboard components
│   └── ui/                      # Reusable UI components (Radix)
│
├── lib/                          # Utilities and services
├── hooks/                        # Custom React hooks
├── styles/                       # Additional styles
└── public/                       # Static assets
```

### Backend Structure
```
backend/
├── src/main/java/com/streetbite/
│   ├── StreetBiteApplication.java    # Main entry point
│   │
│   ├── controller/                    # REST API Controllers
│   │   ├── AuthController.java       # Authentication endpoints
│   │   ├── VendorController.java     # Vendor CRUD operations
│   │   ├── MenuController.java       # Menu management
│   │   ├── ReviewController.java     # Reviews and ratings
│   │   ├── PromotionController.java  # Promotions management
│   │   ├── UserController.java       # User operations
│   │   └── AnalyticsController.java  # Analytics data
│   │
│   ├── service/                       # Business logic layer
│   │   ├── FirestoreService.java     # Firestore operations
│   │   ├── GeocodingService.java     # Google Maps integration
│   │   └── VendorSearchService.java  # Search functionality
│   │
│   ├── model/                         # Data models & DTOs
│   ├── config/                        # Configuration classes
│   └── exception/                     # Error handling
│
├── src/main/resources/
│   └── application.properties         # Application config
│
└── pom.xml                            # Maven dependencies
```

---

## 🔥 Firebase Integration

### Firestore Collections

#### 1. **users** Collection
Stores user profiles for customers, vendors, and admins.

```javascript
{
  email: string,
  displayName: string,
  role: "CUSTOMER" | "VENDOR" | "ADMIN",
  phoneNumber?: string,
  photoUrl?: string,
  location?: { latitude: number, longitude: number },
  favorites?: string[],        // Array of vendor IDs
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### 2. **vendors** Collection
Contains vendor information and profiles.

```javascript
{
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  cuisine: string,
  phone?: string,
  hours?: string,
  description?: string,
  averageRating?: number,
  totalReviews?: number,
  createdAt: string,
  updatedAt: string
}
```

#### 3. **menuItems** Collection
Menu items associated with vendors.

```javascript
{
  vendorId: string,
  name: string,
  description?: string,
  price: number,
  category: string,
  imageUrl?: string,
  isAvailable: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### 4. **reviews** Collection
User reviews and ratings for vendors.

```javascript
{
  vendorId: string,
  userId: string,
  userName: string,
  rating: number,              // 1-5
  comment?: string,
  imageUrls?: string[],
  isVerifiedPurchase: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### 5. **promotions** Collection
Vendor promotions and special offers.

```javascript
{
  vendorId: string,
  title: string,
  description: string,
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_ONE_GET_ONE",
  discountValue: number,
  promoCode?: string,
  startDate: string,
  endDate: string,
  isActive: boolean,
  maxUses?: number,
  currentUses: number,
  imageUrl?: string,
  createdAt: string,
  updatedAt: string
}
```

#### 6. **geocoding_cache** Collection
Cached geocoding results to reduce API calls.

```javascript
{
  address: string,
  latitude: number,
  longitude: number,
  cachedAt: string
}
```

---

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:8081/api`
- **Production**: `https://streetbite-backend.onrender.com/api` (Render URL)

### Authentication Endpoints
```
POST /auth/register          - Register new user (customer/vendor)
POST /auth/login             - Login and get token
```

### Vendor Endpoints
```
GET    /vendors/all          - List all vendors
GET    /vendors/{id}         - Get vendor details
POST   /vendors/register     - Register new vendor
PUT    /vendors/{id}         - Update vendor profile
DELETE /vendors/{id}         - Delete vendor
GET    /vendors/search       - Search vendors by location
       ?lat=X&lng=Y&radius=Z
```

### Menu Endpoints
```
GET    /menu/vendor/{vendorId}  - Get vendor menu
POST   /menu/{vendorId}         - Add menu item
PUT    /menu/{itemId}           - Update menu item
DELETE /menu/{itemId}           - Delete menu item
```

### Review Endpoints
```
POST   /reviews                      - Post review
GET    /vendors/{vendorId}/reviews   - Get vendor reviews
PUT    /reviews/{reviewId}           - Update review
DELETE /reviews/{reviewId}           - Delete review
```

### User Endpoints
```
GET    /users/{userId}                      - Get user profile
PUT    /users/{userId}                      - Update user profile
POST   /users/{userId}/favorites/{vendorId} - Add to favorites
DELETE /users/{userId}/favorites/{vendorId} - Remove from favorites
```

### Analytics Endpoints
```
GET /analytics/vendor/{vendorId}  - Get vendor analytics
```

---

## ✨ Key Features

### For Customers
1. **Location-Based Search** - Find vendors near current location using geolocation
2. **Interactive Map** - View vendors on an interactive map with markers
3. **Vendor Discovery** - Browse vendors by cuisine, rating, distance
4. **Menu Viewing** - View detailed menus with prices and descriptions
5. **Reviews & Ratings** - Read and write reviews for vendors
6. **Favorites** - Save favorite vendors for quick access
7. **Promotions** - View active promotions and special offers

### For Vendors
1. **Vendor Dashboard** - Comprehensive dashboard with key metrics
2. **Menu Management** - Add, edit, delete menu items
3. **Analytics** - Track revenue, orders, customer engagement
4. **Promotions Management** - Create and manage promotional offers
5. **Profile Settings** - Update vendor information, hours, contact details
6. **Review Management** - View and respond to customer reviews

### For Admins
1. **Vendor Management** - Approve, suspend, or manage vendors
2. **System Analytics** - View platform-wide statistics
3. **User Management** - Manage user accounts

---

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Vibrant gradients with primary orange/amber tones
- **Typography**: Modern, bold fonts (likely Inter or similar)
- **Components**: Glassmorphism effects, rounded corners, shadows
- **Animations**: Smooth transitions, hover effects, floating animations
- **Responsive**: Mobile-first design with breakpoints for tablet/desktop

### Key Design Elements
- **Gradient Backgrounds**: Animated gradient overlays
- **Hover Effects**: Scale, translate, glow effects on interactive elements
- **Micro-animations**: Floating badges, pulsing indicators
- **Shadow System**: Soft, elevated, and floating shadow variants
- **Card Design**: Rounded cards with border hover effects

---

## 🔐 Security & Authentication

### Firebase Authentication
- Email/password authentication
- JWT token-based authorization
- Role-based access control (CUSTOMER, VENDOR, ADMIN)
- Protected routes on frontend
- Token verification on backend using Firebase Admin SDK

### Security Best Practices
- Environment variables for sensitive data
- Firebase credentials never committed to Git
- CORS configuration for frontend origin only
- Input validation on both client and server
- Secure API endpoints with authentication middleware

---

## 🚀 Development Workflow

### Starting the Application

#### Option 1: Start Everything (Recommended)
```powershell
.\start-all.ps1
```
This script:
- Detects Firebase credentials
- Detects Google Maps API key
- Starts backend on port 8080
- Starts frontend on port 3000
- Displays ready status with links

#### Option 2: Start Backend Only
```powershell
.\start-backend.ps1
```

#### Option 3: Start Frontend Only
```powershell
cd frontend
npm run dev
```

### Environment Setup

#### Required Environment Variables
```bash
# Firebase
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-key.json

# Google Maps
GOOGLE_GEOCODING_API_KEY=your_api_key_here

# Backend URL (for frontend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/actuator/health

---

## 📊 Data Flow

### User Registration Flow
```
1. User fills registration form (frontend)
2. Frontend validates input
3. POST /api/auth/register → Backend
4. Backend creates user in Firestore
5. Backend returns user ID and token
6. Frontend stores token and redirects to dashboard
```

### Vendor Search Flow
```
1. User enters location or uses current location
2. Frontend sends coordinates to backend
3. Backend queries Firestore for nearby vendors
4. Backend calculates distances
5. Backend returns sorted vendor list
6. Frontend displays vendors on map and list
```

### Menu Management Flow (Vendor)
```
1. Vendor adds menu item via dashboard
2. Frontend validates input
3. POST /api/menu/{vendorId} → Backend
4. Backend saves to Firestore menuItems collection
5. Backend returns success
6. Frontend updates UI with new item
```

---

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for services
- Integration tests for controllers
- Firestore mock testing
- API endpoint testing

### Frontend Testing
- Component testing with React Testing Library
- E2E testing with browser automation
- Manual testing for UI/UX

---



## 📈 Recent Enhancements

Based on conversation history:

1.  **Deployment & Infrastructure** (Jan 2026)
    - Deployed Backend to **Render**.
    - Deployed Frontend to **Vercel**.
    - Configured CORS and Environment Variables for production.

2.  **Email Service Upgrade** (Dec 2025)
    - Integrated **Resend SDK** for reliable email delivery.
    - Replaced unstable SMTP configuration.
    - Fixed "Forgot Password" flow.

3.  **Mobile Responsiveness** (Dec 2025)
    - **Collapsible Footer**: Implemented accordion-style footer for mobile.
    - **Navbar**: Optimized spacing and layout for smaller screens.
    - **Vendor Cards**: Improved card responsiveness and layout.

4.  **Firebase Migration** (Nov 19, 2025)
    - Migrated from Supabase to Firebase.
    - Updated authentication system.

---

## 🎯 Current Status

### ✅ Completed
- Full-stack architecture setup
- Firebase Firestore integration
- Authentication system (Firebase Auth)
- Vendor CRUD operations
- Menu management
- Review system
- Analytics dashboard
- Promotions management
- Geocoding integration
- Responsive UI with modern design
- Location-based search

### 🔄 In Progress
- Performance optimization
- Additional features based on user feedback

---

## 📝 Key Files Reference

### Configuration Files
- [`package.json`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/package.json) - Root npm scripts
- [`frontend/package.json`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/frontend/package.json) - Frontend dependencies
- [`backend/pom.xml`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/backend/pom.xml) - Backend dependencies

### Documentation Files
- [`README.md`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/README.md) - Project overview
- [`BACKEND_ARCHITECTURE.md`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/frontend/BACKEND_ARCHITECTURE.md) - Backend design
- [`DATABASE_STATUS.md`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/Documentation/DATABASE_STATUS.md) - Database documentation

### Key Source Files
- [`frontend/app/page.tsx`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/frontend/app/page.tsx) - Landing page
- [`backend/src/main/java/com/streetbite/StreetBiteApplication.java`](file:///C:/Users/patil/OneDrive/Desktop/StreetBite/StreetBite/backend/src/main/java/com/streetbite/StreetBiteApplication.java) - Backend entry point

---

## 🎓 Learning Resources

### Technologies to Understand
1. **Next.js 16** - App Router, Server Components, Client Components
2. **Spring Boot 3** - REST APIs, Dependency Injection, MVC pattern
3. **Firebase Firestore** - NoSQL database, Collections, Queries
4. **Firebase Authentication** - JWT tokens, User management
5. **Google Maps API** - Geocoding, Location services
6. **Tailwind CSS** - Utility-first CSS framework
7. **TypeScript** - Type-safe JavaScript

### Architecture Patterns
- **MVC (Model-View-Controller)** - Backend architecture
- **Component-Based Architecture** - Frontend React components
- **RESTful API Design** - HTTP methods, status codes, endpoints
- **Client-Server Architecture** - Separation of concerns

---

## 🚀 Next Steps for Development

1. **Explore the Codebase**
   - Read through key components in `frontend/components/`
   - Review backend controllers in `backend/src/main/java/com/streetbite/controller/`
   - Understand data models and DTOs

2. **Run the Application**
   - Set up Firebase credentials
   - Get Google Maps API key
   - Run `.\start-all.ps1`
   - Test basic functionality

3. **Make Changes**
   - Start with small UI tweaks
   - Add new features incrementally
   - Test thoroughly before committing

4. **Learn by Doing**
   - Try adding a new menu item
   - Create a test vendor
   - Write a review
   - View analytics

---

**Last Updated**: November 20, 2025  
**Version**: 1.0.0  
**Status**: Active Development
