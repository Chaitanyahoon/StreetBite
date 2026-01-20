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
    FirebaseSDK -->|Push/Auth| FirebaseServices
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
- **Firebase**: (Auxiliary) Used for specific auth flows or notifications.

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

### 1. User Authentication (JWT)
1. **Frontend**: User submits credentials (email/password).
2. **Backend**: `AuthController` verifies credentials against MySQL.
3. **Backend**: Generates a **JWT** (JSON Web Token) containing `userId` and `role`.
4. **Frontend**: Stores JWT (e.g., in localStorage or Cookies).
5. **Subsequent Requests**: Frontend attaches `Authorization: Bearer <token>` header.
6. **Backend**: `JwtRequestFilter` validates the token before processing requests.

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

---

## 🔐 Security Measures

- **Passwords**: Hashed using **BCrypt** before storage.
- **CORS**: Strictly configured to allow requests only from the Vercel frontend domain.
- **Environment Variables**: Sensitive keys (DB passwords, JWT secrets) are injected at runtime, never hardcoded.
