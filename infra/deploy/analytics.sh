# -----------------------------------------------------------------------------
# Bhrmari — Spanner (Leaderboard) & BigQuery (Analytics)
# -----------------------------------------------------------------------------
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
REGION="us-central1"

echo "🌐 Creating Spanner instance..."
gcloud spanner instances create bhramari-spanner \
  --config=regional-$REGION \
  --description="Bhramari Leaderboard" \
  --nodes=1 \
  --project=$PROJECT_ID

echo "📊 Enabling BigQuery..."
bq mk --dataset --project_id=$PROJECT_ID bhramari_analytics 2>/dev/null || true

echo "✅ Analytics infrastructure ready"
