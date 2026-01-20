# StreetBite Project Setup Guide

## 🛠️ Prerequisites

- **Java 21+** (Required for Spring Boot 3.3+)
- **Node.js 18+** (Required for Next.js 16)
- **MySQL 8.0+** (Local or Cloud like Aiven)
- **Maven 3.6+** (Optional, Maven Wrapper `mvnw` included)

## 🔐 Environment Setup

### 1. Backend Configuration (`backend`)

Create a `.env` file in the `backend/` directory or set these environment variables in your IDE/Terminal.

#### Required Variables (Database)
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/streetbite?createDatabaseIfNotExist=true&ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
```

#### Required Variables (Security)
```properties
JWT_SECRET=your_secure_random_secre_key_min_32_chars
JWT_EXPIRATION_MS=86400000
```

#### Optional Variables (Firebase & Google Maps)
Required only if you want to use Firebase Auth features or Geocoding.
```properties
GOOGLE_APPLICATION_CREDENTIALS=classpath:firebase-key.json
GOOGLE_GEOCODING_API_KEY=your_google_maps_api_key
```

### 2. Frontend Configuration (`frontend`)

Create a `.env.local` file in the `frontend/` directory.

```properties
NEXT_PUBLIC_API_URL=http://localhost:8080/api
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
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### Troubleshooting

**Backend fails to start?**
1. **Check Java Version**: Run `java -version`. Must be 21+.
2. **Check Database**: Verify MySQL is running and credentials are correct.
3. **Port In Use**: If port 8080 is taken, add `server.port=8081` to `application.properties`.

**Frontend can't connect?**
1. Check `NEXT_PUBLIC_API_URL`.
2. Ensure Backend is running.
3. Check Browser Console for CORS errors (configure allowed origins in Backend).

