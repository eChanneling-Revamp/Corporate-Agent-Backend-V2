# Stage 1: Builder
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies required for building (including devDependencies for tsc)
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "dist/server-simple.js"]
