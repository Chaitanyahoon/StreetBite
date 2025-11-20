# StreetBite Backend Startup Script
# Firebase credentials are in the backend folder

# Set Firebase credentials path
$env:GOOGLE_APPLICATION_CREDENTIALS="$PSScriptRoot\firebase-key.json"

# Set Java Home
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"

Write-Host "Starting StreetBite Backend..." -ForegroundColor Green
Write-Host "Firebase Credentials: $env:GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Yellow
Write-Host "Java Home: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""

# Start the backend
.\mvnw.cmd spring-boot:run
