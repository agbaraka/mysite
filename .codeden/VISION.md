# Vision

mysite is Albert Shirima's personal portfolio site (albertshirima.com). It's a fast, static, single page that introduces Albert as a software developer, shows his skills and projects, and makes it easy to reach him. It also shows off his engineering practice of containerised self-hosting.

## Goals
- Finish the Hugo → Vite migration (`feat/migration`) and ship it to production via Docker + Caddy.
- Keep all profile and project content in `data.yml`, so updating the portfolio never needs HTML changes (move the hard-coded skills list there too).
- Keep the project list and skills current, and every link working.
- Reduce runtime third-party dependencies (bundle particles.js / jump.js instead of loading them from a CDN).

## Target users
- Recruiters and hiring managers: need a quick, credible summary of skills, experience and projects, plus a way to make contact.
- Developers and collaborators: want links to real code (GitHub, contributions like Goyave) and live demos.
- Albert himself: needs a site that's cheap and quick to update and that doubles as a playground for deployment practice.

## Principles
- Small, focused changes, one concern per PR.
- Static first: no backend, no SPA framework, no client-side routing.
- Content is data: `data.yml` is the source of truth, and its schema stays stable (renames need a template update in the same PR).
- Minimal dependencies. Prefer what Vite, Tailwind and plain JS already provide.
- No tracking: no third-party trackers or ad/analytics SDKs.

## Out of scope
- Blog, CMS, comments or any server-side features.
- User accounts, login, forms that store personal data.
- Migrating to React/Vue/Next/Astro or another framework.
- Third-party analytics (Google Analytics, Meta Pixel, etc.).
- Rewriting Albert's bio, CV or skill claims (content about Albert is his to write).
- Visual redesigns nobody asked for.

## Quality bar
- `pnpm build` succeeds with no warnings introduced, and `docker build` succeeds.
- No broken links or empty template bindings (every `{{ }}` key exists in `data.yml`).
- No debug code, test buttons or console noise in production.
- Lighthouse performance and accessibility stay ≥ 90 on mobile; images have alt text.
- CI is green before merge, once CI exists.

## Protected areas
Paths (globs in backticks) and topics that always need a human. The factory never merges
changes that touch them; they go to your inbox.
- `.github/workflows/**`
- `.gitlab-ci.yml`
- `Dockerfile`
- `docker-compose.yaml`
- `src/otel/**`
- `LICENSE`
- personal information and contact details (email, social links, photo, bio)
- telemetry endpoints, data collection and privacy
- DNS, domains and hosting/deployment
