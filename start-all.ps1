# Complete startup script for StreetBite project
# This script starts both frontend and backend

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         StreetBite - Complete Startup Script             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Set Google Maps API Key
# Try to read from frontend/.env.local if available
if (Test-Path "frontend/.env.local") {
    $envContent = Get-Content "frontend/.env.local"
    foreach ($line in $envContent) {
        if ($line -match "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(.*)") {
            $env:GOOGLE_MAPS_API_KEY = $matches[1]
            $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = $matches[1]
            Write-Host "Google Maps API key loaded from .env.local" -ForegroundColor Green
            break
        }
    }
}

if (-not $env:GOOGLE_MAPS_API_KEY) {
    Write-Host "Warning: GOOGLE_MAPS_API_KEY not set. Maps may not work." -ForegroundColor Yellow
    # $env:GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE" 
    # $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE"
}

# Check for DB Password
if (-not $env:DB_PASSWORD) {
    Write-Host "DB_PASSWORD not set. Using default 'password' (INSECURE)" -ForegroundColor Yellow
    $env:DB_PASSWORD = "password"
}

# Check for Firebase credentials
$firebaseKeyPath = Join-Path $PSScriptRoot "firebase-key.json"
if (Test-Path $firebaseKeyPath) {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $firebaseKeyPath
    Write-Host "Firebase credentials found" -ForegroundColor Green
}
else {
    Write-Host "Firebase key not found" -ForegroundColor Yellow
    Write-Host "   Location: $firebaseKeyPath" -ForegroundColor Gray
    Write-Host "   Backend will start but Firestore features may not work" -ForegroundColor Yellow
}

Write-Host ""

# Ensure clean start by stopping existing processes
Write-Host "Checking for existing processes..." -ForegroundColor Cyan
if (Test-Path ".\stop-all.ps1") {
    .\stop-all.ps1
}

# Wait a moment for ports to free up
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Capture values to pass into background jobs
$geocodeKey = $env:GOOGLE_MAPS_API_KEY
$dbPassword = $env:DB_PASSWORD
$firebaseCred = if (Test-Path $firebaseKeyPath) { $firebaseKeyPath } else { $env:GOOGLE_APPLICATION_CREDENTIALS }

# Start backend in background
Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
    if ($using:firebaseCred) { $env:GOOGLE_APPLICATION_CREDENTIALS = $using:firebaseCred }
    if ($using:geocodeKey) { $env:GOOGLE_MAPS_API_KEY = $using:geocodeKey }
    if ($using:dbPassword) { $env:DB_PASSWORD = $using:dbPassword }

    Set-Location (Join-Path $using:PSScriptRoot "backend")
    if (Test-Path ".\mvnw.cmd") {
        .\mvnw.cmd spring-boot:run 2>&1
    }
    else {
        mvn spring-boot:run 2>&1
    }
}

# Start frontend in background
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    if ($using:geocodeKey) { $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = $using:geocodeKey }
    Set-Location (Join-Path $using:PSScriptRoot "frontend")
    # $env:NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080"
    npm run dev 2>&1
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Servers are starting in the background..." -ForegroundColor White
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8081" -ForegroundColor Green
Write-Host ""
Write-Host "  Waiting for servers to be ready..." -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Wait for servers to start
$maxWait = 60
$waited = 0
$backendReady = $false
$frontendReady = $false

while ($waited -lt $maxWait -and (-not $backendReady -or -not $frontendReady)) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    if (-not $backendReady) {
        $backendReady = Test-NetConnection -ComputerName localhost -Port 8081 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($backendReady) {
            Write-Host "Backend is ready!" -ForegroundColor Green
        }
    }
    
    if (-not $frontendReady) {
        $frontendReady = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($frontendReady) {
            Write-Host "Frontend is ready!" -ForegroundColor Green
        }
    }
    
    if ($waited % 10 -eq 0) {
        Write-Host "   Still waiting... ($waited seconds)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  StreetBite is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "  Open your browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  To stop servers, press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Keep script running and show logs
try {
    while ($true) {
        # Show recent backend logs
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Gray
        }
        
        # Show recent frontend logs
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Gray
        }
        
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Servers stopped" -ForegroundColor Green
}
