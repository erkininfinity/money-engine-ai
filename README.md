# Money Engine AI

[![CI](https://github.com/erkininfinity/money-engine-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/erkininfinity/money-engine-ai/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://sqlite.org/)

**Turn your skills into a testable B2B offer. Run a 7-day revenue sprint. Learn what works. Repeat.**

**Собери оффер. Найди первых клиентов. Запусти 7-дневный revenue sprint. Улучши следующий шаг.**

Money Engine AI is an open-source, local-first pre-CRM for solo founders, freelancers, consultants, developers, and AI/automation specialists who want to validate a B2B service offer through concrete weekly experiments.

It is not a get-rich-quick app, a full CRM, or an outbound spam machine. It helps users choose a revenue path, package an offer, run a manual 7-day sprint, track metrics, and review what to improve next.

## Core Loop

1. Founder profile: describe skills, assets, constraints, available hours, and sales comfort.
2. Revenue paths: generate and score 3-5 realistic B2B service paths.
3. Offer builder: turn the selected path into a concrete offer with pain, outcome, deliverables, exclusions, and call to action.
4. Sprint plan: generate a 7-day action checklist and ethical outreach messages.
5. Metrics and review: track replies, calls, offers, payments, bottlenecks, and the next sprint recommendation.

## Features

- Next.js app with App Router and TypeScript.
- Local-first SQLite database with Drizzle ORM.
- OpenAI-compatible API configuration through user-owned keys.
- Structured Zod schemas for profiles, offers, sprints, playbooks, and weekly reviews.
- Seed revenue playbooks in `data/playbooks/`.
- Playbook validation script and Vitest coverage.
- Docker and Docker Compose support for self-hosting.
- Ethics, privacy, security, and contribution documentation.

## Quick Start

### Requirements

- Node.js 20.9 or newer
- npm

### Local Development

```bash
git clone https://github.com/erkininfinity/money-engine-ai.git
cd money-engine-ai
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

Open http://localhost:3000 in your browser.

### Docker Compose

```bash
cp .env.example .env.local
docker compose up --build
```

The app will be available at http://localhost:3000.

## Environment

Set these values in `.env.local`:

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
DATABASE_URL=file:dev.db
```

The app can also point to OpenAI-compatible providers if you control the endpoint and understand the provider's privacy model.

## Testing

```bash
npm run lint
npm run test
npm run build
```

`npm run test` validates playbooks first, then runs the Vitest suite.

## Playbooks

Revenue playbooks are schema-validated YAML files in `data/playbooks/`. They describe a narrow B2B experiment: target customer, painful problem, offer, price range, channels, 7-day actions, metrics, risks, and anti-patterns.

Start from `.github/playbook_template.yaml` when proposing a new playbook.

## Ethics and Privacy

Money Engine AI follows a strict no-spam and no-fake-proof policy:

- No bulk outreach automation.
- No fake testimonials, fake case studies, or invented credentials.
- No income guarantees.
- Manual, permission-first outreach before automation.
- Local-first data ownership by default.

Read more in [docs/ethics.md](docs/ethics.md) and [docs/privacy.md](docs/privacy.md).

## Roadmap

The public roadmap is in [docs/roadmap.md](docs/roadmap.md). The current focus is stable self-hosting, stronger playbook quality, prompt/eval fixtures, dogfooding reports, and maintainer automation for open-source workflows.

## Contributing

Pull requests are welcome, especially for:

- New ethical B2B revenue playbooks.
- Prompt and structured-output evals.
- Tests for scoring, schemas, imports/exports, and weekly reviews.
- Documentation improvements.
- Self-hosting and deployment improvements.

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md) before contributing.

## License

Money Engine AI is released under the [Apache 2.0 License](LICENSE).
