# Cloud Run Deployment Runbook

## Purpose
Deploy the static Vite app as an Nginx container to Cloud Run and verify the Phase 5 demo path:
- public run.app URL loads app shell
- SPA route refresh works
- run -> compare -> export works on deployed app

## Prerequisites
- Google Cloud SDK authenticated (`gcloud auth login`)
- Project selected (`gcloud config set project <PROJECT_ID>`)
- Artifact Registry API and Cloud Run API enabled
- Region selected (examples below use `us-central1`)

## Build And Push
1. Build container locally:
   - `docker build -t prompt-wars:phase5 .`
2. Tag for Artifact Registry:
   - `docker tag prompt-wars:phase5 us-central1-docker.pkg.dev/<PROJECT_ID>/prompt-wars/prompt-wars:phase5`
3. Push image:
   - `docker push us-central1-docker.pkg.dev/<PROJECT_ID>/prompt-wars/prompt-wars:phase5`

## Deploy To Cloud Run
Run:
- `gcloud run deploy prompt-wars --image us-central1-docker.pkg.dev/<PROJECT_ID>/prompt-wars/prompt-wars:phase5 --platform managed --region us-central1 --allow-unauthenticated`

Optional environment variables:
- `--set-env-vars VITE_GEMINI_MODEL=gemini-2.5-flash`

## Acceptance Verification Checklist
1. Open the service URL (`https://<service>-<hash>-uc.a.run.app`) and confirm app shell renders.
2. Navigate to a client route and refresh the browser; confirm route resolves via SPA fallback.
3. Execute scenario run flow and verify:
   - comparison panel shows baseline/candidate controls
   - sensitivity narrative appears for selected pair
   - export actions produce JSON and print summary output
4. Hit health endpoint:
   - `curl https://<service-url>/healthz` returns `ok`

## Rollback
Rollback to previous revision:
- `gcloud run revisions list --service prompt-wars --region us-central1`
- `gcloud run services update-traffic prompt-wars --region us-central1 --to-revisions <REVISION>=100`
