# Ubuntu competition release

Copy `.env.production.example` to `.env.production`, install the approved teacher-reviewed content/seed files at the configured secret paths, then run `docker compose up -d --build`. Cloudflare Tunnel is the only public ingress; neither app nor PostgreSQL publishes host ports. Verify `docker compose ps`, `/healthz`, migrations, and the authenticated learner/Ops flow after every update.
