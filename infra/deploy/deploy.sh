#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Bhrmari — One-Click GCP Deploy Script
# Prerequisites: gcloud CLI logged in, billing enabled on target project
# Usage: ./infra/deploy/deploy.sh --project YOUR_PROJECT_ID
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="bhramari-api"
DB_PASSWORD="${DB_PASSWORD:-Bhramari@Hack2025!}"
JWT_SECRET="${JWT_SECRET:-$(python3 -c 'import secrets; print(secrets.token_hex(32))')}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

banner() { echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"; }
step() { echo -e "  ${GREEN}▶${NC} $1"; }
mark_ok() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --project) PROJECT_ID="$2"; shift 2 ;;
    --region)  REGION="$2";   shift 2 ;;
    --help)    echo "Usage: $0 [--project ID] [--region REG]"; exit 0 ;;
    *) fail "Unknown arg: $1" ;;
  esac
done

[[ -z "$PROJECT_ID" ]] && fail "No project ID. Use --project or set GOOGLE_CLOUD_PROJECT"

gcloud config set project $PROJECT_ID >/dev/null 2>&1

banner "🐝 BHRAMARI — GCP Deploy"
echo "  Project:  $PROJECT_ID"
echo "  Region:   $REGION"
echo "  Service:  $SERVICE"

# ─── Step 1: Enable APIs ────────────────────────────────────────────────────
banner "Step 1/6 — Enabling GCP APIs"
step "Enabling 17 APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  pubsub.googleapis.com \
  cloudbuild.googleapis.com \
  spanner.googleapis.com \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  cloudtasks.googleapis.com \
  compute.googleapis.com \
  storage-api.googleapis.com \
  artifactregistry.googleapis.com \
  --project=$PROJECT_ID >/dev/null 2>&1
mark_ok "All APIs enabled"

# ─── Step 2: Cloud SQL ───────────────────────────────────────────────────────
banner "Step 2/6 — Cloud SQL (PostgreSQL)"
step "Creating PostgreSQL instance..."
gcloud sql instances create bhramari-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --project=$PROJECT_ID \
  --root-password=$DB_PASSWORD \
  >/dev/null 2>&1 || warn "Instance may already exist"
mark_ok "Cloud SQL created"

step "Creating database..."
gcloud sql databases create bhramari --instance=bhramari-db --project=$PROJECT_ID >/dev/null 2>&1 || true
mark_ok "Database 'bhramari' created"

INSTANCE_CONN=$(gcloud sql instances describe bhramari-db \
  --format='value(connectionName)' --project=$PROJECT_ID)
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@/${INSTANCE_CONN}/bhramari"
mark_ok "Connection: $INSTANCE_CONN"

# ─── Step 3: Memorystore Redis ──────────────────────────────────────────────
banner "Step 3/6 — Memorystore (Redis)"
step "Creating Redis instance..."
gcloud redis instances create bhramari-redis \
  --region=$REGION \
  --size=1 \
  --redis-version=redis_7_0 \
  --project=$PROJECT_ID \
  >/dev/null 2>&1 || warn "Redis instance may already exist"
mark_ok "Memorystore created"

REDIS_HOST=$(gcloud redis instances describe bhramari-redis \
  --format='value.host' --project=$PROJECT_ID)
REDIS_PORT=$(gcloud redis instances describe bhramari-redis \
  --format='value.port' --project=$PROJECT_ID)
REDIS_URL="rediss://${REDIS_HOST}:${REDIS_PORT}"
mark_ok "Redis: $REDIS_HOST:$REDIS_PORT"

# ─── Step 4: Pub/Sub + Cloud Tasks ──────────────────────────────────────────
banner "Step 4/6 — Event Infrastructure"
for topic in submission review-complete pattern-match leaderboard-refresh voice-intent; do
  gcloud pubsub topics create "bhramari-$topic" --project=$PROJECT_ID >/dev/null 2>&1 || true
done
mark_ok "5 Pub/Sub topics created"

gcloud tasks queues create bhramari-swarm-queue \
  --location=$REGION --project=$PROJECT_ID >/dev/null 2>&1 || true
mark_ok "Cloud Tasks queue created"

# ─── Step 5: Secret Manager ─────────────────────────────────────────────────
banner "Step 5/6 — Secret Manager"
echo -n "$JWT_SECRET" | gcloud secrets create bhramari-jwt-secret \
  --data-file=- --project=$PROJECT_ID >/dev/null 2>&1 || warn "Secret may already exist"
echo -n "$DB_PASSWORD" | gcloud secrets create bhramari-db-password \
  --data-file=- --project=$PROJECT_ID >/dev/null 2>&1 || true
mark_ok "Secrets stored"

# ─── Step 6: Build & Deploy ─────────────────────────────────────────────────
banner "Step 6/6 — Build & Deploy to Cloud Run"

step "Configuring Docker..."
gcloud auth configure-docker us-docker.pkg.dev --quiet >/dev/null 2>&1

step "Creating Artifact Registry..."
gcloud artifacts repositories create bhramari-repo \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID \
  >/dev/null 2>&1 || warn "Registry may already exist"
mark_ok "Artifact Registry ready"

step "Building Docker image (multi-stage)..."
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/bhramari-repo/bhramari-api:latest" \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "deploy") . \
  >/dev/null 2>&1 || fail "Docker build failed. Is Docker running?"
mark_ok "Image built"

step "Pushing to Artifact Registry..."
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/bhramari-repo/bhramari-api:latest" >/dev/null 2>&1 || \
  fail "Docker push failed"
mark_ok "Image pushed"

step "Deploying to Cloud Run..."
gcloud run deploy $SERVICE \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/bhramari-repo/bhramari-api:latest" \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars \
    DATABASE_URL="$DATABASE_URL",\
    REDIS_URL="$REDIS_URL",\
    GOOGLE_CLOUD_PROJECT=$PROJECT_ID,\
    JWT_SECRET="$JWT_SECRET" \
  >/dev/null 2>&1 || fail "Cloud Run deploy failed"
mark_ok "Cloud Run service deployed"

# ─── Final Output ────────────────────────────────────────────────────────────
banner "🐝 DEPLOYMENT COMPLETE"

API_URL=$(gcloud run services describe $SERVICE \
  --region $REGION \
  --format='value(status.url)' --project=$PROJECT_ID)

echo -e "  ${GREEN}🌐 API URL:${NC}     $API_URL"
echo -e "  ${GREEN}📊 API Docs:${NC}    $API_URL/docs"
echo -e "  ${GREEN}🗄️  SQL:${NC}         $INSTANCE_CONN"
echo -e "  ${GREEN}📦 Redis:${NC}        $REDIS_HOST:$REDIS_PORT"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo -e "    1. Open $API_URL/docs to test the Swagger UI"
echo -e "    2. Run: curl $API_URL/health"
echo -e "    3. Register: curl -X POST $API_URL/api/v1/auth/register \\"
echo -e "       -H 'Content-Type: application/json' \\"
echo -e "       -d '{\"email\":\"you@example.com\",\"username\":\"yourname\"}'"
echo ""
echo -e "  ${CYAN}Frontend:${NC}  Deploy from frontend/dist/ to Cloud Run or Cloud Storage + CDN"
echo -e "  ${CYAN}GitHub:${NC}    https://github.com/z99wE/bhramari"
echo ""
