# 📋 VITYAZ: Complete Action Items List

**Last Updated:** December 12, 2025  
**Priority Levels:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## 🔴 PHASE 1: CRITICAL (DO THIS WEEK)

### 1.1 Deploy Smart Contracts to TON Testnet 🔴 **HIGHEST PRIORITY**

**Why:** Unblocks all blockchain progress. This is THE bottleneck.

**Tasks:**
- [ ] Install TON development tools
  ```bash
  brew install ton-cli
  npm install -g @ton-cli/cli
  ```

- [ ] Setup TON testnet wallet
  ```bash
  tonlib wallet init testnet
  # Request testnet TON from faucet
  ```

- [ ] Compile VityazToken.fc
  ```bash
  cd contracts/ton
  fift -s compile.fif VityazToken.fc
  ```

- [ ] Deploy VityazToken contract
  ```bash
  tonlib deploy testnet VityazToken.boc
  # Record contract address
  ```

- [ ] Test token transfer
  ```bash
  # Transfer 100 tokens to another wallet
  # Verify on tonscan.org
  ```

- [ ] Compile and deploy Marketplace.fc
  ```bash
  fift -s compile.fif Marketplace.fc
  tonlib deploy testnet Marketplace.boc
  ```

- [ ] Compile and deploy Staking.func
  ```bash
  fift -s compile.fif Staking.func
  tonlib deploy testnet Staking.boc
  ```

- [ ] Update .env with contract addresses
  ```env
  TON_TOKEN_ADDRESS=<address_from_deployment>
  TON_MARKETPLACE_ADDRESS=<address_from_deployment>
  TON_STAKING_ADDRESS=<address_from_deployment>
  ```

- [ ] Create testnet deployment documentation
  - Screenshot of successful deployments
  - Contract addresses
  - Test results

**Estimated Time:** 5 hours  
**Owner:** Blockchain Developer  
**Status:** 🟡 TODO

---

### 1.2 Add Basic Graphics Assets 🔴 **URGENT**

**Why:** Game is invisible without graphics. This enables gameplay testing.

**Player Sprite:**
- [ ] Create 32x64 pixel player sprite (or use free asset)
- [ ] Add idle animation (4 frames)
- [ ] Add running animation (6 frames)
- [ ] Add death animation (4 frames)
- [ ] Export as spritesheet PNG

**Enemy Sprites:**
- [ ] Create enemy sprites (different color from player)
- [ ] Add animations
- [ ] Export as spritesheet

**Map/Background:**
- [ ] Create simple 1024x768 background texture
- [ ] Use simple colors (green for grass, brown for walls)
- [ ] Add basic grid/tile pattern
- [ ] Create 3 different maps (Easy, Medium, Hard)

**UI Elements:**
- [ ] Health bar graphic
- [ ] Ammo counter
- [ ] Score display
- [ ] Crosshair

**Weapons:**
- [ ] Bullet sprite (4x4 pixels)
- [ ] Muzzle flash effect

**Integration:**
- [ ] Update BattleScene.ts with asset paths
- [ ] Load sprites in preload()
- [ ] Test rendering
- [ ] Verify animations work

**Resources:**
- Free assets: itch.io, OpenGameArt.org
- Or create simple graphics in Aseprite ($20) or free Piskel
- Minimum viable: Simple colored rectangles for testing

**Estimated Time:** 8 hours  
**Owner:** Game Developer / Designer  
**Status:** 🟡 TODO

---

### 1.3 Add Unit Test Framework 🔴 **CRITICAL FOR AUDIT**

**Backend Tests (Jest):**
- [ ] Install Jest
  ```bash
  cd backend
  npm install --save-dev jest @types/jest ts-jest
  npm install --save-dev @nestjs/testing
  ```

- [ ] Create jest.config.js
  ```javascript
  module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
  };
  ```

- [ ] Write combat engine tests (5+ tests)
  ```typescript
  describe('CombatEngine', () => {
    it('should calculate damage correctly', () => {...})
    it('should apply distance modifier', () => {...})
    it('should apply body part multiplier', () => {...})
    it('should apply armor reduction', () => {...})
    it('should not exceed 100% damage reduction', () => {...})
  })
  ```

- [ ] Write token service tests (5+ tests)
  ```typescript
  describe('TokenService', () => {
    it('should reward player', () => {...})
    it('should transfer tokens', () => {...})
    it('should prevent transfer without balance', () => {...})
    it('should calculate staking rewards', () => {...})
    it('should burn tokens', () => {...})
  })
  ```

- [ ] Write API endpoint tests (10+ tests)
  - Test authentication
  - Test user endpoints
  - Test battle endpoints
  - Test economy endpoints
  - Test error handling

- [ ] Setup coverage reporting
  ```bash
  npm test -- --coverage
  ```

**Frontend Tests (Vitest):**
- [ ] Install Vitest
  ```bash
  cd frontend
  npm install --save-dev vitest @testing-library/react
  ```

- [ ] Test combat calculations (5+ tests)
- [ ] Test API client (5+ tests)
- [ ] Test game scene logic (5+ tests)

**Coverage Target:** 30%+ (can improve to 80%+ later)

**Estimated Time:** 8 hours  
**Owner:** QA Engineer / Developer  
**Status:** 🟡 TODO

---

### 1.4 Setup Error Handling & Logging 🟠 **HIGH**

**Backend Error Handling:**
- [ ] Create global error filter
  ```typescript
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      // Handle all exceptions
    }
  }
  ```

- [ ] Add to main.ts
  ```typescript
  app.useGlobalFilters(new GlobalExceptionFilter());
  ```

- [ ] Create custom exceptions
  - UserNotFoundException
  - InsufficientBalanceException
  - InvalidTransactionException
  - etc.

- [ ] Add request validation
  ```typescript
  app.useGlobalPipes(new ValidationPipe());
  ```

**Logging Setup:**
- [ ] Install Winston
  ```bash
  npm install winston
  ```

- [ ] Create logger service
  ```typescript
  @Injectable()
  export class LoggerService {
    debug(message: string) {}
    info(message: string) {}
    warn(message: string) {}
    error(message: string, error?: Error) {}
  }
  ```

- [ ] Add logging to key services
  - Authentication
  - Token transfers
  - Battle events
  - Errors

- [ ] Setup log rotation (30-day retention)

**Estimated Time:** 4 hours  
**Owner:** DevOps / Backend Lead  
**Status:** 🟡 TODO

---

## 🟠 PHASE 2: HIGH PRIORITY (NEXT 1-2 WEEKS)

### 2.1 Complete Frontend UI 🟠

**Menu Scene:**
- [ ] Main menu with play button
- [ ] Settings screen
- [ ] Profile screen
- [ ] Leaderboard view
- [ ] Exit button

**Pause Menu:**
- [ ] Pause on ESC key
- [ ] Resume button
- [ ] Settings access
- [ ] Exit to menu

**Game Over Screen:**
- [ ] Show final stats (kills, score, XP)
- [ ] Show rewards earned
- [ ] Play again button
- [ ] Return to menu button

**HUD Enhancement:**
- [ ] Weapon display
- [ ] Minimap (optional)
- [ ] Damage indicators (hit markers)
- [ ] Kill notifications
- [ ] Game timer

**Inventory UI:**
- [ ] NFT display
- [ ] Weapon skins
- [ ] Equipment selection
- [ ] Cosmetics

**Estimated Time:** 20 hours  
**Owner:** Frontend Developer  
**Status:** 🟡 TODO

---

### 2.2 Deploy to Ethereum Sepolia 🟠

**Setup:**
- [ ] Install Hardhat
  ```bash
  cd contracts/ethereum
  npm install --save-dev hardhat
  npx hardhat
  ```

- [ ] Configure Sepolia network
  ```javascript
  module.ethereum: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
  ```

**Deploy:**
- [ ] Compile ERC-20 contract
  ```bash
  npx hardhat compile
  ```

- [ ] Deploy to Sepolia
  ```bash
  npx hardhat run scripts/deploy.js --network sepolia
  ```

- [ ] Verify on Etherscan
  ```bash
  npx hardhat verify --network sepolia ADDRESS
  ```

- [ ] Test transfers
- [ ] Document contract address

**Estimated Time:** 4 hours  
**Owner:** Blockchain Developer  
**Status:** 🟡 TODO

---

### 2.3 Deploy to Solana Devnet 🟠

**Setup:**
- [ ] Install Solana CLI
  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
  ```

- [ ] Configure devnet
  ```bash
  solana config set --url devnet
  solana-keygen new
  ```

**Deploy:**
- [ ] Build Anchor program
  ```bash
  cd contracts/solana
  anchor build
  ```

- [ ] Deploy to devnet
  ```bash
  anchor deploy --provider.cluster devnet
  ```

- [ ] Test program
  ```bash
  anchor test
  ```

- [ ] Document program ID

**Estimated Time:** 4 hours  
**Owner:** Blockchain Developer  
**Status:** 🟡 TODO

---

### 2.4 Telegram Mini App Integration 🟠

**Setup:**
- [ ] Create Telegram bot
  ```bash
  # Use @BotFather on Telegram
  # Get BOT_TOKEN
  ```

- [ ] Configure webhook
  ```bash
  curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
    -F url=https://your-domain.com/telegram/webhook
  ```

**Backend Implementation:**
- [ ] Create telegram.controller.ts
  ```typescript
  @Controller('telegram')
  export class TelegramController {
    @Post('webhook')
    async handleUpdate(@Body() update: TelegramUpdate) {
      // Process Telegram updates
    }
  }
  ```

- [ ] Handle /start command
- [ ] Handle /play command
- [ ] Send inline buttons
- [ ] Handle button callbacks

**Frontend Integration:**
- [ ] Detect if running in Telegram
  ```typescript
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
  }
  ```

- [ ] Get user data from Telegram
  ```typescript
  const user = tg?.initDataUnsafe?.user;
  ```

- [ ] Authenticate with backend
  ```typescript
  await api.loginWithTelegram(user);
  ```

- [ ] Launch game in full screen
  ```typescript
  tg.expand();
  ```

**Testing:**
- [ ] Test on Telegram Desktop
- [ ] Test on Telegram Mobile
- [ ] Test button callbacks
- [ ] Test user data passing

**Estimated Time:** 12 hours  
**Owner:** Full-stack Developer  
**Status:** 🟡 TODO

---

### 2.5 Database Migration Scripts 🟠

- [ ] Create Prisma migration
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] Create seed script (prisma/seed.ts)
  ```typescript
  async function main() {
    // Create test users
    // Create test tournaments
    // Create test items
  }
  ```

- [ ] Update package.json
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```

- [ ] Test migrations
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```

- [ ] Create backup scripts
  ```bash
  #!/bin/bash
  pg_dump $DATABASE_URL > backup_$(date +%s).sql
  ```

**Estimated Time:** 4 hours  
**Owner:** DevOps / Database Admin  
**Status:** 🟡 TODO

---

## 🟡 PHASE 3: MEDIUM PRIORITY (WEEKS 3-4)

### 3.1 Performance Optimization 🟡

**Database:**
- [ ] Add database indexes
  ```prisma
  model User {
    id        String  @id @default(cuid())
    username  String  @unique
    tonAddress String @unique
    @@index([tonAddress])
  }
  ```

- [ ] Query optimization
  - Identify slow queries
  - Add query analysis
  - Create appropriate indexes

- [ ] Connection pooling
  ```env
  DATABASE_URL="postgresql://...?schema=public"
  ```

**Frontend:**
- [ ] Bundle analysis
  ```bash
  npm run build -- --analyze
  ```

- [ ] Code splitting
  - Split by route
  - Lazy load components
  - Lazy load assets

- [ ] Asset optimization
  - Compress images
  - Minify CSS/JS
  - Use WebP format

- [ ] Caching strategy
  - Service Worker
  - Cache manifest
  - Redis for API

**API Response Time Target:** <200ms (p99)

**Estimated Time:** 16 hours  
**Owner:** Performance Engineer  
**Status:** 🟡 TODO

---

### 3.2 Advanced Matchmaking 🟡

**Skill-Based Matching:**
- [ ] Calculate player skill rating
  - K/D ratio
  - Win rate
  - Average score

- [ ] Create matchmaking queue
  ```typescript
  interface MatchmakingQueue {
    playerId: string
    skillRating: number
    queueTime: number
  }
  ```

- [ ] Implement matching algorithm
  - Group by skill bracket
  - Form balanced teams
  - Start game when full

- [ ] Prevent smurfing
  - Minimum account age
  - Minimum playtime
  - Trust system

**Estimated Time:** 12 hours  
**Owner:** Game Designer / Developer  
**Status:** 🟡 TODO

---

### 3.3 Clan/Team System 🟡

- [ ] Create Clan model
  ```prisma
  model Clan {
    id      String @id @default(cuid())
    name    String @unique
    owner   User
    members User[]
    wins    Int
    stats   Json
  }
  ```

- [ ] Clan endpoints
  - Create clan
  - Join clan
  - Leave clan
  - Get clan stats
  - Disband clan

- [ ] Clan features
  - Clan chat
  - Clan tournaments
  - Clan rankings
  - Clan storage

- [ ] Permissions system
  - Owner
  - Officer
  - Member

**Estimated Time:** 16 hours  
**Owner:** Backend Developer  
**Status:** 🟡 TODO

---

### 3.4 Monitoring & Observability 🟡

**Prometheus Setup:**
- [ ] Install Prometheus client
  ```bash
  npm install prom-client
  ```

- [ ] Add metrics
  ```typescript
  const httpRequestDuration = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code']
  });
  ```

- [ ] Export metrics endpoint
  ```typescript
  @Get('/metrics')
  metrics() {
    return register.metrics();
  }
  ```

**Grafana Dashboards:**
- [ ] Request rate
- [ ] Response time
- [ ] Error rate
- [ ] Database connections
- [ ] Memory usage
- [ ] CPU usage

**Sentry Error Tracking:**
- [ ] Install Sentry
  ```bash
  npm install @sentry/node
  ```

- [ ] Configure
  ```typescript
  import * as Sentry from '@sentry/node';
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  ```

- [ ] Capture errors
  ```typescript
  try {
    // code
  } catch (e) {
    Sentry.captureException(e);
  }
  ```

**Estimated Time:** 8 hours  
**Owner:** DevOps / SRE  
**Status:** 🟡 TODO

---

## 🟢 PHASE 4: NICE TO HAVE (WEEKS 5+)

### 4.1 Advanced Features 🟢

- [ ] Campaign mode
- [ ] Coop dungeons
- [ ] Trading market
- [ ] Spectator mode
- [ ] Replay system
- [ ] Skin customization
- [ ] Battle pass system
- [ ] Seasonal content

---

### 4.2 Community Features 🟢

- [ ] Discord integration
- [ ] Twitch integration
- [ ] Streaming mode
- [ ] Highlights/clips
- [ ] Community events
- [ ] Creator program
- [ ] Feedback system

---

### 4.3 Mobile Optimization 🟢

- [ ] Mobile UI
- [ ] Touch controls
- [ ] Responsive design
- [ ] Performance for mobile
- [ ] React Native version
- [ ] iOS app
- [ ] Android app

---

## 📊 SUMMARY BY PHASE

### Phase 1: CRITICAL (THIS WEEK)
- Deploy smart contracts: 5 hours
- Add graphics: 8 hours
- Add tests: 8 hours
- Error handling: 4 hours
- **Total: 25 hours**

### Phase 2: HIGH (NEXT 1-2 WEEKS)
- Frontend UI: 20 hours
- Ethereum deploy: 4 hours
- Solana deploy: 4 hours
- Telegram integration: 12 hours
- Database scripts: 4 hours
- **Total: 44 hours**

### Phase 3: MEDIUM (WEEKS 3-4)
- Performance: 16 hours
- Matchmaking: 12 hours
- Clans: 16 hours
- Monitoring: 8 hours
- **Total: 52 hours**

### Phase 4: NICE TO HAVE (WEEKS 5+)
- Advanced features: TBD
- Community: TBD
- Mobile: TBD

---

## 📈 EFFORT ESTIMATES

| Phase | Hours | Developers | Weeks |
|-------|-------|-----------|-------|
| Phase 1 (CRITICAL) | 25 | 2-3 | <1 week |
| Phase 2 (HIGH) | 44 | 2-3 | 1-2 weeks |
| Phase 3 (MEDIUM) | 52 | 2-3 | 2-3 weeks |
| Phase 4 (NICE) | TBD | 2-3 | 2-4 weeks |
| **TOTAL** | **121+** | **2-3** | **6-10 weeks** |

---

## 💰 COST BREAKDOWN

| Activity | Cost | Owner |
|----------|------|-------|
| Smart contracts deploy | $0 | Blockchain Dev |
| Graphics creation | $2K-5K | Designer |
| Testing setup | $0 | Dev |
| Frontend UI | $0 | Dev |
| Blockchain deploy | $0 | Dev |
| Telegram integration | $0 | Dev |
| Performance optimization | $0 | Dev |
| Monitoring setup | $0 | DevOps |
| **Developer time (120h @ $100/h)** | **$12K** | Team |
| **Infrastructure (2 weeks)** | **$200-500** | Ops |
| **TOTAL PHASE 1-3** | **$14.2K-17.5K** | Team |

---

## ✅ ACCEPTANCE CRITERIA

### For Testnet Launch:
- [ ] All Phase 1 items complete
- [ ] All Phase 2 items complete
- [ ] 100 concurrent players support
- [ ] <1% error rate
- [ ] All tests passing
- [ ] Zero critical security issues
- [ ] Documentation updated

### For Mainnet Launch:
- [ ] All Phase 3 items complete
- [ ] Security audit passed
- [ ] >99.9% uptime
- [ ] Load test 10K concurrent
- [ ] Performance: <200ms API response
- [ ] Monitoring active
- [ ] Support team trained

---

## 📞 TEAM ASSIGNMENTS

| Role | Person | Responsibility |
|------|--------|----------------|
| **Blockchain Dev** | TBD | Smart contract deployment, chain integration |
| **Backend Lead** | TBD | API, database, business logic |
| **Frontend Dev** | TBD | UI, game scenes, client optimization |
| **DevOps** | TBD | Infrastructure, monitoring, deployment |
| **QA/Tester** | TBD | Testing, bug finding, quality assurance |
| **Designer** | TBD | Graphics, UI/UX |
| **Project Manager** | TBD | Coordination, timeline, deliverables |

---

## 📅 TIMELINE

```
Week 1:  Phase 1 (CRITICAL)
  ├─ Deploy contracts (5h)
  ├─ Add graphics (8h)
  ├─ Add tests (8h)
  └─ Error handling (4h)

Week 2-3: Phase 2 (HIGH)
  ├─ Frontend UI (20h)
  ├─ Chain deployments (8h)
  ├─ Telegram (12h)
  └─ Database (4h)

Week 4-5: Phase 3 (MEDIUM)
  ├─ Performance (16h)
  ├─ Matchmaking (12h)
  ├─ Clans (16h)
  └─ Monitoring (8h)

Week 6+: Phase 4+ (NICE TO HAVE)
  └─ Advanced features
```

---

## 🎯 NEXT IMMEDIATE STEPS

### TODAY (Dec 12):
1. ✅ Review this action items list
2. ✅ Assign team members
3. ✅ Setup development environment

### TOMORROW (Dec 13):
1. Start smart contract compilation
2. Request TON testnet tokens
3. Setup Telegram bot

### THIS WEEK (Dec 13-19):
1. ✅ Deploy all 3 contracts to testnet
2. ✅ Add basic graphics
3. ✅ Setup testing framework
4. ✅ Document everything

### NEXT WEEK (Dec 20-27):
1. Complete frontend UI
2. Deploy to Ethereum Sepolia
3. Deploy to Solana devnet
4. Integrate Telegram
5. Load test with 100 players

### WEEK 3-4 (Dec 28 - Jan 10):
1. Performance optimization
2. Advanced matchmaking
3. Clan system
4. Production monitoring

---

## 📝 SUCCESS CRITERIA

✅ **Phase 1 Success:**
- Contracts deployed to testnet
- Game visually playable
- 30+ unit tests
- Zero critical bugs

✅ **Phase 2 Success:**
- Complete UI
- 3 blockchains supported
- Telegram Mini App working
- 100 concurrent players

✅ **Phase 3 Success:**
- Performance targets met
- Advanced features working
- Monitoring active
- Ready for mainnet

---

## 🚀 FINAL NOTES

**This is the complete, unfiltered list of what needs to be done to launch VITYAZ.**

It's comprehensive but achievable. With a small, focused team (2-3 developers), you can:
- Complete Phases 1-2 in 2 weeks
- Complete Phase 3 in 2-3 more weeks
- Be ready for mainnet in 4-6 weeks

**The key is prioritization:**
1. **Week 1:** Do Phase 1 ONLY. No distractions.
2. **Week 2-3:** Do Phase 2. Don't skip anything.
3. **Week 4-5:** Do Phase 3. Quality matters now.
4. **Week 6+:** Polish and phase 4 features.

**Most critical:** START WITH SMART CONTRACTS.

Everything else depends on having real blockchain integration working.

---

el: number;**If you complete all 
Phase 1 items this week, you'll 
be 25% closer to mainnet 
launch.** 🚀
  exp: number; totalEarned: 
  number; // всего заработано 
  totalSpent: number; // всего 
  трато victories: number; 
  defeats: number;
}
export interface 
TransactionRecord {
  id: string; playerId: string; 
  type: 'earn' | 'spend' | 
  'transfer'; amount: number; 
  currency: 'coins' | 'tokens'; 
  reason: string; timestamp: 
  number;
}
export class GameEconomySystem { 
  private playerEconomies: 
  Map<string, PlayerEconomy> = 
  new Map(); private 
  transactions: 
  TransactionRecord[] = [];
  // Основные коэффициенты
  private readonly 
  VICTORY_REWARD = 500; // коины 
  на победу private readonly 
  DEFEAT_PENALTY = 50; // штраф 
  на поражение private readonly 
  FIGHT_ENTRY = 10; // стоимость 
  боя private readonly 
  TOKEN_EXCHANGE_RATE = 0.001; 
  // 1 коин = 0.001 TON 
  // Инициализация экономики 
  // игрока
  initializePlayer(playerId: 
  string): PlayerEconomy {
    const economy: PlayerEconomy 
    = {
      playerId, gameCoins: 1000, 
      // стартовая сумма
      tokenBalance: 0, level: 1, 
      exp: 0, totalEarned: 1000, 
      totalSpent: 0, victories: 
      0, defeats: 0,
    };
    this.playerEconomies.set(playerId, 
    economy); return economy;
  }
  // Получить экономику игрока
  getPlayerEconomy(playerId: 
  string): PlayerEconomy | 
  undefined {
    return 
    this.playerEconomies.get(playerId);
  }
  // Начисление награды за 
  // победу
  recordVictory(playerId: 
  string, multiplier: number = 
  1.0): void {
    const economy = 
    this.playerEconomies.get(playerId); 
    if (!economy) return; const 
    reward = 
    Math.floor(this.VICTORY_REWARD 
    * multiplier); 
    economy.gameCoins += reward; 
    economy.totalEarned += 
    reward; economy.victories += 
    1; economy.exp += 100; 
    this.addTransaction({
      id: 
      `tx_${Date.now()}_${Math.random()}`, 
      playerId, type: 'earn', 
      amount: reward, currency: 
      'coins', reason: 
      'victory', timestamp: 
      Date.now(),
    });
    this.checkLevelUp(playerId);
  }
  // Поражение
  recordDefeat(playerId: 
  string): void {
    const economy = this.playerEconomies.get(playerId);
    if (!economy) return;

    economy.gameCoins = Math.max(0, economy.gameCoins - this.DEFEAT_PENALTY);
    economy.totalSpent += this.DEFEAT_PENALTY;
    economy.defeats += 1;

    this.addTransaction({
      id: `tx_${Date.now()}_${Math.random()}`,
      playerId,
      type: 'spend',
      amount: this.DEFEAT_PENALTY,
      currency: 'coins',
      reason: 'defeat',
      timestamp: Date.now(),
    });
  }

  // Оплата боя
  payForFight(playerId: string): boolean {
    const economy = this.playerEconomies.get(playerId);
    if (!economy || economy.gameCoins < this.FIGHT_ENTRY) {
      return false;
    }

    economy.gameCoins -= this.FIGHT_ENTRY;
    economy.totalSpent += this.FIGHT_ENTRY;

    this.addTransaction({
      id: `tx_${Date.now()}_${Math.random()}`,
      playerId,
      type: 'spend',
      amount: this.FIGHT_ENTRY,
      currency: 'coins',
      reason: 'fight_entry',
      timestamp: Date.now(),
    });

    return true;
  }

  // Новый уровень
  private checkLevelUp(playerId: string): void {
    const economy = this.playerEconomies.get(playerId);
    if (!economy) return;

    const requiredExp = economy.level * 500; // Опыт нужен на следующий уровень
    
    if (economy.exp >= requiredExp) {
      economy.level += 1;
      economy.exp = 0;
      
      // Бонус за повышение уровня
      const levelUpBonus = 100 * economy.level;
      economy.gameCoins += levelUpBonus;
      economy.totalEarned += levelUpBonus;
    }
  }

  // Обмен коинок на токены
  exchangeCoinsForTokens(playerId: string, coinAmount: number): boolean {
    const economy = this.playerEconomies.get(playerId);
    if (!economy || economy.gameCoins < coinAmount) {
      return false;
    }

    const tokens = coinAmount * this.TOKEN_EXCHANGE_RATE;
    economy.gameCoins -= coinAmount;
    economy.tokenBalance += tokens;
    economy.totalSpent += coinAmount;

    this.addTransaction({
      id: `tx_${Date.now()}_${Math.random()}`,
      playerId,
      type: 'transfer',
      amount: tokens,
      currency: 'tokens',
      reason: 'exchange',
      timestamp: Date.now(),
    });

    return true;
  }

  // Добавление транзакции в историю
  private addTransaction(record: TransactionRecord): void {
    this.transactions.push(record);
  }

  // Получить историю транзакций
  getTransactionHistory(playerId: string): TransactionRecord[] {
    return this.transactions.filter(tx => tx.playerId === playerId);
  }

  // статистика игрока
  getPlayerStats(playerId: string) {
    const economy = this.playerEconomies.get(playerId);
    if (!economy) return null;

    const winRate = economy.victories + economy.defeats > 0 
      ? (economy.victories / (economy.victories + economy.defeats) * 100).toFixed(2) 
      : '0.00';

    return {
      ...economy,
      winRate: parseFloat(winRate),
      avgEarningsPerFight: economy.victories > 0 
        ? (economy.totalEarned / economy.victories).toFixed(2) 
        : '0.00',
    };
  }
}

export const gameEconomy = new 
GameEconomySystem(); EOF el: 
number;
  totalWins: number; 
  totalLosses: number; 
  tokenRewards: number; // TON 
  токены experience: number;
  lastUpdated: number;
  trophies: number; // Набранные кубки
  region?: string; // не требуется для глобального рейтинга
}

export class LeaderboardSystem {
  private globalLeaderboard: Map<string, LeaderboardEntry> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoUpdate();
  }

  // Добавление игрока в рейтинг
  addPlayer(playerId: string, playerName: string): void {
    const entry: LeaderboardEntry = {
      rank: this.globalLeaderboard.size + 1,
      playerId,
      playerName,
      level: 1,
      totalWins: 0,
      totalLosses: 0,
      tokenRewards: 0,
      experience: 0,
      lastUpdated: Date.now(),
      trophies: 0,
    };

    this.globalLeaderboard.set(playerId, entry);
  }

  // Обновление статистики игрока
  updatePlayerStats(playerId: string, stats: {
    level?: number;
    wins?: number;
    losses?: number;
    tokens?: number;
    exp?: number;
    trophies?: number;
  }): void {
    const entry = this.globalLeaderboard.get(playerId);
    if (!entry) return;

    if (stats.level !== undefined) entry.level = stats.level;
    if (stats.wins !== undefined) entry.totalWins = stats.wins;
    if (stats.losses !== undefined) entry.totalLosses = stats.losses;
    if (stats.tokens !== undefined) entry.tokenRewards = stats.tokens;
    if (stats.exp !== undefined) entry.experience = stats.exp;
    if (stats.trophies !== undefined) entry.trophies = stats.trophies;
    
    entry.lastUpdated = Date.now();
  }

  // Отсортировать и вернуть Top N
  getTopPlayers(limit: number = 100): LeaderboardEntry[] {
    const sorted = Array.from(this.globalLeaderboard.values())
      .sort((a, b) => {
        // Основные критерии сортировки
        if (b.level !== a.level) return b.level - a.level; // Лидеры интересуют летом
        if (b.trophies !== a.trophies) return b.trophies - a.trophies; // Не теряют кубки
        if (b.tokenRewards !== a.tokenRewards) return b.tokenRewards - a.tokenRewards;
        return b.totalWins - a.totalWins;
      })
      .slice(0, limit);

    // Обновить ранги
    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return sorted;
  }

  // Пойск лы одного игрока
  getPlayerRank(playerId: string): LeaderboardEntry | undefined {
    return this.globalLeaderboard.get(playerId);
  }

  // Отравить топ 10 для дисплея
  getTopTen(): LeaderboardEntry[] {
    return this.getTopPlayers(10);
  }

  // Отравить Около игрока
  getPlayerContext(playerId: string, contextSize: number = 5): LeaderboardEntry[] {
    const top = this.getTopPlayers(1000);
    const playerIndex = top.findIndex(p => p.playerId === playerId);
    
    if (playerIndex === -1) return [];

    const start = Math.max(0, playerIndex - contextSize);
    const end = Math.min(top.length, playerIndex + contextSize + 1);
    
    return top.slice(start, end);
  }

  // Автоматическая обновление (каждые 5 минут)
  private startAutoUpdate(): void {
    this.updateInterval = setInterval(() => {
      console.log(`[Leaderboard] Updated at ${new Date().toISOString()}`);
    }, 5 * 60 * 1000);
  }

  // Централизованные данные для ревайндов
  getDailyRewards(): Array<{rank: number, reward: number}> {
    const top = this.getTopPlayers(100);
    const rewards = [];
    
    // топ 1-3: 1000 tokens
    for (let i = 0; i < Math.min(3, top.length); i++) {
      rewards.push({rank: top[i].rank, reward: 1000});
    }
    
    // топ 4-10: 500 tokens
    for (let i = 3; i < Math.min(10, top.length); i++) {
      rewards.push({rank: top[i].rank, reward: 500});
    }
    
    // топ 11-100: 50 tokens
    for (let i = 10; i < Math.min(100, top.length); i++) {
      rewards.push({rank: top[i].rank, reward: 50});
    }

    return rewards;
  }

  // Остановка автообновления
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const leaderboard = new LeaderboardSystem();
EOF

