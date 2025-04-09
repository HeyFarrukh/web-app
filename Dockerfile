# Dockerfile (Modified for .npm cache)

# ---- Base Stage ----
# Use a specific Node version matching your development environment
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
# This stage installs dependencies and is cached separately
FROM base AS deps
WORKDIR /app

# --- ADDED: Copy the restored .npm cache if it exists ---
# This relies on the GCS download/extract steps putting .npm in /workspace/.npm
COPY .npm /root/.npm

# Copy only package files
COPY package.json package-lock.json* ./

# --- MODIFIED: Use the cache directory ---
# Install dependencies using npm ci, pointing to the cache location
RUN npm ci --cache /root/.npm --prefer-offline

# ---- Builder Stage ----
# This stage builds the Next.js application
FROM base AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# --- ADDED: Copy the final .npm cache from deps stage (optional but good practice) ---
COPY --from=deps /root/.npm /root/.npm

# Copy the rest of the application code
COPY . .

# --- Restore .next/cache (Uncomment if using GCS cache for .next) ---
COPY --link .next/cache ./.next/cache

# Pass build-time environment variables
# ... (ARGS/ENVs unchanged) ...
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
# Modify to use cache as well
FROM base AS prod-deps
WORKDIR /app

# --- ADDED: Copy .npm cache ---
COPY --from=builder /root/.npm /root/.npm

COPY package.json package-lock.json* ./

# --- MODIFIED: Use cache and omit dev ---
RUN npm ci --omit=dev --cache /root/.npm --prefer-offline

# ---- Runner Stage ----
# ... (Runner stage mostly unchanged, copies from prod-deps and builder) ...
# Final, minimal image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
USER node
CMD ["node_modules/.bin/next", "start"]