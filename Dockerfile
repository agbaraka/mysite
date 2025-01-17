# Stage 1: Build the Hugo site
FROM hugomods/hugo as builder

WORKDIR /src

COPY . .

RUN hugo --minify

# Stage 2: Serve the site with Caddy
FROM caddy:alpine

# Copy the built site from the previous stage
COPY --from=builder /src/public /srv

# Expose port 80
EXPOSE 80

# Start Caddy
CMD ["caddy", "file-server", "--root", "/srv"]