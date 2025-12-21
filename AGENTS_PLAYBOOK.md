# AGENTS_PLAYBOOK — Local Playbook

Location: `~/AGENTS_PLAYBOOK.md` (repository root `AGENTS_PLAYBOOK.md`)

Purpose: A short, local playbook describing how agents should accept, execute, and report tasks for Phase 3 work.

Contents
- Execution model: Parallel agents with single in-progress todo each
- How to accept tasks:
  - Read `MISSION_ORDERS.md`
  - Comment on the assigned issue and set status to `in-progress`
  - Use echo status format outlined in `MISSION_ORDERS.md` for updates
- Reporting:
  - Create PRs for features including tests and docs
  - Tag `@maintainers` in PR description and request `SCENE_INTEGRATOR` sign-off for integration tasks
- CI & Tests:
  - Use `.github/workflows/ci-parallel.yml` for local PR validation

Tips
- Keep changes small and test-driven
- When adding new systems (CombatEngine, AI), add unit tests and smoke tests
- Use branches like `feat/<agent>-<task>` and open PRs against `main`
