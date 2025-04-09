# Dockerfile (v10.1 - Remove --link)

# ---- Base Stage ----
    FROM node:18-alpine AS base
    WORKDIR /app
    
    # ---- Dependencies Stage ----
    FROM base AS deps
    WORKDIR /app
    
    # --- ADDED: Copy the restored .npm cache if it exists ---
    COPY .npm /root/.npm
    
    # Copy only package files
    COPY package.json package-lock.json* ./
    
    # --- MODIFIED: Use the cache directory ---
    RUN npm ci --cache /root/.npm --prefer-offline
    
    # ---- Builder Stage ----
    FROM base AS builder
    WORKDIR /app
    
    # Copy dependencies from the 'deps' stage
    COPY --from=deps /app/node_modules ./node_modules
    
    # --- ADDED: Copy the final .npm cache from deps stage ---
    COPY --from=deps /root/.npm /root/.npm
    
    # Copy the rest of the application code
    COPY . .
    
    # --- Restore .next/cache ---
    # REMOVED/COMMENTED OUT the --link flag
    COPY .next/cache ./.next/cache
    
    # Pass build-time environment variables
    ARG NEXT_PUBLIC_SUPABASE_URL
    # ... (rest of ARGs/ENVs) ...
    ARG NEXT_PUBLIC_GA_TRACKING_ID
    ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
    # ...
    ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID
    
    # Build the Next.js application
    RUN npm run build
    
    # ---- Prune Dev Dependencies Stage ----
    FROM base AS prod-deps
    WORKDIR /app
    
    # --- ADDED: Copy .npm cache ---
    COPY --from=builder /root/.npm /root/.npm
    
    COPY package.json package-lock.json* ./
    
    # --- MODIFIED: Use cache and omit dev ---
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