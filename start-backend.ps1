# Quick script to start backend with API key
# Run this to start the backend server

Write-Host "=== Starting StreetBite Backend ===" -ForegroundColor Cyan
Write-Host ""

# Use existing env var or prompt user securely (do not hardcode keys)
if (-not $env:GOOGLE_GEOCODING_API_KEY -or $env:GOOGLE_GEOCODING_API_KEY -eq "") {
	function Get-SecureInputPlain($prompt) {
		$ss = Read-Host -AsSecureString $prompt
		if (-not $ss) { return "" }
		return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss))
	}
	$enteredKey = Get-SecureInputPlain "Enter Google Geocoding API key for backend (leave empty to skip)"
	if ($enteredKey) {
		$env:GOOGLE_GEOCODING_API_KEY = $enteredKey
		Write-Host "✅ Google Maps API key set (from input)" -ForegroundColor Green
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
	Write-Host "⚠️  Firebase key not found at: $firebaseKeyPath" -ForegroundColor Yellow
	Write-Host "   Backend will try to use default credentials" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend and start (use mvnw if present)
Set-Location backend
if (Test-Path ".\mvnw.cmd") {
	.\mvnw.cmd spring-boot:run
} else {
	mvn spring-boot:run
}

