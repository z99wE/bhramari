# -----------------------------------------------------------------------------
# Bhrmari — Pub/Sub Topics & Cloud Tasks Queue
# -----------------------------------------------------------------------------
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
REGION="us-central1"

TOPICS=(submission review-complete pattern-match leaderboard-refresh voice-intent)

echo "📨 Creating Pub/Sub topics..."
for topic in "${TOPICS[@]}"; do
  gcloud pubsub topics create "bhramari-$topic" --project=$PROJECT_ID
  echo "   ✓ bhramari-$topic"
done

echo "⏱️  Creating Cloud Tasks queue..."
gcloud tasks queues create bhramari-swarm-queue \
  --location=$REGION --project=$PROJECT_ID

echo "✅ Event infrastructure ready"
