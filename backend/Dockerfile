# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema and generate client
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start command with database migration
CMD ["sh", "-c", "npx prisma db push && node dist/main"]
