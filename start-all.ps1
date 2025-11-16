# Complete startup script for StreetBite project
# This script starts both frontend and backend

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         StreetBite - Complete Startup Script             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Use existing env var or prompt the user (secure)
if (-not $env:GOOGLE_GEOCODING_API_KEY -or $env:GOOGLE_GEOCODING_API_KEY -eq "") {
	function Get-SecureInputPlain($prompt) {
		$ss = Read-Host -AsSecureString $prompt
		if (-not $ss) { return "" }
		return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss))
	}
	$enteredKey = Get-SecureInputPlain "Enter Google Geocoding API key (leave empty to skip)"
	if ($enteredKey) {
		$env:GOOGLE_GEOCODING_API_KEY = $enteredKey
		Write-Host "✅ Google Maps API key configured (from input)" -ForegroundColor Green
	} else {
		Write-Host "⚠️  Google Maps API key not set; geocoding features may be limited" -ForegroundColor Yellow
	}
} else {
	Write-Host "✅ Google Maps API key detected in environment" -ForegroundColor Green
}

# Check for Firebase credentials
$firebaseKeyPath = Join-Path $PSScriptRoot "firebase-key.json"
if (Test-Path $firebaseKeyPath) {
	$env:GOOGLE_APPLICATION_CREDENTIALS = $firebaseKeyPath
	Write-Host "✅ Firebase credentials found" -ForegroundColor Green
} else {
	Write-Host "⚠️  Firebase key not found" -ForegroundColor Yellow
	Write-Host "   Location: $firebaseKeyPath" -ForegroundColor Gray
	Write-Host "   Backend will start but Firestore features may not work" -ForegroundColor Yellow
}

Write-Host ""

# Check if ports are available
$port8080 = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
$port3000 = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($port8080) {
    Write-Host "⚠️  Port 8080 is already in use (backend may already be running)" -ForegroundColor Yellow
}

if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use (frontend may already be running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Capture values to pass into background jobs (Start-Job runs in a different process)
$geocodeKey = $env:GOOGLE_GEOCODING_API_KEY
$firebaseCred = if (Test-Path $firebaseKeyPath) { $firebaseKeyPath } else { $env:GOOGLE_APPLICATION_CREDENTIALS }

# Start backend in background
Write-Host "🚀 Starting Backend (Spring Boot)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
	# set env vars inside job process if provided
	if ($using:firebaseCred) { $env:GOOGLE_APPLICATION_CREDENTIALS = $using:firebaseCred }
	if ($using:geocodeKey) { $env:GOOGLE_GEOCODING_API_KEY = $using:geocodeKey }

	Set-Location $using:PSScriptRoot
	Set-Location backend
	if (Test-Path ".\mvnw.cmd") {
		.\mvnw.cmd spring-boot:run 2>&1
	} else {
		mvn spring-boot:run 2>&1
	}
}

# Start frontend in background
Write-Host "🚀 Starting Frontend (Next.js)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
	# frontend may need backend URL env vars but should not need the geocoding key
	Set-Location $using:PSScriptRoot
	Set-Location "frontend"
	# If you want to expose the backend URL explicitly you can set NEXT_PUBLIC_BACKEND_URL here:
	# $env:NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080"
	npm run dev 2>&1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Servers are starting in the background..." -ForegroundColor White
Write-Host ""
Write-Host "  📱 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  🔧 Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "  Waiting for servers to be ready..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
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
        $backendReady = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($backendReady) {
            Write-Host "✅ Backend is ready!" -ForegroundColor Green
        }
    }
    
    if (-not $frontendReady) {
        $frontendReady = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($frontendReady) {
            Write-Host "✅ Frontend is ready!" -ForegroundColor Green
        }
    }
    
    if ($waited % 10 -eq 0) {
        Write-Host "   Still waiting... ($waited seconds)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎉 StreetBite is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "  Open your browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  To stop servers, press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
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
} finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}

