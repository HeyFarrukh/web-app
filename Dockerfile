# Dockerfile

# ---- Base Stage ----
# Use a specific Node version matching your development environment
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
# This stage installs dependencies and is cached separately
FROM base AS deps
WORKDIR /app

# Copy only package files
COPY package.json package-lock.json* ./
# COPY yarn.lock* ./  # Uncomment if using Yarn

# Install dependencies using npm ci (clean install)
RUN npm ci
# RUN yarn install --frozen-lockfile # Uncomment if using Yarn

# ---- Builder Stage ----
# This stage builds the Next.js application
FROM base AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# --- Add step to restore .next/cache ---
# This COPY command will run inside the Docker build in Cloud Build.
# Cloud Build needs to have downloaded and extracted the cache before 'docker build' runs.
# We will mount or copy the cache into the build context later if needed,
# but often, just having node_modules cached is a huge win.
# Let's rely on the GCS step OUTSIDE docker build for .next/cache first.
# If needed, we could add: COPY --link .next/cache ./.next/cache

# Pass build-time environment variables
# Ensure NEXT_PUBLIC_ variables are available during the build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_LOGODEV_KEY
ARG NEXT_PUBLIC_GEMINI_API_KEY
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_GA_TRACKING_ID

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_LOGODEV_KEY=$NEXT_PUBLIC_LOGODEV_KEY
ENV NEXT_PUBLIC_GEMINI_API_KEY=$NEXT_PUBLIC_GEMINI_API_KEY
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID

# Build the Next.js application
RUN npm run build

# ---- Prune Dev Dependencies Stage ----
# (Optional but Recommended) Install production dependencies only
FROM base AS prod-deps
WORKDIR /app

COPY package.json package-lock.json* ./
# COPY yarn.lock* ./ # Uncomment if using Yarn

RUN npm ci --only=production
# RUN yarn install --production --frozen-lockfile # Uncomment if using Yarn

# ---- Runner Stage ----
# Final, minimal image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV PORT=8080 # Cloud Run sets PORT automatically, but good practice

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application assets
# If using Next.js default output:
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# If using Next.js standalone output (recommended for smaller images):
# 1. Enable standalone output in next.config.js: output: 'standalone'
# 2. Copy the standalone folder:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# Expose the port the app runs on (Next.js default is 3000)
EXPOSE 3000

# Set the user to a non-root user for security (alpine image has 'node' user)
USER node

# Start the application (Next.js default)
CMD ["node_modules/.bin/next", "start"]

# If using standalone output, the command might be different, often:
# CMD ["node", "server.js"]