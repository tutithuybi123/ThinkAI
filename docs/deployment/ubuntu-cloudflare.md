# Ubuntu competition release

Copy `.env.production.example` to `.env.production`, install the approved teacher-reviewed content/seed files at the configured secret paths, then run `tools/deploy/deploy-debian.ps1`. Cloudflare Tunnel is the only public ingress; neither app nor PostgreSQL publishes host ports. Verify `docker compose ps`, `/healthz`, migrations, and the authenticated learner/Ops flow after every update. The target is a generic Linux Docker host; no Ubuntu package-management assumption is required.
