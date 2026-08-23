FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev curl nginx supervisor && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY backend/main.py .
COPY backend/database.py .

# Build frontend
RUN apt-get update && apt-get install -y nodejs npm
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci && npm run build -- --emptyOutDir

# Configure nginx
RUN echo 'server { listen 8080; location /api/ { proxy_pass http://127.0.0.1:8081; } location / { root /app/frontend/dist; try_files $uri $uri/ /index.html; } }' > /etc/nginx/sites-enabled/default

# Start both nginx and uvicorn
RUN echo "[program:nginx]\ncommand=nginx -g 'daemon off;'\n[program:uvicorn]\ncommand=uvicorn main:app --host 0.0.0.0 --port 8081\nautostart=true\nautorestart=true" > /etc/supervisor/conf.d/bhramari.conf

EXPOSE 8080
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/bhramari.conf"]
