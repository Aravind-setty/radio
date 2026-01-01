# Copilot Instructions for Live Radio Platform

## Architecture Overview

This is a **full-stack real-time radio platform** with three tiers:

- **Backend**: NestJS API + WebSocket server (port 3000)
- **Frontend**: React + Vite + Zustand (port 5173)
- **Data**: PostgreSQL + Redis (Redis used for Socket.IO adapter in distributed deployments)

The codebase uses a **modular NestJS structure** with feature modules: `auth`, `streams`, and `chat`. Each module owns its own controller, service, and DTO layer.

## Key Architectural Patterns

### Module Structure (`backend/src/`)

Each feature is a self-contained NestJS module:

- **AuthModule**: JWT-based auth with bcrypt password hashing, generates tokens with user ID embedded
- **StreamsModule**: CRUD operations for radio streams (supports both EXTERNAL URLs and BROWSER streaming)
- **ChatModule**: Real-time messaging via Socket.IO WebSockets, scoped per `streamId`

### Data Flow & Storage (`backend/prisma/schema.prisma`)

Three core models with strong relationships:

- `User`: email/username unique, role-based access (LISTENER/STREAMER/ADMIN)
- `Stream`: belongs to one User, has many ChatMessages, tracks broadcast state (`isActive`)
- `ChatMessage`: always scoped to a User + Stream pair (cascading deletes implied)

### Authentication & Authorization

- **REST endpoints**: JWT strategy via `@nestjs/passport` + `JwtAuthGuard` on controllers
- **WebSocket connections**: Separate `WsJwtGuard` validates JWT from socket handshake (not standard middleware)
- JWT payload contains `sub` (user ID) and `username`; extract via `request.user` in HTTP or `client.handshake` in WebSocket

### Real-Time Communication (Socket.IO)

- Chat Gateway (`backend/src/chat/chat.gateway.ts`) manages WebSocket rooms by `streamId`
- Events: `join_stream_chat` → rooms, `send_message` → broadcasts to room via `chatService`
- Redis adapter (`redis.adapter.ts`) enables multi-server deployments; defaults to in-memory if `REDIS_HOST` env var missing
- Validation: Messages stored via Prisma before emission; client JWT extracted from socket handshake auth

### Frontend State Management

- **Zustand stores**: `authStore` (token, user, isAuthenticated) and `streamStore` (active stream)
- **PrivateRoute wrapper** in App.tsx enforces authentication redirect
- **API client** (lib/api.ts) uses Axios with Authorization header auto-injection from authStore
- **Socket.IO client** connects with JWT token in auth option; reconnects on token refresh

## Development Workflows

### Setup & Database Initialization

```bash
# Backend setup (critical step)
cd backend
npx prisma generate      # Generate Prisma client
npx prisma db push       # Apply schema to PostgreSQL
npm run start:dev        # Watch mode with hot reload

# Frontend setup
cd frontend
npm run dev              # Vite dev server (port 5173)
```

### Docker-First Development

```bash
docker-compose up --build    # PostgreSQL + Redis + services
docker-compose down -v       # Clean slate
docker-compose logs -f backend  # Debug service
```

### Testing & Validation

- **Unit tests**: `npm test` in backend (Jest + `*.spec.ts` pattern)
- **E2E tests**: `npm run test:e2e` uses `test/jest-e2e.json`
- **Linting**: `npm run lint --fix` (ESLint + Prettier in both packages)
- **Type checking**: `tsc` runs at build time; no explicit check scripts needed

## Project-Specific Conventions

### Backend

- DTOs in `[module]/dto/` folder; use `class-validator` decorators for Pipe validation
- Services contain business logic; controllers only validate/serialize
- Prisma schema is the source of truth; migrations generated via `db push` (development) or `migrate deploy` (production)
- Custom errors: throw NestJS built-in exceptions (`BadRequestException`, `ConflictException`, `UnauthorizedException`)

### Frontend

- React functional components + hooks; no class components
- Tailwind CSS with `clsx` for conditional classes
- Pages in `src/pages/`, reusable UI components in `src/components/ui/`
- API responses mapped to Zustand stores immediately after fetch

### Cross-Module Communication

- **HTTP**: Backend exposes REST endpoints under `/api` prefix; frontend calls via Axios
- **WebSocket**: Chat Gateway broadcasts via room IDs; client emits events with structured payloads `{ streamId, content }`
- **State sync**: Stores on frontend are single source of truth for current user/stream; refresh via API calls on reconnection

## Critical Files to Know

- **[backend/src/app.module.ts](backend/src/app.module.ts)**: Module imports; where to register new services
- **[backend/prisma/schema.prisma](backend/prisma/schema.prisma)**: Data model; updates require `npx prisma db push`
- **[backend/src/chat/redis.adapter.ts](backend/src/chat/redis.adapter.ts)**: Socket.IO Redis integration; modify if scaling beyond single server
- **[frontend/src/store/authStore.ts](frontend/src/store/authStore.ts)**: Authentication state and token management
- **[backend/src/auth/jwt.strategy.ts](backend/src/auth/jwt.strategy.ts)**: JWT validation strategy for HTTP requests

## Environment Variables

Backend requires (`.env` or Docker Compose):

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://postgres:password@postgres:5432/radio_db`)
- `REDIS_HOST`, `REDIS_PORT` (optional; if provided, enables Redis adapter for Socket.IO)
- `JWT_SECRET`: Signing key for tokens
- `PORT`: Server port (default 3000)

Frontend uses Vite's `import.meta.env.VITE_*` convention for build-time constants.
