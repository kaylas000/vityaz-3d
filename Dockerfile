# Multi-stage build for production

# Stage 1: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

COPY backend/src ./src
RUN npm run build

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine
WORKDIR /app

# Install pm2 globally
RUN npm install -g pm2

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY frontend/package*.json ./frontend/

# Create public directory for serving static files
RUN mkdir -p /app/public
COPY --from=frontend-builder /app/frontend/dist /app/public

WORKDIR /app/backend

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start both services
CMD ["node", "dist/server.js"]

EXPOSE 3000
