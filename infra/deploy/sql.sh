# -----------------------------------------------------------------------------
# Bhrmari — Cloud SQL (PostgreSQL) Setup
# -----------------------------------------------------------------------------
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
REGION="us-central1"
DB_PASSWORD="${DB_PASSWORD:-Bhramari@Hack2025!}"

echo "🗄️  Creating Cloud SQL PostgreSQL instance..."

gcloud sql instances create bhramari-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --project=$PROJECT_ID \
  --root-password=$DB_PASSWORD

gcloud sql databases create bhramari --instance=bhramari-db --project=$PROJECT_ID

export INSTANCE_CONN=$(gcloud sql instances describe bhramari-db \
  --format='value(connectionName)' --project=$PROJECT_ID)

echo "✅ Cloud SQL ready: $INSTANCE_CONN"
echo "   DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@/${INSTANCE_CONN}/bhramari"
