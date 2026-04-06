# StreetBite Project Setup Guide

## 🛠️ Prerequisites

- **Java 21+** (Required for Spring Boot 3.3+)
- **Node.js 18+** (Required for Next.js 16)
- **MySQL 8.0+** (Local or Cloud like Aiven)
- **Maven 3.6+** (Optional, Maven Wrapper `mvnw` included)

## 🔐 Environment Setup

### 1. Backend Configuration (`backend`)

Set these environment variables in your shell, IDE run config, or `.env` tooling of your choice. The backend reads them directly from the environment.

#### Required Variables (Database)
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/streetbite?createDatabaseIfNotExist=true&ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
```

#### Required Variables (Auth)
```properties
JWT_SECRET=your_secure_random_secret_key_min_32_chars
JWT_EXPIRATION_MS=86400000
```

#### Required For Frontend Cookie Auth
```properties
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:4000
APP_ENV=development
COOKIE_SECURE=false
COOKIE_SAMESITE=Lax
```

#### Optional Variables (Firebase & Google Maps)
Required only if you want realtime mirrors, push notifications, or geocoding.
```properties
GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json
GOOGLE_GEOCODING_API_KEY=your_google_maps_api_key
```

### 2. Frontend Configuration (`frontend`)

Create a `.env.local` file in the `frontend/` directory.

```properties
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

---

## 🚀 Running Locally

### Step 1: Start Database (MySQL)
Ensure your MySQL server is running and the credentials in `.env` are correct.
- If using **Aiven**, use the service URI provided by Aiven.
- If using **Local**, ensure the service is active.

### Step 2: Start Backend
The application will automatically create necessary tables on the first run.

**Windows (PowerShell):**
```powershell
cd backend
.\mvnw spring-boot:run
```

**Mac/Linux:**
```bash
cd backend
./mvnw spring-boot:run
```
*Wait for "Started StreetBiteApplication" in the logs.*

### Step 3: Start Frontend

**New Terminal:**
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000)*

---

## ☁️ Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for instructions on deploying to **Vercel** and **Render**.

---

## 🛠️ Common Tasks

### Database Migration
The backend uses `spring.jpa.hibernate.ddl-auto=update` by default for development. This means Entity changes will automatically update the database schema.

### API Documentation
Once the backend is running, access Swagger UI at:
[http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)

### Troubleshooting

**Backend fails to start?**
1. **Check Java Version**: Run `java -version`. Must be 21+.
2. **Check Database**: Verify MySQL is running and credentials are correct.
3. **Port In Use**: Override `SERVER_PORT`, for example `SERVER_PORT=8082`.

**Frontend can't connect?**
1. Check `NEXT_PUBLIC_API_URL`.
2. Ensure Backend is running.
3. Check Browser Console for CORS errors and verify `ALLOWED_ORIGINS`, `FRONTEND_URL`, and cookie settings.

