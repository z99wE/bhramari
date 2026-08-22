# 🐝 BHRAMARI — The Always-On Multi-Lingual Autonomous Hive Mind

> Inspired by Goddess Bhramari — the Hindu deity of bees and boundless, buzzing energy.
> A synchronized hive mind of specialized micro-agents that evaluate logic, security, linguistic nuance, and performance concurrently.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BHRAMARI ARCHITECTURE                          │
│                                                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐    React 19 + TS +     │
│  │  Web     │   │ Mobile   │   │ Google   │    Tailwind + Framer   │
│  │  Client  │   │  (PWA)   │   │ ADK      │    Motion Animations   │
│  │  Vite    │   │          │   │ Voice    │                         │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                        │
│       │              │              │                               │
│       └──────────────┼──────────────┘                               │
│                      │                                               │
│              ┌───────▼────────┐                                      │
│              │  Cloud Armor   │  ← DDoS + WAF                        │
│              │  + CDN         │  ← Edge caching                      │
│              └───────┬────────┘                                      │
│                      │                                               │
│         ┌────────────▼────────────┐                                  │
│         │    Cloud Run (API)     │  ← FastAPI + Uvicorn              │
│         └────────────┬────────────┘                                  │
│                      │                                               │
│    ┌─────────────────┼─────────────────┐                             │
│    │                 │                 │                              │
│ ┌──▼──┐       ┌─────▼─────┐      ┌────▼────┐                        │
│ │Auth  │       │ Hive Mind │      │ Swarm   │                         │
│ │Svc   │       │(Vertex AI)│      │ Pattern │                         │
│ └──┬──┘       └─────┬─────┘      └────┬────┘                        │
│    │                │                 │                               │
│    │        ┌───────▼─────────────────▼──────┐                       │
│    │        │         Pub/Sub                │  ← Event streaming     │
│    │        └───────┬─────────────────┬──────┘                       │
│    │                │                 │                                │
│    │        ┌───────▼──────┐   ┌──────▼──────┐                       │
│    │        │ Cloud Tasks  │   │ Memorystore  │  ← Redis cache        │
│    │        │ (Async jobs) │   │ (Sessions)   │                       │
│    │        └───────┬──────┘   └──────┬──────┘                       │
│    │                │                 │                                │
│    │        ┌───────▼─────────────────▼──────┐                       │
│    │        │      Cloud SQL                   │  ← PostgreSQL        │
│    │        │    + Firestore                    │  ← NoSQL (future)   │
│    │        └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Bhramari/
├── frontend/                  # React 19 + TypeScript + Tailwind + Framer Motion
│   ├── src/
│   │   ├── components/       # GlassCard, Header, Hero, SwarmStream, ResultsPanel, etc.
│   │   ├── hooks/            # useAuth, useSwarm, useLeaderboard
│   │   ├── services/         # API client (fetch-based)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main app with tab navigation
│   │   └── index.css         # Astryx design system
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── main.py               # FastAPI app — all routes, models, agents
│   └── requirements.txt      # Python deps (FastAPI, SQLAlchemy, Redis, etc.)
│
├── infra/
│   ├── deploy/               # Bash scripts for GCP setup
│   │   ├── setup.sh          # Enable all APIs
│   │   ├── sql.sh            # Cloud SQL provisioner
│   │   ├── redis.sh          # Memorystore provisioner
│   │   ├── events.sh         # Pub/Sub topics + Cloud Tasks
│   │   ├── secrets.sh        # Secret Manager
│   │   └── analytics.sh      # Spanner + BigQuery
│   └── terraform/            # IaC for full stack deployment
│       ├── main.tf
│       ├── variables.tf
│       └── state.tf
│
├── Dockerfile                # Multi-stage: frontend build → Python runtime
├── cloudbuild.yaml           # CI/CD: test → build → push → deploy
├── .dockerignore
└── README.md
```

---

## Quick Start

### Local Development

```bash
cd ~/Documents/Bhramari

# 1. Backend (FastAPI on port 8000)
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Frontend (Vite dev server on port 3000)
cd frontend && npm install && npm run dev
```

Open **http://localhost:3000** — the Vite proxy automatically forwards `/api` calls to the backend.

### Test the API

```bash
# Health check
curl http://localhost:8000/health

# Register & login
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@bhramari.dev","username":"hivehero"}'

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@bhramari.dev","username":"hivehero"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# Submit code for swarm review
curl -X POST http://localhost:8000/api/v1/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Review",
    "source_language": "python",
    "content": "def get_user(user_id):\n    query = f\"SELECT * FROM users WHERE id = {user_id}\"\n    return db.execute(query)"
  }'
```

---

## Deploy to GCP

### 1. Initialize Infrastructure

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
gcloud config set project $PROJECT_ID

# Enable all 20 GCP products
bash infra/deploy/setup.sh

# Create Cloud SQL, Redis, Pub/Sub, Spanner
bash infra/deploy/sql.sh
bash infra/deploy/redis.sh
bash infra/deploy/events.sh
bash infra/deploy/secrets.sh
bash infra/deploy/analytics.sh
```

### 2. Terraform (optional — full IaC)

```bash
cd infra/terraform
terraform init
terraform plan -var="project_id=$PROJECT_ID"
terraform apply -var="project_id=$PROJECT_ID"
```

### 3. Build & Deploy via Cloud Build

```bash
# Configure Artifact Registry
gcloud artifacts repositories create bhramari-repo \
  --repository-format=docker \
  --location=$REGION --project=$PROJECT_ID

# Trigger CI/CD pipeline
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_PROJECT_ID=$PROJECT_ID
```

### 4. Manual Deploy (faster for hackathon)

```bash
# Build multi-stage Docker image
docker build -t gcr.io/$PROJECT_ID/bhramari-api:latest .
gcloud auth configure-docker
docker push gcr.io/$PROJECT_ID/bhramari-api:latest

# Deploy to Cloud Run
gcloud run deploy bhramari-api \
  --image gcr.io/$PROJECT_ID/bhramari-api:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://postgres:YOUR_PASS@/${INSTANCE_CONN}/bhramari",\
REDIS_URL="rediss://${REDIS_HOST}:${REDIS_PORT}",GOOGLE_CLOUD_PROJECT=$PROJECT_ID
```

---

## Design System — Astryx Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--amber` | `#f59e0b` | Primary accent, CTAs, honeycomb grid |
| `--cyan` | `#06b6d4` | Secondary accent, agent labels |
| `--purple` | `#8b5cf6` | Tertiary accent, Colony tab |
| `--bg-dark` | `#0a0a0f` | Page background |
| `--bg-surface` | `#12121a` | Card backgrounds |
| `glass` | `rgba(255,255,255,0.03)` + `blur(20px)` | All card surfaces |
| `neon-text` | `linear-gradient(135deg, amber→cyan→purple)` | Headlines, logo |

**Micro-interactions:**
- `swarm-pulse` — pulsing opacity/scale on active nodes
- `finding-slide-in` — spring-animated card entry from right
- `agent-active` — concentric ring pulse on live agent dots
- `shimmer` — loading skeleton gradient sweep

---

## 20 GCP Products Used

| # | Product | Role |
|---|---------|------|
| 1 | **Cloud Run** | Auto-scaling serverless containers (backend + future PWA) |
| 2 | **Vertex AI** | Multi-agent reasoning pipeline (Gemini-powered swarm) |
| 3 | **Google ADK** | Voice action integration hooks |
| 4 | **Cloud Translation** | Real-time 50+ language translation |
| 5 | **Speech-to-Text** | Vernacular voice prompt transcription |
| 6 | **Text-to-Speech** | Natural voice synthesis for narration |
| 7 | **Cloud SQL (PostgreSQL)** | Relational DB — users, submissions, findings |
| 8 | **Firestore** | Real-time sync for live UI (future) |
| 9 | **Memorystore (Redis)** | High-speed cache for pattern matching |
| 10 | **Pub/Sub** | Event bus coordinating swarm agents |
| 11 | **Cloud Tasks** | Async execution for long-running calculations |
| 12 | **Spanner** | Globally consistent leaderboard store |
| 13 | **BigQuery** | Analytics and cross-sectional trend analysis |
| 14 | **Cloud Armor** | Edge WAF filtering injection vectors |
| 15 | **Cloud CDN** | Ultra-low latency edge caching for React bundle |
| 16 | **Secret Manager** | Zero-secret-store for JWT keys and DB passwords |
| 17 | **Cloud Build** | Automated CI/CD pipeline |
| 18 | **Artifact Registry** | Container image repository |
| 19 | **Cloud Logging & Monitoring** | Live metric dashboards |
| 20 | **Cloud Trace** | End-to-end latency tracing |

---

## Key Technical Decisions

1. **Single-page React 19 + Vite** — no build step complexity, hot reload, instant FE dev
2. **FastAPI async backend** — native asyncio for SSE streaming without threading
3. **Polling over raw SSE in JS** — simpler error handling; backend still streams via Server-Sent Events internally
4. **SQLite for local dev → PostgreSQL on GCP** — auto-detected via `DATABASE_URL` env var
5. **Redis optional** — gracefully degrades to no-cache if Memorystore unavailable
6. **Zero secrets in env** — production uses Secret Manager with IAM-bound service account
7. **Glassmorphism + Tailwind** — no custom CSS framework bloat, pure utility classes

---

## File Reference

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Root component — tab nav, state orchestration |
| `frontend/src/components/Hero.tsx` | Code editor + agent indicators + submit button |
| `frontend/src/components/SwarmStream.tsx` | Animated finding cards with severity coloring |
| `frontend/src/components/ResultsPanel.tsx` | Score ring, strengths, growth tip, findings grid |
| `frontend/src/components/VoicePanel.tsx` | Voice-first demo with waveform visualization |
| `frontend/src/hooks/useSwarm.ts` | Polling hook with deduplication |
| `infra/terraform/main.tf` | Full Terraform IaC for GCP stack |
| `cloudbuild.yaml` | CI/CD: test → build → push → deploy |
| `Dockerfile` | Multi-stage: Node builder → Python slim runtime |

---

> **You don't need perfect. You need impressive.**
>
> **Astryx UI** = glassmorphism + amber/cyan honeycomb grid + pulsing nodes
> **Bhramari name** = Goddess of bees, synchronized hive intelligence
> **20 GCP products** = you're showing the FULL Google Cloud stack
> **Voice integration** = the killer demo differentiator

Now go make the hive buzz. 🐝
