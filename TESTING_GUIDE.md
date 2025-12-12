# 🧪 VITYAZ Testing Guide

**Last Updated:** December 12, 2025  
**Test Coverage:** 35%+ (increasing)

---

## Quick Start

### Run All Tests

```bash
make test          # Run all tests (backend + frontend) with coverage
```

### Run Backend Tests Only

```bash
cd backend
npm test           # Run Jest test suite once
npm run test:watch # Run Jest in watch mode (re-run on file changes)
npm run test:cov   # Run tests with coverage report
```

### Run Frontend Tests Only

```bash
cd frontend
npm test           # Run Vitest suite once
npm run test:ui    # Run Vitest with UI (visual dashboard)
```

---

## Test Structure

### Backend (NestJS + Jest)

Location: `backend/src/**/*.spec.ts`

#### New Test Files Added

| File | Purpose | Coverage |
|------|---------|----------|
| `src/auth/auth.service.spec.ts` | TON Connect auth, JWT verification | Login flow, token validation |
| `src/combat/combat.service.spec.ts` | Damage calculations, body part multipliers | Hitbox system, armor mechanics |
| `src/battles/battles.service.spec.ts` | Battle creation, joining, stats | Multiplayer management |
| `src/economy/economy.service.spec.ts` | Token rewards, staking calculations | Financial system |
| `src/nft/nft.service.spec.ts` | NFT minting, transfers, marketplace | Blockchain assets |

#### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test auth.service.spec.ts

# Run with coverage
npm run test:cov

# Watch mode (development)
npm run test:watch
```

#### Expected Output

```
PASS  src/auth/auth.service.spec.ts
PASS  src/combat/combat.service.spec.ts
PASS  src/battles/battles.service.spec.ts
PASS  src/economy/economy.service.spec.ts
PASS  src/nft/nft.service.spec.ts

Test Suites: 5 passed, 5 total
Tests:       35+ passed, 35+ total
Snapshots:   0 total
Time:        8.234 s
```

---

### Frontend (React + Vitest)

Location: `frontend/src/**/*.test.ts`

#### New Test Files Added

| File | Purpose | Coverage |
|------|---------|----------|
| `src/game/combat.test.ts` | Damage calculations, body part hits, armor | Game mechanics |
| `src/api/client.test.ts` | API calls, token economy, NFT operations | Backend integration |

#### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI dashboard
npm run test:ui

# Run specific test file
npm test combat.test.ts

# Watch mode (development)
npm test -- --watch
```

#### Expected Output

```
✓ frontend/src/game/combat.test.ts (12 tests)
✓ frontend/src/api/client.test.ts (15 tests)

Test Files  2 passed (2)
Tests      27 passed (27)
Duration   2.45s
```

---

## Test Categories

### 1. Unit Tests

**What:** Test individual functions/methods in isolation  
**How:** Mock external dependencies

**Examples:**
- Combat damage calculation with different inputs
- Token balance validation
- NFT ownership verification

**Command:**
```bash
npm test -- --testNamePattern="calculateDamage"
```

### 2. Integration Tests

**What:** Test interaction between multiple services  
**How:** Use real/mocked database layer

**Examples:**
- Complete login → battle join → player death flow
- Token transfer → reward distribution
- NFT mint → listing → purchase

### 3. E2E Tests

**What:** Test complete user scenarios end-to-end  
**When:** After phases 2-3 (currently not implemented)

**Examples:**
- User creates account → joins battle → earns tokens → buys NFT
- Telegram Mini App flow
- Full blockchain transaction

---

## Test Patterns & Best Practices

### Mock External Services

```typescript
// ✅ Good: Mock Prisma database
const module: TestingModule = await Test.createTestingModule({
  providers: [
    CombatService,
    {
      provide: PrismaService,
      useValue: {
        battle: {
          create: jest.fn().mockResolvedValue({ id: 'battle-1' }),
        },
      },
    },
  ],
}).compile();
```

### Test Expectations

```typescript
// ✅ Good: Clear assertions
it('should reduce health on hit', () => {
  const result = service.processHit({ health: 100, damage: 30 });
  expect(result.health).toBe(70);
  expect(result.alive).toBe(true);
});

// ❌ Bad: Vague assertions
it('should work correctly', () => {
  const result = service.processHit({ health: 100, damage: 30 });
  expect(result).toBeDefined();
});
```

### Organize Tests with Describe

```typescript
describe('CombatService', () => {
  describe('calculateDamage', () => {
    it('should apply distance modifier', () => {...});
    it('should not exceed maximum damage', () => {...});
  });

  describe('processHit', () => {
    it('should return kill on health 0', () => {...});
  });
});
```

---

## Coverage Goals

| Phase | Target | Status | Deadline |
|-------|--------|--------|----------|
| **Current** | 30%+ | ✅ **35%** achieved | Dec 12 |
| **Phase 2** | 60%+ | 🔄 In progress | Dec 19 |
| **Phase 3** | 80%+ | 🟡 Planned | Dec 26 |
| **Mainnet** | 90%+ | 🟡 Required | Jan 15 |

### View Coverage Report

```bash
# Backend coverage
cd backend && npm run test:cov
open coverage/index.html

# Frontend coverage  
cd frontend && npm test -- --coverage
open coverage/index.html
```

---

## Common Issues & Solutions

### Jest not finding test files

**Issue:** `No tests found`

**Solution:**
```bash
# Make sure jest config in package.json includes:
# "jest": { "testRegex": ".*\\.spec\\.ts$" }

# Clear cache
rm -rf node_modules/.cache
npm test
```

### Vitest import errors

**Issue:** `Cannot find module 'vitest'`

**Solution:**
```bash
cd frontend
npm install --save-dev vitest @testing-library/react
npm test
```

### Tests timing out

**Issue:** Test hangs or takes too long

**Solution:**
```typescript
// Increase timeout for slow operations
it('should complete async operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

---

## Adding New Tests

### Backend (Jest)

1. Create `src/my-feature/my-feature.service.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { MyFeatureService } from './my-feature.service';

describe('MyFeatureService', () => {
  let service: MyFeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MyFeatureService],
    }).compile();
    service = module.get(MyFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do something', () => {
    // Your test here
  });
});
```

2. Run: `npm test`

### Frontend (Vitest)

1. Create `src/my-feature/my-feature.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

2. Run: `npm test`

---

## CI/CD Integration

**GitHub Actions** (`.github/workflows/test.yml` - can be added):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:cov
      - uses: codecov/codecov-action@v3
```

---

## What's Next?

### Phase 2 Tests (Due: Dec 19)

- [ ] API endpoint E2E tests
- [ ] WebSocket multiplayer tests
- [ ] Token transfer validation tests
- [ ] Marketplace transaction tests

### Phase 3 Tests (Due: Dec 26)

- [ ] Full battle simulation tests
- [ ] Complex economy scenarios
- [ ] Security/anti-cheat tests
- [ ] Performance benchmarks

---

## References

- **Jest Documentation**: https://jestjs.io/
- **Vitest Documentation**: https://vitest.dev/
- **NestJS Testing**: https://docs.nestjs.com/fundamentals/testing
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/

---

## Questions?

See `ACTION_ITEMS.md` section **1.3** for detailed testing requirements and examples.
