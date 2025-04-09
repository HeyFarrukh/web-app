# Dockerfile (v10.2 - Handle missing .npm on first run)

# ---- Base Stage ----
    FROM node:18-alpine AS base
    WORKDIR /app
    
    # ---- Dummy stage for missing cache ---
    FROM base AS dummy_npm_cache
    RUN mkdir -p /root/.npm
    
    # ---- Dependencies Stage ----
    FROM base AS deps
    WORKDIR /app
    
    # --- MODIFIED: Copy the restored .npm cache, fall back to dummy ---
    # Try copying from build context first (where GCS cache lands)
    # If it fails (e.g., first run), copy from the dummy stage
    COPY --from=dummy_npm_cache /root/.npm /root/.npm
    COPY .npm /root/.npm
    
    # Copy only package files
    COPY package.json package-lock.json* ./
    
    # --- Use the cache directory ---
    RUN npm ci --cache /root/.npm --prefer-offline
    
    # ---- Builder Stage ----
    FROM base AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY --from=deps /root/.npm /root/.npm # Copy potentially populated cache
    
    COPY . .
    
    # --- Dummy stage for missing .next cache ---
    FROM base AS dummy_next_cache
    RUN mkdir -p /app/.next/cache
    
    # --- MODIFIED: Copy .next/cache, fall back to dummy ---
    COPY --from=dummy_next_cache /app/.next/cache /app/.next/cache
    COPY .next/cache ./.next/cache
    
    
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
    FROM base AS prod-deps
    WORKDIR /app
    
    COPY --from=builder /root/.npm /root/.npm # Copy cache from builder
    COPY package.json package-lock.json* ./
    
    RUN npm ci --omit=dev --cache /root/.npm --prefer-offline
    
    # ---- Runner Stage ----
    # ... (Runner stage unchanged) ...
    FROM node:18-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=prod-deps /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/package.json ./package.json
    EXPOSE 3000
    USER node
    CMD ["node_modules/.bin/next", "start"]