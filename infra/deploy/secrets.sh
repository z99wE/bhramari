# -----------------------------------------------------------------------------
# Bhrmari — Store secrets in Secret Manager
# -----------------------------------------------------------------------------
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-bhramari-hackathon}"
JWT_SECRET="${JWT_SECRET:-$(python3 -c 'import secrets; print(secrets.token_hex(32))')}"
DB_PASSWORD="${DB_PASSWORD:-Bhramari@Hack2025!}"

echo "🔐 Storing secrets in Secret Manager..."

for secret_name in jwt-secret db-password; do
  value="$JWT_SECRET"
  [[ "$secret_name" == "db-password" ]] && value="$DB_PASSWORD"
  echo -n "$value" | gcloud secrets create "bhramari-$secret_name" \
    --data-file=- --project=$PROJECT_ID 2>/dev/null || true
  gcloud secrets add-iam-policy-binding "bhramari-$secret_name" \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID 2>/dev/null || true
  echo "   ✓ bhramari-$secret_name"
done

echo "✅ Secrets stored"
