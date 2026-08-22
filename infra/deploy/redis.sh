# -----------------------------------------------------------------------------
# Bhrmari — Memorystore (Redis) Setup
# -----------------------------------------------------------------------------
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
REGION="us-central1"

echo "📦 Creating Memorystore Redis instance..."

gcloud redis instances create bhramari-redis \
  --region=$REGION \
  --size=1 \
  --redis-version=redis_7_0 \
  --project=$PROJECT_ID

export REDIS_HOST=$(gcloud redis instances describe bhramari-redis \
  --format='value(host)' --project=$PROJECT_ID)
export REDIS_PORT=$(gcloud redis instances describe bhramari-redis \
  --format='value.port' --project=$PROJECT_ID)

echo "✅ Redis ready: $REDIS_HOST:$REDIS_PORT"
echo "   REDIS_URL=rediss://${REDIS_HOST}:${REDIS_PORT}"
