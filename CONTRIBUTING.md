# Contributing to Money Engine AI

Thank you for your interest in contributing to Money Engine AI! We are building an open-source tool to help people launch their first B2B revenue streams.

## How to Contribute

1. **Submit Bug Reports or Feature Requests:** Open an issue in our repository.
2. **Submit Code Changes:** Create a Pull Request (PR) against the `main` branch.
3. **Submit New Playbooks:** This is the most valuable way to contribute! You can add new industry-specific B2B playbooks to `data/playbooks/` as YAML files.

---

## Playbook Submission Rules

To maintain high quality, every playbook PR is manually reviewed and tested against our playbook schema. 

Your playbook PR **will be rejected** if it:
* ❌ Promises guaranteed or unrealistic income.
* ❌ Requires or encourages user deception or fake social proof (e.g., fake case studies).
* ❌ Depends on spam automation or bulk cold emailing/DMing.
* ❌ Lacks a clear target customer profile or painful problem.
* ❌ Has no concrete, specific deliverables.
* ❌ Contains no measurable 7-day sprint metrics or daily action checklist.
* ❌ Is just a generic business advice article rather than a structured sequence of actions.

### Playbook Format
Playbooks must match the JSON/YAML schema defined in `src/lib/schemas/playbook.ts`. An example template can be found in `.github/playbook_template.yaml` and real seed playbooks live in `data/playbooks/`.

---

## Development Standards

### Core Technology Stack
* **Framework:** Next.js (App Router, TypeScript)
* **Styling:** Tailwind CSS
* **Database:** SQLite + Drizzle ORM
* **Tests:** Vitest

### Code Rules
* Ensure all database models are properly migrated and mapped.
* Write unit tests for scoring and schemas inside `tests/`.
* Run `npm run lint` and `npm run build` before opening a PR.
* Respect user privacy: do not add telemetry or external analytics packages without consensus.

---

## Code of Conduct
Please be respectful and constructive in all issues, PR discussions, and community chats. Refer to [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.
