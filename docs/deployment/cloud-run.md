# Cloud Run Deployment

## Acceptance Criteria

- Cloud Run returns a `run.app URL` after deployment.
- SPA route refresh works through the nginx fallback for dashboard routes.
- Smoke flow covers `run -> compare -> export` before marking the deployment healthy.

## Verification

- `curl "$RUN_APP_URL/healthz"` returns `OK`.
- Opening a nested route and refreshing the page keeps the application shell mounted.
