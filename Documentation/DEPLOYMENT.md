# 🚀 Deployment Guide

This project is designed to be deployed on **Vercel (Frontend)** and **Render (Backend)**, with **Aiven** for the MySQL database.

## 🟢 Live Links

- **Frontend**: [StreetBite App](https://streetbitego.vercel.app/)
- **Backend API**: [StreetBite API](https://streetbite.onrender.com)
- **Health Check**: [API Health](https://streetbite.onrender.com/api/health)

---

## 🏗️ 1. Backend Deployment (Render)

Render is used to host the Spring Boot application (using Docker or native Maven build).

### Prerequisites
- **GitHub Repo** connected to your Render account.
- **Aiven MySQL Database** URL.

### Setup Steps
1. **New Web Service**: Click "New +" -> "Web Service" on the Render Dashboard.
2. **Connect Repo**: Select the StreetBite repository.
3. **Build Command**:
   ```bash
   cd backend && ./mvnw clean package -DskipTests
   ```
4. **Start Command**:
   ```bash
   java -jar backend/target/streetbite-backend-1.0.0.jar
   ```
5. **Environment Variables**:
   Add the following variables in the Render dashboard:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<HOST>:<PORT>/defaultdb?ssl-mode=REQUIRED` |
   | `SPRING_DATASOURCE_USERNAME` | `<AIVEN_USERNAME>` |
   | `SPRING_DATASOURCE_PASSWORD` | `<AIVEN_PASSWORD>` |
   | `JWT_SECRET` | (Your generated secure key, min 32 chars) |
   | `JWT_EXPIRATION_MS` | `86400000` (1 day) |
   | `GOOGLE_APPLICATION_CREDENTIALS` | (Optional: Path to Firebase key if uploaded, or base64 string if handling in code) |
   | `GOOGLE_GEOCODING_API_KEY` | (Your Google Cloud API Key) |

### Health Check
Render will check `https://streetbite.onrender.com/api/health` to confirm the service is running.

---

## 🌐 2. Frontend Deployment (Vercel)

Vercel is the optimal platform for Next.js applications.

### Setup Steps
1. **New Project**: Import the StreetBite repository in Vercel.
2. **Root Directory**: Select `frontend` as the root directory.
3. **Build Command**: Vercel automatically detects `next build`.
4. **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://streetbite.onrender.com/api` (Point to your Render Backend) |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | (Your Firebase Web Config) |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (Your Firebase Web Config) |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (Your Firebase Web Config) |

---

## 🗄️ 3. Database (Aiven MySQL)

1. Create a MySQL service in Aiven.
2. Copy the **Service URI**.
3. Use this URI to format the `SPRING_DATASOURCE_URL` for Render (see above).
4. Run the backend; Hibernate will automatically create the tables (`ddl-auto` is set to `update` by default for development).

---

## 🔄 CI/CD Pipeline

- **Frontend**: Vercel automatically deploys every commit to `main`.
- **Backend**: Render automatically deploys every commit to `main` (if Auto-Deploy is enabled).

---

## ⚠️ Important Considerations

- **Cold Starts**: Render's free tier spins down after inactivity. The first request might take 1-2 minutes.
- **CORS**: Ensure the Backend allows the Vercel domain in `CorsConfig.java`.
  ```java
  registry.addMapping("/**")
          .allowedOrigins("https://street-bite-frontend.vercel.app", "http://localhost:3000")
  ```
