# 🐳 Docker Deployment - Live Radio Platform

## ✅ Status: Successfully Running!

**Deployment Time:** 2026-01-01 22:10 IST  
**All Services:** ✅ Healthy and Running

---

## 📦 Running Services

### 1. **PostgreSQL Database** 🗄️
- **Image:** `postgres:15-alpine`
- **Status:** ✅ Healthy
- **Port:** `5433:5432`
- **Database:** `radio_db`
- **User:** `postgres`
- **Password:** `password`

### 2. **Redis Cache** 🔴
- **Image:** `redis:7-alpine`
- **Status:** ✅ Healthy
- **Port:** `6379:6379`
- **Use:** Session storage & caching

### 3. **Backend API** 🚀
- **Status:** ✅ Running
- **Port:** `3000:3000`
- **API URL:** http://localhost:3000
- **Environment:** Production
- **Features:**
  - REST API endpoints
  - WebSocket for real-time chat
  - WebRTC signaling server
  - JWT authentication

### 4. **Frontend Web App** 🌐
- **Status:** ✅ Running
- **Port:** `80:80`
- **App URL:** **http://localhost**
- **Features:**
  - React SPA
  - Real-time audio streaming
  - Live chat interface
  - Stream management dashboard

---

## 🌐 Access URLs

### Main Application:
```
🌐 Frontend: http://localhost
📡 Backend API: http://localhost:3000
💬 WebSocket: ws://localhost:3000
```

### Database Connections (for debugging):
```
📊 PostgreSQL: localhost:5433
   Database: radio_db
   Username: postgres
   Password: password

🔴 Redis: localhost:6379
```

---

## 🎯 Quick Access

### Open the Application:
1. **Browser:** Open http://localhost
2. **Register** a new account or **Login**
3. **Start Broadcasting** or **Listen to streams**

### Health Checks:
```powershell
# Check all services
docker compose ps

# Check backend health
curl http://localhost:3000

# Check frontend
curl http://localhost
```

---

## 🛠️ Docker Commands

### View Status:
```powershell
# List all containers
docker compose ps

# View logs (all services)
docker compose logs

# View logs (specific service)
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
docker compose logs redis
```

### Follow Logs (Live):
```powershell
# All services
docker compose logs -f

# Only backend
docker compose logs -f backend

# Only frontend
docker compose logs -f frontend
```

### Restart Services:
```powershell
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Stop Services:
```powershell
# Stop all (keeps data)
docker compose stop

# Stop and remove (keeps volumes)
docker compose down

# Stop and remove everything (INCLUDING DATA!)
docker compose down -v
```

### Rebuild After Code Changes:
```powershell
# Rebuild and restart
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## 📁 Docker Configuration Files

### Created/Updated Files:
```
✅ docker-compose.yml           - Service orchestration
✅ backend/Dockerfile            - Backend container build
✅ frontend/Dockerfile           - Frontend container build
✅ backend/.env.docker          - Backend environment variables
```

### Environment Variables (backend/.env.docker):
```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/radio_db
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost
```

---

## 🔍 Troubleshooting

### Container Won't Start:
```powershell
# Check logs for errors
docker compose logs backend

# Check container status
docker compose ps

# Restart specific service
docker compose restart backend
```

### Database Connection Issues:
```powershell
# Check PostgreSQL is healthy
docker compose ps postgres

# Access database directly
docker compose exec postgres psql -U postgres -d radio_db

# View database logs
docker compose logs postgres
```

### Port Already in Use:
```powershell
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5433
netstat -ano | findstr :80

# Stop conflicting service or change ports in docker-compose.yml
```

### Reset Everything:
```powershell
# Stop and remove all containers
docker compose down

# Remove all data (CAUTION: This deletes database!)
docker compose down -v

# Start fresh
docker compose up -d --build
```

---

## 💾 Data Persistence

### Volumes:
Docker uses named volumes to persist data:

```yaml
postgres_data:  # PostgreSQL database files
redis_data:     # Redis cache data
```

### Backup Database:
```powershell
# Backup
docker compose exec postgres pg_dump -U postgres radio_db > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres radio_db < backup.sql
```

---

## 🔧 Development vs Production

### Current Setup: Production Mode
- ✅ Optimized builds
- ✅ Production dependencies only
- ✅ No hot reload
- ✅ Nginx for frontend

### For Development:
Use `npm run dev` in separate terminals instead:
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Development advantages:
- ✨ Hot module reload
- 🐛 Better debugging
- ⚡ Faster iteration
- 📝 Source maps

---

## 📊 Resource Usage

### Expected Resource Usage:
```
PostgreSQL: ~50 MB RAM, ~1% CPU
Redis:      ~10 MB RAM, ~0.5% CPU
Backend:    ~150 MB RAM, ~5% CPU
Frontend:   ~20 MB RAM (Nginx), ~1% CPU

Total:      ~230 MB RAM, ~7% CPU (idle)
           ~300 MB RAM, ~15% CPU (active streaming)
```

### Check Resource Usage:
```powershell
# Docker stats
docker stats

# Specific container
docker stats radio_backend
```

---

## 🚀 Production Deployment Notes

### Before Production:
1. **Change JWT Secret:**
   - Update `JWT_SECRET` in `.env.docker`
   - Use a strong, random key

2. **Change Database Password:**
   - Update in `docker-compose.yml`
   - Update in `backend/.env.docker`

3. **Configure CORS:**
   - Update `CORS_ORIGIN` to your domain
   - Example: `https://yourdomain.com`

4. **Use HTTPS:**
   - Add reverse proxy (Nginx/Caddy)
   - Get SSL certificate (Let's Encrypt)

5. **Environment Variables:**
   - Use Docker secrets or env files
   - Never commit sensitive data to git

6. **Database Backups:**
   - Set up automated backups
   - Test restore procedure

---

## ✅ Verification Checklist

- [x] PostgreSQL running and healthy
- [x] Redis running and healthy
- [x] Backend API responding
- [x] Frontend serving pages
- [x] Database migrations applied
- [x] Environment variables configured
- [x] Volumes created for persistence
- [x] Health checks passing
- [x] Inter-service networking working

---

## 📞 Quick Reference

### Start Everything:
```powershell
docker compose up -d
```

### Stop Everything:
```powershell
docker compose down
```

### View Logs:
```powershell
docker compose logs -f
```

### Restart Service:
```powershell
docker compose restart backend
```

### Access Application:
```
🌐 http://localhost
```

---

## 🎉 You're All Set!

Your Live Radio Platform is now running in Docker!

**Next Steps:**
1. Open http://localhost in your browser
2. Register a new account
3. Create a stream and start broadcasting
4. Open an incognito window and test listening
5. Try the chat feature

**All the fixes we implemented earlier are active:**
- ✅ Stream deletion works properly
- ✅ Broadcasting connects dynamically
- ✅ Microphone errors are user-friendly

---

**Happy Broadcasting! 🎙️📻**

*For detailed testing instructions, see `TESTING_GUIDE.md`*
*For code changes, see `CODE_CHANGES.md`*
*For complete fixes report, see `FIXES_SUMMARY.md`*
