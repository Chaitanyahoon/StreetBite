# StreetBite Project Setup Guide

## 🔐 Environment Variables Setup

### Step 1: Copy `.env.example` to `.env.local`

**Windows (PowerShell):**
```powershell
cd c:\Users\patil\Downloads\final_project
Copy-Item .env.example .env.local
```

**Mac/Linux:**
```bash
cd final_project
cp .env.example .env.local
```

### Step 2: Edit `.env.local` and Add Your Credentials

Open `.env.local` in your editor and fill in:

1. **GOOGLE_APPLICATION_CREDENTIALS**
   - Path to your Firebase service account JSON file
   - Example: `C:\Users\patil\Downloads\final_project\firebase-key.json`

2. **GOOGLE_GEOCODING_API_KEY**
   - Your Google Maps API key
   - Example: `AIzaSyBBX6xmTuLo0IcBthGl4KeSFiIMIuBqwYA`

3. **NEXT_PUBLIC_BACKEND_URL**
   - Keep as `http://localhost:8080` for local dev

### Step 3: Verify `.env.local` is in `.gitignore`

✅ Already configured - `.env.local` will NOT be committed to Git

### Step 4: Load Environment Variables

The startup scripts will automatically load `.env.local` when you run:

```powershell
.\start-all.ps1
```

---

## Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **Maven 3.6+** (or use the included Maven wrapper)
- **Firebase Project** with Firestore enabled
- **Google Maps API Key** (for geocoding)

## Project Structure

```
final_project/
├── backend/              # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── ...
├── final_project/
│   ├── backend/          # Basic Spring Boot template (not used)
│   └── frontend/         # Next.js frontend
└── SETUP.md             # This file
```

## Backend Setup

### 1. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key"
6. Save the JSON file as `firebase-key.json` in a secure location

### 2. Set Environment Variables

Set the following environment variable before running the backend:

**Windows (PowerShell):**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\firebase-key.json"
$env:GOOGLE_GEOCODING_API_KEY="your-google-maps-api-key"
```

**Windows (CMD):**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\firebase-key.json
set GOOGLE_GEOCODING_API_KEY=your-google-maps-api-key
```

**Linux/Mac:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-key.json"
export GOOGLE_GEOCODING_API_KEY="your-google-maps-api-key"
```

Note: you can copy the example file at `.env.example` to create local env files:
- For frontend dev: create `final_project/frontend/.env.local` (or use the variables above).
- For project-level examples, use `c:\Users\patil\Downloads\final_project\.env.example`.

Security: `firebase-key.json` is ignored by the repository (see `.gitignore`). Do not commit service account keys to source control.

### 3. Update application.properties (Optional)

You can also set the Google Geocoding API key in `backend/src/main/resources/application.properties`:

```properties
google.geocoding.api.key=your-google-maps-api-key
```

### 4. Run the Backend

Navigate to the backend directory:

```bash
cd backend
```

**Using Maven Wrapper (Windows):**
```powershell
.\mvnw.cmd spring-boot:run
```

**Using Maven Wrapper (Linux/Mac):**
```bash
./mvnw spring-boot:run
```

**Using installed Maven:**
```bash
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

## Frontend Setup

### 1. Install Dependencies

Navigate to the frontend directory:

```bash
cd final_project/frontend
```

Install dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `final_project/frontend` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 3. Run the Frontend

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user/{userId}` - Get user by ID

### Vendors
- `POST /api/vendors/register` - Register a new vendor
- `GET /api/vendors/all` - Get all vendors
- `GET /api/vendors/search?lat={lat}&lng={lng}&radius={radius}` - Search vendors by location
- `GET /api/vendors/{vendorId}` - Get vendor by ID
- `PUT /api/vendors/{vendorId}` - Update vendor

## Firestore Collections

The backend uses the following Firestore collections:

- **users** - User profiles
- **vendors** - Vendor information
- **geocoding_cache** - Cached geocoding results

## Troubleshooting

### Backend Issues

1. **Firebase initialization error:**
   - Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
   - Verify the Firebase service account JSON file is valid

2. **Geocoding API errors:**
   - Check that `GOOGLE_GEOCODING_API_KEY` is set
   - Verify the API key has Geocoding API enabled

3. **Port already in use:**
   - Change the port in `application.properties`: `server.port=8081`

### Frontend Issues

1. **Cannot connect to backend:**
   - Ensure backend is running on `http://localhost:8080`
   - Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

2. **CORS errors:**
   - Backend CORS is configured to allow `http://localhost:3000`
   - Update `cors.allowed-origins` in `application.properties` if using a different port

## Development Workflow

1. Start the backend first: `cd backend && mvnw spring-boot:run`
2. Start the frontend in a new terminal: `cd final_project/frontend && npm run dev`
3. Open `http://localhost:3000` in your browser

## Next Steps

- Implement vendor dashboard features
- Add menu management
- Implement promotions system
- Add analytics tracking
- Set up admin dashboard

## Support

For issues or questions, check the code comments or create an issue in the repository.

