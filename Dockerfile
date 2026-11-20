# Stage 1: Build
FROM node:lts-alpine AS build
WORKDIR /app

# Install pnpm (version pinned by "packageManager" in package.json)
RUN corepack enable

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build static assets
RUN pnpm build

# Stage 2: Serve
FROM caddy:alpine
COPY --from=build /app/dist /srv
EXPOSE 80
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]