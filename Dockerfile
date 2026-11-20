# Stage 1: Build
# Pinned by tag + digest for reproducible builds; Dependabot keeps both current.
FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
WORKDIR /app

# Install pnpm (version pinned by "packageManager" in package.json).
# Node 25+ no longer bundles corepack, so install a pinned copy first.
RUN npm install -g corepack@0.36.0 && corepack enable

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build static assets
RUN pnpm build

# Stage 2: Serve
FROM caddy:2-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0
COPY --from=build /app/dist /srv
EXPOSE 80
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]