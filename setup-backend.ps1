# PowerShell script to set up backend environment variables
# Run this script before starting the backend

Write-Host "=== StreetBite Backend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if firebase-key.json exists
$firebaseKeyPath = Join-Path $PSScriptRoot "firebase-key.json"
if (-not (Test-Path $firebaseKeyPath)) {
    Write-Host "⚠️  Firebase service account key not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please download your service account key:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "2. Select project: street-bite-v1" -ForegroundColor White
    Write-Host "3. Settings (⚙️) → Project settings → Service accounts" -ForegroundColor White
    Write-Host "4. Click 'Generate new private key'" -ForegroundColor White
    Write-Host "5. Save the JSON file as: firebase-key.json in this directory" -ForegroundColor White
    Write-Host ""
    Write-Host "Expected location: $firebaseKeyPath" -ForegroundColor Gray
    Write-Host ""
    
    $continue = Read-Host "Do you want to continue without Firebase key? (y/n)"
    if ($continue -ne "y") {
        exit
    }
} else {
    Write-Host "✅ Found firebase-key.json" -ForegroundColor Green
    $env:GOOGLE_APPLICATION_CREDENTIALS = $firebaseKeyPath
    Write-Host "   Set GOOGLE_APPLICATION_CREDENTIALS = $firebaseKeyPath" -ForegroundColor Gray
}

# Check for Google Maps API key
Write-Host ""
$apiKey = Read-Host "Enter your Google Maps Geocoding API key (or press Enter to skip)"
if ($apiKey) {
    $env:GOOGLE_GEOCODING_API_KEY = $apiKey
    Write-Host "✅ Set GOOGLE_GEOCODING_API_KEY" -ForegroundColor Green
} else {
    Write-Host "⚠️  Google Maps API key not set (geocoding features will be limited)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Environment Variables Set ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the backend with:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "Or run this script and then start the backend in the same terminal." -ForegroundColor White
Write-Host ""

# Ask if user wants to start backend now
$startNow = Read-Host "Start backend now? (y/n)"
if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "Starting backend..." -ForegroundColor Cyan
    Set-Location backend
    .\mvnw.cmd spring-boot:run
}

