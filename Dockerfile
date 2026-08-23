# ─── Stage 1: Build frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN VITE_API_URL=https://bhramari-api-235116528765.us-central1.run.app npm run build -- --emptyOutDir

# ─── Stage 2: Runtime with nginx ────────────────────────────────────────────
FROM nginx:alpine
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
# Proxy API requests to backend
RUN echo 'location /api/ { proxy_pass http://bhramari-api-235116528765.us-central1.run.app; }' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
