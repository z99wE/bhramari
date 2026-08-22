# ─── Stage 1: Build frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build -- --emptyOutDir

# ─── Stage 2: Build Python backend ──────────────────────────────────────────
FROM python:3.11-slim AS builder
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ─── Stage 3: Runtime image ─────────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Python deps
COPY --from=builder /install /usr/local
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Frontend static files (served by proxy)
COPY --from=frontend-builder /app/frontend/dist ./dist

# App code
COPY backend/main.py .
COPY backend/database.py .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
