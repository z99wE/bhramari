# -----------------------------------------------------------------------------
# Bhrmari — Main Terraform Entry Point
# Deploy full GCP stack: SQL, Redis, Cloud Run, Pub/Sub, Secret Manager, etc.
# -----------------------------------------------------------------------------
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─── Enable APIs ─────────────────────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "aiplatform.googleapis.com",
    "pubsub.googleapis.com",
    "cloudbuild.googleapis.com",
    "spanner.googleapis.com",
    "bigquery.googleapis.com",
    "secretmanager.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "cloudtasks.googleapis.com",
    "compute.googleapis.com",
    "translate.googleapis.com",
    "speech.googleapis.com",
    "texttospeech.googleapis.com",
    "storage-api.googleapis.com",
  ])
  service = each.value
  disable_on_destroy = false
}

# ─── Cloud SQL (PostgreSQL) ──────────────────────────────────────────────────
resource "google_sql_database_instance" "main" {
  name         = "bhramari-db"
  region       = var.region
  database_version = "POSTGRES_15"
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = false
      private_network = var.vpc_self_link
    }
  }
  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "main" {
  name     = "bhramari"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "root" {
  name     = "postgres"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# ─── Memorystore (Redis) ─────────────────────────────────────────────────────
resource "google_redis_instance" "main" {
  name     = "bhramari-redis"
  region   = var.region
  memory_size_gb = 1
  tier   = "BASIC"
  redis_version = "REDIS_7_0"

  authorized_network = var.vpc_self_link
}

# ─── Pub/Sub Topics ──────────────────────────────────────────────────────────
resource "google_pubsub_topic" "topics" {
  for_each = toset([
    "bhramari-submission",
    "bhramari-review-complete",
    "bhramari-pattern-match",
    "bhramari-leaderboard-refresh",
    "bhramari-voice-intent",
  ])
  name = each.value
}

# ─── Cloud Tasks Queue ───────────────────────────────────────────────────────
resource "google_cloud_tasks_queue" "swarm" {
  name     = "bhramari-swarm-queue"
  location = var.region
}

# ─── Spanner Instance ────────────────────────────────────────────────────────
resource "google_spanner_instance" "main" {
  config     = "regional-${var.region}"
  display_name = "Bhramari Leaderboard"
  nodes      = 1
}

# ─── BigQuery Dataset ────────────────────────────────────────────────────────
resource "google_bigquery_dataset" "analytics" {
  dataset_id = "bhramari_analytics"
  location   = "US"
}

# ─── Artifact Registry ───────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "bhramari-repo"
  format        = "DOCKER"
}

# ─── Service Account ─────────────────────────────────────────────────────────
resource "google_service_account" "bhramari" {
  account_id   = "bhramari-sa"
  display_name = "Bhramari Cloud Run Service Account"
}

resource "google_project_iam_member" "sa_roles" {
  for_each = toset([
    "roles/run.invoker",
    "roles/cloudsql.client",
    "roles/redis.client",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/secretmanager.secretAccessor",
    "roles/storage.objectViewer",
  ])
  role   = each.value
  member = "serviceAccount:${google_service_account.bhramari.email}"
}

# ─── Cloud Run Service ───────────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "api" {
  name     = "bhramari-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCED"

  template {
    max_instances = 10
    concurrency = 80

    containers {
      image = var.container_image

      env {
        name  = "DATABASE_URL"
        value = "postgresql://postgres:${var.db_password}@/${google_sql_database_instance.main.connection_name}/bhramari"
      }
      env {
        name  = "REDIS_URL"
        value = "rediss://${google_redis_instance.main.host}:${google_redis_instance.main.port}"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "JWT_SECRET"
        value_from {
          secret_key_ref {
            name  = "projects/${var.project_id}/secrets/bhramari-jwt-secret/versions/latest"
            field = "latest"
          }
        }
      }
    }

    service_account = google_service_account.bhramari.email
  }

  depends_on = [
    google_project_service.apis,
    google_project_iam_member.sa_roles,
  ]
}

# ─── Output URLs ─────────────────────────────────────────────────────────────
output "api_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "sql_connection" {
  value = google_sql_database_instance.main.connection_name
}

output "redis_host" {
  value = google_redis_instance.main.host
}
