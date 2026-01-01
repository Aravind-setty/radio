# Docker Hub Push Instructions

## Prerequisites
Before pushing to Docker Hub, you need:
1. Docker Hub account
2. Docker Hub username
3. Login to Docker Hub

## Step 1: Login to Docker Hub

```powershell
# Login to Docker Hub (you'll be prompted for password)
docker login
```

Enter your Docker Hub credentials when prompted.

## Step 2: Tag Images

Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```powershell
# Tag backend image
docker tag radio-backend:latest YOUR_DOCKERHUB_USERNAME/radio-backend:latest
docker tag radio-backend:latest YOUR_DOCKERHUB_USERNAME/radio-backend:v1.0.0

# Tag frontend image  
docker tag radio-frontend:latest YOUR_DOCKERHUB_USERNAME/radio-frontend:latest
docker tag radio-frontend:latest YOUR_DOCKERHUB_USERNAME/radio-frontend:v1.0.0
```

## Step 3: Push Images to Docker Hub

```powershell
# Push backend
docker push YOUR_DOCKERHUB_USERNAME/radio-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/radio-backend:v1.0.0

# Push frontend
docker push YOUR_DOCKERHUB_USERNAME/radio-frontend:latest
docker push YOUR_DOCKERHUB_USERNAME/radio-frontend:v1.0.0
```

## Quick Script

Save this as `push-to-hub.ps1` and run it:

```powershell
# Set your Docker Hub username
$DOCKER_USERNAME = "YOUR_DOCKERHUB_USERNAME"

# Login first
Write-Host "Logging into Docker Hub..." -ForegroundColor Cyan
docker login

if ($LASTEXITCODE -eq 0) {
    Write-Host "Login successful!" -ForegroundColor Green
    
    # Tag images
    Write-Host "`nTagging images..." -ForegroundColor Cyan
    docker tag radio-backend:latest $DOCKER_USERNAME/radio-backend:latest
    docker tag radio-backend:latest $DOCKER_USERNAME/radio-backend:v1.0.0
    docker tag radio-frontend:latest $DOCKER_USERNAME/radio-frontend:latest
    docker tag radio-frontend:latest $DOCKER_USERNAME/radio-frontend:v1.0.0
    
    # Push images
    Write-Host "`nPushing backend..." -ForegroundColor Cyan
    docker push $DOCKER_USERNAME/radio-backend:latest
    docker push $DOCKER_USERNAME/radio-backend:v1.0.0
    
    Write-Host "`nPushing frontend..." -ForegroundColor Cyan
    docker push $DOCKER_USERNAME/radio-frontend:latest
    docker push $DOCKER_USERNAME/radio-frontend:v1.0.0
    
    Write-Host "`nAll images pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "Login failed. Please check your credentials." -ForegroundColor Red
}
```

## Example with username "aravind"

```powershell
# Tag images
docker tag radio-backend:latest aravind/radio-backend:latest
docker tag radio-backend:latest aravind/radio-backend:v1.0.0
docker tag radio-frontend:latest aravind/radio-frontend:latest
docker tag radio-frontend:latest aravind/radio-frontend:v1.0.0

# Push images
docker push aravind/radio-backend:latest
docker push aravind/radio-backend:v1.0.0
docker push aravind/radio-frontend:latest
docker push aravind/radio-frontend:v1.0.0
```

## Verify on Docker Hub

After pushing, you can view your images at:
- https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/radio-backend
- https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/radio-frontend

## Pull Images (For Others)

Once pushed, anyone can pull your images:

```powershell
docker pull YOUR_DOCKERHUB_USERNAME/radio-backend:latest
docker pull YOUR_DOCKERHUB_USERNAME/radio-frontend:latest
```

## Notes

- Images are tagged with both `latest` and `v1.0.0` for version control
- The PostgreSQL and Redis images are official images, no need to push them
- Total size to upload: ~234MB (backend ~153MB, frontend ~81MB)
- Push time depends on your internet upload speed

## Troubleshooting

**Error: "denied: requested access to the resource is denied"**
- Make sure you're logged in: `docker login`
- Verify the username in your tag matches your Docker Hub username

**Error: "unauthorized: authentication required"**
- Run `docker login` again
- Check your Docker Hub credentials

**Slow upload:**
- Docker Hub free tier has rate limits
- Consider pushing overnight if on slow connection
- Images are compressed during upload
