# Live Radio Platform

A real-time radio streaming and chat application.

## Prerequisites

- Node.js (v18+)
- **Option 1 (Docker)**: Docker & Docker Compose
- **Option 2 (Local)**: PostgreSQL & Redis (Preferred) OR SQLite (Fallback configured)

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire application stack:

```powershell
# Build and start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Access the application:**
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

**Useful Docker commands:**
```powershell
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build backend
```

## 💻 Running Locally (Without Docker)

### ⚠️ Critical Setup Step

The automated setup of the database client failed due to environment restrictions. **You must run the following commands manually** to initialize the database:

```powershell
cd backend
npx prisma generate
npx prisma db push
```

If `npx` fails, try using `npm exec`:
```powershell
npm exec prisma generate
npm exec prisma db push
```

### Backend
```bash
cd backend
npm run start:dev
```
Server runs on `http://localhost:3000`.

### Frontend
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`.

## Features
- **Broadcasting**: Create a channel and "stream" (simulated via URL).
- **Listening**: Real-time audio playback state.
- **Chat**: Real-time messaging per stream.
- **Auth**: Secure JWT authentication.

## Troubleshooting

### Docker Issues

**Containers won't start:**
```powershell
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs
```

**Database connection errors:**
```powershell
# Ensure PostgreSQL is healthy
docker-compose ps postgres

# Restart backend after database is ready
docker-compose restart backend
```

**Port conflicts:**
- Ensure ports 80, 3000, 5432, and 6379 are not in use
- Modify ports in `docker-compose.yml` if needed

### Local Development Issues

**Prisma errors:**
- Ensure you've run `npx prisma generate` after any schema changes
- Run `npx prisma db push` to sync database schema
