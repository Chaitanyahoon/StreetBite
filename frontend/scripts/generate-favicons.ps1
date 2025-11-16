<#
Generate favicons and resized icons from a source image using ImageMagick.

Usage:
  1. Copy your source image into `frontend/public` as `streetbite-source.png` (or specify a different path).
  2. From project root run (PowerShell):
     cd frontend
     .\scripts\generate-favicons.ps1 -Source "public\streetbite-source.png"

Requirements:
  - ImageMagick (`magick` command) must be installed and on PATH.
  - This script creates: streetbite-16.png, streetbite-32.png, apple-icon.png (180x180), favicon.ico

#>
param(
    [string]$Source = "public\streetbite-source.png",
    [string]$OutDir = "public"
)

if (-not (Test-Path $Source)) {
    Write-Error "Source image not found: $Source. Please place your logo in frontend/public and set Source accordingly."
    exit 1
}

# Check for ImageMagick
$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    Write-Error "ImageMagick 'magick' command not found. Install ImageMagick and ensure 'magick' is on PATH."
    exit 2
}

Push-Location (Split-Path -Path $Source -Parent)

# Sizes to generate
$png16 = Join-Path $OutDir 'streetbite-16.png'
$png32 = Join-Path $OutDir 'streetbite-32.png'
$apple180 = Join-Path $OutDir 'apple-icon.png'
$favicon = Join-Path $OutDir 'favicon.ico'
$srcFull = Resolve-Path $Source

Write-Host "Generating 32x32 -> $png32"
magick convert "$srcFull" -resize 32x32^ -gravity center -extent 32x32 -background none "$png32"

Write-Host "Generating 16x16 -> $png16"
magick convert "$srcFull" -resize 16x16^ -gravity center -extent 16x16 -background none "$png16"

Write-Host "Generating apple 180x180 -> $apple180"
magick convert "$srcFull" -resize 180x180^ -gravity center -extent 180x180 -background none "$apple180"

# Create favicon.ico from 16x16 and 32x32 (Windows ICO can contain multiple sizes)
Write-Host "Generating favicon.ico -> $favicon"
magick convert "$png16" "$png32" "$apple180" -colors 256 "$favicon"

Write-Host "Done. Files created in: $OutDir"
Pop-Location
