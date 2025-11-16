# StreetBite Project Startup Script
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         StreetBite - Starting Application                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Replace hard-coded API key with environment-aware logic
if (-not $env:GOOGLE_GEOCODING_API_KEY -or $env:GOOGLE_GEOCODING_API_KEY -eq "") {
	# helper to read secure input and return plaintext
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

# Check for Firebase credentials (optional)
$firebaseKeyPath = Join-Path $PSScriptRoot "firebase-key.json"
if (Test-Path $firebaseKeyPath) {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $firebaseKeyPath
    Write-Host "✅ Firebase credentials found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firebase key not found (optional for basic testing)" -ForegroundColor Yellow
}

Write-Host ""

# Check if ports are available
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "⚠️  Port 8080 is already in use" -ForegroundColor Yellow
}

if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting Backend (Spring Boot)..." -ForegroundColor Cyan
Write-Host "   Location: backend" -ForegroundColor Gray

# Start backend
$backendPath = Join-Path $PSScriptRoot "backend"
# Child PowerShell will inherit parent env vars; prefer mvnw if present
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; if (Test-Path '.\mvnw.cmd') { .\mvnw.cmd spring-boot:run } else { mvn spring-boot:run }" -WindowStyle Normal

Write-Host ""
Write-Host "🚀 Starting Frontend (Next.js)..." -ForegroundColor Cyan
Write-Host "   Location: frontend" -ForegroundColor Gray

# Start frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "  📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  🔧 Backend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "  Wait 30-60 seconds for servers to start..." -ForegroundColor Yellow
Write-Host "  Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  Press any key to exit this window (servers will keep running)" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

