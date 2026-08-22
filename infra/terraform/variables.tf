variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "bhramari-hackathon"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "vpc_self_link" {
  description = "VPC network self-link for private connectivity"
  type        = string
  default     = ""
}

variable "db_password" {
  description = "PostgreSQL root password"
  type        = string
  sensitive   = true
  default     = "Bhramari@Hack2025!"
}

variable "container_image" {
  description = "Container image URI for Cloud Run"
  type        = string
  default     = "us-docker.pkg.dev/YOUR_PROJECT/bhramari-repo/bhramari-api:latest"
}
