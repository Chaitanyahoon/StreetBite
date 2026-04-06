# 🏗️ StreetBite Architecture & Design

**StreetBite** is a full-stack discovery platform enabling users to find local street food vendors. It is built on a **Client-Server Architecture**, leveraging **Next.js** for a dynamic frontend and **Spring Boot** for a robust backend, with **MySQL** as the source of truth.

---

## 📐 High-Level Architecture

```mermaid
graph TD
    User((User))
    
    subgraph Frontend [Next.js (Vercel)]
        UI[React UI Components]
        Pages[App Router Pages]
        API_Client[Lib/API Client]
    end
    
    subgraph Backend [Spring Boot (Render)]
        Controller[REST Controllers]
        Service[Service Layer]
        Repository[JPA Repositories]
        Security[Spring Security / JWT]
        FirebaseSDK[Firebase Admin SDK]
    end
    
    subgraph Data [Data Layer]
        MySQL[(MySQL Database)]
        FirebaseServices[Firebase Services]
    end

    User -->|Interaction| UI
    UI --> Pages
    Pages -->|HTTP Requests| API_Client
    API_Client -->|REST API| Controller
    
    Controller --> Service
    Service --> Repository
    Service -->|Auxiliary| FirebaseSDK
    
    Repository -->|JDBC| MySQL
    FirebaseSDK -->|Realtime Mirrors/Push| FirebaseServices
```

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Deployment**: Vercel

### Backend (Server-Side)
- **Framework**: [Spring Boot 3.3](https://spring.io/projects/spring-boot)
- **Language**: Java 21
- **Database**: MySQL 8.0 (Hosted on Aiven)
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security + JWT (JSON Web Tokens)
- **Deployment**: Render

### External Services
- **Google Maps API**: Geocoding (Address <-> Coordinates).
- **Firebase**: (Auxiliary) Used only for Firestore realtime mirrors and push notifications.

---

## 📂 Project Structure

### Backend (`/backend`)
The backend follows a standard **Layered Architecture**:

- **`controller/`**: Handles incoming HTTP requests (`@RestController`).
  - *Example*: `VendorController.java` defines endpoints like `GET /api/vendors`.
- **`service/`**: Contains business logic (`@Service`).
  - *Example*: `VendorService.java` calculates distance between user and vendor.
- **`repository/`**: Interfaces with the database (`@Repository`).
  - *Example*: `VendorRepository.java` extends `JpaRepository` for CRUD operations.
- **`model/`**: Defines the data entities (`@Entity`).
  - *Example*: `Vendor.java` maps to the `vendors` table in MySQL.
- **`config/`**: System configuration.
  - *Example*: `SecurityConfig.java` sets up JWT filters and CORS policies.

### Frontend (`/frontend`)
The frontend is structured using the **Next.js App Router**:

- **`app/`**: Routes and Pages.
  - `page.tsx`: Landing page.
  - `admin/`: Admin dashboard pages.
  - `vendor/`: Vendor dashboard pages.
- **`components/`**: Reusable React components.
  - `ui/`: Fundamental UI blocks (Buttons, Inputs).
  - `feature-specific`: Components like `VendorCard.tsx`.
- **`lib/`**: Utility functions and API clients.
  - `api.ts`: Centralized Axios/Fetch wrappers for communicating with the backend.

---

## 🔄 Key Data Flows

### 1. User Authentication (Cookie-Based JWT Session)
1. **Frontend**: User submits credentials (email/password).
2. **Backend**: `AuthController` verifies credentials against MySQL.
3. **Backend**: Generates a **JWT** containing `userId` and `role`.
4. **Backend**: Sends the token in the `sb_token` HttpOnly cookie with `SameSite` set to a restrictive value (`Strict` or `Lax` recommended) and `Secure` enabled in production.
5. **Frontend**: Uses credentialed requests (`withCredentials` / `credentials: 'include'`) so the `sb_token` cookie is sent automatically instead of storing the token in local storage.
6. **Backend**: `JwtRequestFilter` reads the cookie and validates the token before processing requests, while CORS is configured to allow only explicit origins and `Access-Control-Allow-Credentials: true`.

### 2. Vendor Search (Geolocation)
1. **Frontend**: Gets user's browser location (Lat/Lng).
2. **Frontend**: Calls `GET /api/vendors/search?lat=X&lng=Y&radius=5km`.
3. **Backend**:
   - `VendorService` queries MySQL for all active vendors.
   - Filters vendors based on Haversine distance formula.
   - Returns a sorted list of nearest vendors.

### 3. Order Placement (Conceptual)
1. **Frontend**: User adds `MenuItems` to cart.
2. **Frontend**: Submits order payload to `POST /api/orders`.
3. **Backend**:
   - Validates menu items exist and prices match.
   - Creates `Order` record in MySQL.
   - (Optional) Sends notification to Vendor via Firebase Cloud Messaging.

### 4. Realtime Vendor/Menu Updates
1. **Backend**: Writes vendors and menu items to MySQL first, with Firestore used as a real-time mirror rather than the source of truth.
2. **Backend**: Mirrors selected live state into Firestore using `RealTimeSyncService`. Firestore failures are handled with retry/backoff, dead-letter/error queue support, and alerting/monitoring so outages do not silently drop updates.
3. **Backend**: Accepts that dual-write introduces an eventual consistency window between MySQL and Firestore. The frontend may briefly see stale data, so critical reads should fall back to the backend API for authoritative results.
4. **Backend**: Uses ordering/consistency mitigations for rapid vendor/location updates, such as timestamps or sequence IDs, idempotent updates, or single-writer semantics to avoid lost or misordered data.
5. **Observability**: The system records metrics and logs for Firestore sync success, retry attempts, error queue events, and reconciliation activity.
6. **Recovery**: Out-of-sync repairs are supported through reconciliation tooling or manual resync processes that compare MySQL state to Firestore and correct drift.
7. **Frontend**: Subscribes to Firestore only for live UI updates such as menu availability and vendor status/location.

---

## 🔐 Security Measures

- **Passwords**: Hashed using **BCrypt** before storage.
- **CORS**: Strictly configured to allow requests only from the Vercel frontend domain.
- **Environment Variables**: Sensitive keys (DB passwords, JWT secrets) are injected at runtime, never hardcoded.
