# Docker Hub Push Script for Live Radio Platform
# Save as: push-to-dockerhub.ps1
# Usage: .\push-to-dockerhub.ps1 -Username YOUR_DOCKERHUB_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Live Radio Platform - Docker Push  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to Docker Hub
Write-Host "[1/4] Logging into Docker Hub..." -ForegroundColor Yellow
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed. Please check your credentials." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Tag Backend Images
Write-Host "[2/4] Tagging backend images..." -ForegroundColor Yellow
docker tag radio-backend:latest "$Username/radio-backend:latest"
docker tag radio-backend:latest "$Username/radio-backend:v$Version"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to tag backend image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend tagged: $Username/radio-backend:latest" -ForegroundColor Green
Write-Host "✅ Backend tagged: $Username/radio-backend:v$Version" -ForegroundColor Green
Write-Host ""

# Step 3: Tag Frontend Images
Write-Host "[3/4] Tagging frontend images..." -ForegroundColor Yellow
docker tag radio-frontend:latest "$Username/radio-frontend:latest"
docker tag radio-frontend:latest "$Username/radio-frontend:v$Version"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to tag frontend image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend tagged: $Username/radio-frontend:latest" -ForegroundColor Green
Write-Host "✅ Frontend tagged: $Username/radio-frontend:v$Version" -ForegroundColor Green
Write-Host ""

# Step 4: Push Images
Write-Host "[4/4] Pushing images to Docker Hub..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  → Pushing backend:latest..." -ForegroundColor Cyan
docker push "$Username/radio-backend:latest"

Write-Host "  → Pushing backend:v$Version..." -ForegroundColor Cyan
docker push "$Username/radio-backend:v$Version"

Write-Host "  → Pushing frontend:latest..." -ForegroundColor Cyan
docker push "$Username/radio-frontend:latest"

Write-Host "  → Pushing frontend:v$Version..." -ForegroundColor Cyan
docker push "$Username/radio-frontend:v$Version"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  ✅ All images pushed successfully!  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Your images are now available at:" -ForegroundColor Cyan
Write-Host "  → https://hub.docker.com/r/$Username/radio-backend" -ForegroundColor White
Write-Host "  → https://hub.docker.com/r/$Username/radio-frontend" -ForegroundColor White
Write-Host ""

Write-Host "To pull these images on another machine:" -ForegroundColor Cyan
Write-Host "  docker pull $Username/radio-backend:latest" -ForegroundColor White
Write-Host "  docker pull $Username/radio-frontend:latest" -ForegroundColor White
Write-Host ""
