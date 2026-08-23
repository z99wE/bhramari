#!/bin/bash
PROJECT_ID="qwiklabs-gcp-00-56125d510400"
gcloud config set project $PROJECT_ID
gcloud services enable aiplatform.googleapis.com run.googleapis.com cloudbuild.googleapis.com
echo "GCP Setup Complete"
