# Deployment Guide

StreetBite is designed for:
- Frontend on Vercel
- Backend on Render
- MySQL on Aiven
- Optional Firebase for realtime mirrors and push notifications

## Deployment Model

- MySQL is the source of truth for application data.
- The backend issues the `sb_token` auth cookie.
- The frontend talks to the backend with credentialed cross-origin requests.
- Firebase is auxiliary only:
  - Firestore mirrors live vendor/menu state
  - FCM handles push notifications

## Backend Deployment On Render

Render runs the Spring Boot backend.

### Service Configuration

- Root directory: `backend`
- Build command:

```bash
mvn clean package -DskipTests
```

- Start command:

```bash
java -jar target/streetbite-backend-1.0.0.jar
```

### Required Render Environment Variables

```env
SERVER_PORT=8081

SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DB>?ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=<AIVEN_USERNAME>
SPRING_DATASOURCE_PASSWORD=<AIVEN_PASSWORD>

JWT_SECRET=<random-32-plus-char-secret>
JWT_EXPIRATION_MS=86400000

FRONTEND_URL=https://streetbitego.vercel.app
ALLOWED_ORIGINS=https://streetbitego.vercel.app

APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=None
```

If you use Vercel preview deployments, add them to `ALLOWED_ORIGINS` as a comma-separated list.

Example:

```env
ALLOWED_ORIGINS=https://streetbitego.vercel.app,https://streetbite-git-feature-branch.vercel.app
```

### Optional Backend Variables

```env
GOOGLE_GEOCODING_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-admin.json

SPRING_MAIL_HOST=
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=
SPRING_MAIL_PASSWORD=
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS_ENABLE=true
SPRING_MAIL_SMTP_STARTTLS_REQUIRED=true
```

### Health Check

Use:

```text
/api/health
```

## Frontend Deployment On Vercel

Vercel runs the Next.js frontend.

### Project Configuration

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: default `next build`

### Required Vercel Environment Variables

```env
NEXT_PUBLIC_API_URL=https://streetbite.onrender.com/api
```

### Optional Firebase Frontend Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

Without the Firebase values, the app can still use normal backend/API flows, but realtime Firestore listeners and push notifications will be disabled.

## Aiven MySQL

1. Create the MySQL service in Aiven.
2. Get the host, port, database name, username, and password.
3. Build `SPRING_DATASOURCE_URL` for Render from those values.
4. Keep SSL enabled for production connections.

Example:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-12345.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
```

## Cookie And CORS Behavior

This deployment depends on cross-origin cookies between Vercel and Render.

Production requirements:
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=None`
- `ALLOWED_ORIGINS` must include the real Vercel origin
- frontend requests must use credentials

The backend CORS source of truth is:
- `backend/src/main/java/com/streetbite/config/SecurityConfig.java`
- `backend/src/main/java/com/streetbite/config/AllowedOrigins.java`

Cookie behavior is resolved by:
- `backend/src/main/java/com/streetbite/config/CookieSettings.java`

## Firebase In Production

Firebase is optional.

Only configure it when you need:
- realtime vendor/menu updates through Firestore
- web push notifications through FCM

Do not treat Firebase as the database of record. MySQL remains authoritative.

## CI/CD

- Vercel deploys the frontend on pushes to the configured branch.
- Render deploys the backend on pushes to the configured branch if auto-deploy is enabled.

## Operational Notes

- Render free-tier cold starts can delay the first backend response.
- If `/api/auth/me` returns `401` for a signed-in user in production, first check cookie attributes and `ALLOWED_ORIGINS`.
- If realtime UI features fail but CRUD still works, check Firebase configuration separately from MySQL and auth.

## Related Docs

- `Documentation/DEVELOPMENT_SETUP.md`
- `Documentation/FIREBASE_SETUP.md`
- `Documentation/DATA_STORAGE_AND_REALTIME.md`
