# Dockerfile (v11 - For workspace build)

# Use a minimal base image matching the runtime needed
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy pre-built artifacts from the Cloud Build workspace context
COPY node_modules ./node_modules
COPY .next ./.next
COPY public ./public
COPY package.json ./package.json

EXPOSE 3000
USER node
CMD ["node_modules/.bin/next", "start"]