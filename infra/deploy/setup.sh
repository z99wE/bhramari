# -----------------------------------------------------------------------------
# Bhrmari — GCP Deployment Configuration
# Deploy to Cloud Run (Backend) + Cloud Run (Frontend proxy) on GCP
# -----------------------------------------------------------------------------

# ─── Project ────────────────────────────────────────────────────────────────
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
REGION="us-central1"
BACKEND_SERVICE="bhramari-api"
FRONTEND_SERVICE="bhramari-web"

# ─── Enable APIs ────────────────────────────────────────────────────────────
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  aiplatform.googleapis.com \
  pubsub.googleapis.com \
  cloudbuild.googleapis.com \
  spanner.googleapis.com \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  cloudtasks.googleapis.com \
  compute.googleapis.com \
  translate.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  storage-api.googleapis.com \
  --project=$PROJECT_ID

echo "✅ APIs enabled for $PROJECT_ID"
