# MISSION_ORDERS — PHASE 3: COMBAT & MULTIPLAYER

**OBJECTIVE:** Delegate clear, testable tasks to specialized sub-agents for Phase 3: arena generation, combat resolution, special-ops AI, scene integration, and multiplayer support.

---

## AGENT: ARENA_BUILDER
**Primary objective:** Implement deterministic arena generation with a 50×50 grid and usable spawn points.

**Acceptance criteria:**
- Programmatic generator produces a 50×50 grid of cells with consistent positions.
- API: `getSpawnPoint(index: number): BABYLON.Vector3` available for scene placement.
- Arena includes optional obstacle seeding and boundary collision for physics.
- Unit tests validate grid generation, spawn distribution, and obstacle placement.

**Files / locations:**
- `frontend/src/game/Arena.ts` (create/update) — generator, API, configs
- `frontend/src/game/constants.ts` (create/update) — GRID_SIZE, CELL_SIZE
- `frontend/src/game/Arena.test.ts` (create) — tests
- Update `GameScenePhase3Integration.tsx` to use `Arena.getSpawnPoint`

**Subtasks:**
1. Create `Arena` class with constructor(config) and `generateGrid()`.
2. Implement `getSpawnPoint(idx)` with bounds check and deterministic distribution.
3. Add `seedObstacles(seed?: number, density?: number)` helper.
4. Add unit tests and a small visual debug overlay for dev builds.

**Estimated effort:** 1–2 days

---

## AGENT: COMBAT_ENGINE
**Primary objective:** Create a deterministic combat action resolution system for attack/defend/special actions.

**Acceptance criteria:**
- Public API: `resolveAction(actor, actionType, target?)` returns an immutable `ActionResult` object.
- Handles stamina costs, cooldowns, armor absorption, critical hits, misses, and status effects.
- Emits events that can be consumed by UI, CombatSystem, or multiplayer layer.
- Unit tests cover edge cases (out of range, insufficient stamina, armor fully absorbs damage).

**Files / locations:**
- `frontend/src/game/CombatEngine.ts` (new) — pure combat logic
- `frontend/src/game/CombatEngine.test.ts` (new) — logic tests
- `frontend/src/game/CombatSystem.ts` (update) — call into `CombatEngine` for authoritative resolution
- `frontend/src/game/events/CombatEvents.ts` (optional) — event types

**Subtasks:**
1. Define action types and `ActionResult` schema.
2. Implement damage calc, armor, stamina effects, cooldown handling.
3. Add event emission and test harness for deterministic simulation.
4. Integrate with `CombatSystem` update loop.

**Estimated effort:** 2–3 days

---

## AGENT: AI_SPECIAL_OPS
**Primary objective:** Implement AI for special ops enemy fighters with tactical decisions and special ability usage.

**Acceptance criteria:**
- Enemies choose behaviors: patrol, chase, attack, defend, special-ability use, or retreat.
- Special ability includes cooldown, stamina requirement, and defined effect via `CombatEngine`.
- Unit tests simulate state transitions and verify correct decision-making.

**Files / locations:**
- `frontend/src/game/EnemyFighter.ts` (update) — hook into strategy
- `frontend/src/game/ai/SpecialOpsAI.ts` (new) — behavior & decision tree
- `frontend/src/game/ai/SpecialOpsAI.test.ts` (new) — tests

**Subtasks:**
1. Extract AI logic into `SpecialOpsAI` strategy module.
2. Implement decision timers, priorities, and special ability triggers.
3. Add tests for chase/attack/retreat scenarios and special ability usage.
4. Add tunable config (detectionRange, aggressiveness, specialCooldown).

**Estimated effort:** 2–4 days

---

## AGENT: SCENE_INTEGRATOR
**Primary objective:** Integrate `Arena`, `CombatEngine`, and `SpecialOpsAI` into `GameScenePhase3Integration` with robust rendering and lifecycle management.

**Acceptance criteria:**
- Scene uses `Arena.getSpawnPoint()` to place players and enemies.
- `CombatSystem` calls into `CombatEngine` for action resolution and subscribes to AI events.
- React UI (`CombatUI`, etc.) receives state updates predictably (via ticks or event subscriptions).
- Smoke test runs a short simulated fight and asserts expected state changes.

**Files / locations:**
- `frontend/src/game/GameScenePhase3Integration.tsx` (update) — scene wiring
- `frontend/src/game/CombatSystem.ts` (update) — integrate engine & AI
- Add smoke test harness: `frontend/src/game/sceneSmoke.test.ts` (new)

**Subtasks:**
1. Replace manual spawn usage with `Arena` API.
2. Ensure update loops are delta-timed and safe for headless tests.
3. Add a smoke test to run a short simulation and verify expected outcomes.

**Estimated effort:** 1–2 days

---

## AGENT: MULTIPLAYER_GATEWAY
**Primary objective:** Add WebSocket-based multiplayer support for action sync and optional authoritative server resolution.

**Acceptance criteria:**
- Minimal WebSocket server prototype (Node + ws or ws/lib) that accepts connections and relays actions.
- Client wrapper to serialize/deserialize actions and state deltas: `wsClient.ts`.
- Demonstrable local run with sample action round-trip and integration tests for message schema.

**Files / locations:**
- `backend/ws-server/` (new) — simple WebSocket server and message router
- `frontend/src/network/wsClient.ts` (new) — client-side wrapper
- `frontend/src/game/multiplayer/` (new) — glue logic to send/receive action messages
- `docker-compose.yml` or `docker-compose.dev.yml` (update) — optional local server config

**Subtasks:**
1. Define wire format (action, ack, authoritative state, delta).
2. Implement server handling for basic rooms and broadcast.
3. Implement client reconnect/retry, and integration tests for serialization.
4. Document how to run locally and add to dev-compose if desired.

**Estimated effort:** 3–5 days (prototype)

---

## COORDINATION & ACCEPTANCE
- Each agent opens a PR and includes tests, short demo steps (how to run locally), and a changelog entry.
- Cross-agent sign offs:
  - `SCENE_INTEGRATOR` approves `ARENA_BUILDER` and `AI_SPECIAL_OPS` integration.
  - `MULTIPLAYER_GATEWAY` aligns on `CombatEngine` event schema for message serialization.
- QA: Each feature must include unit tests and a short smoke test that can be run in CI.

---

## TIMELINE (suggested)
- Week 1: Arena generator & CombatEngine scaffolding
- Week 2: Enemy AI + tests
- Week 3: Scene integration + smoke tests
- Week 4: WebSocket multiplayer prototype + integration tests

---

## NEXT STEPS
1. Create issues & branches for each agent (e.g., `feat/arena-builder`).
2. Assign agents to tasks and set `ARENA_BUILDER` as the first in-progress work item.
3. Start implementation and open PRs when ready.

---

*If you approve, I will create the issues/branches and mark `ARENA_BUILDER` as in-progress.*
