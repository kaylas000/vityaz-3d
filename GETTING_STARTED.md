# 🚀 Getting Started with VITYAZ

## Quick Start (5 minutes)

### 1. Clone & Setup

```bash
git clone https://github.com/kaylas000/vityaz-special-operations.git
cd vityaz-special-operations
make install
```

### 2. Start Docker Services

```bash
make docker-up
```

Wait 10 seconds for services to start.

### 3. Initialize Database

```bash
make db-migrate
make db-seed  # Optional: populate with test data
```

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
# Runs at http://localhost:3001
```

### 5. Verify Everything Works

```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:3001/health

# Check database
psql -h localhost -U vityaz -d vityaz_db -c "SELECT * FROM \"User\" LIMIT 1;"
```

---

## Project Overview

### What is VITYAZ?

**VITYAZ: Special Operations** is a tactical first-person shooter with crypto-economics:

- 🎮 **FPS Gameplay** - Counter-Strike + Escape from Tarkov style combat
- 💰 **Play-to-Earn** - Earn $VITYAZ tokens by playing
- ⛓️ **Multi-Chain** - TON, Ethereum, Solana blockchains
- 🥊 **Vityaz Legacy** - Based on real Russian special forces unit
- 🤝 **True Brotherhood** - Community-driven gaming

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Phaser 3 game engine
- Three.js for 3D
- Tailwind CSS + Shadcn/ui
- Socket.io for multiplayer

**Backend:**
- NestJS + TypeScript
- PostgreSQL database
- Redis caching
- WebSocket real-time sync
- TON SDK integration

**Blockchain:**
- TON (TEP-74 tokens, FunC contracts)
- Ethereum (ERC-20/721 Solidity)
- Solana (Anchor programs)

---

## Directory Structure

```
vityaz-special-operations/
├── frontend/          # React + Phaser frontend
│   ├── src/
│   │   ├── scenes/      # Phaser game scenes
│   │   ├── components/ # React UI components
│   │   ├── services/   # API & blockchain
│   │   ├── hooks/      # React custom hooks
│   │   ├── types/      # TypeScript types
│   │   └── App.tsx     # Main component
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── auth/       # Authentication
│   │   ├── users/      # User management
│   │   ├── battles/    # Combat system
│   │   ├── economy/    # $VITYAZ token
│   │   ├── nft/        # NFT system
│   │   └── app.module.ts
│   ├── prisma/     # Database schema
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
├── contracts/         # Smart contracts
│   ├── ton/            # FunC (TON)
│   ├── ethereum/       # Solidity
│   └── solana/         # Rust/Anchor
├── docs/              # Documentation
├── docker-compose.yml # Development stack
├── Makefile           # Build commands
├── package.json       # Root package.json
└── README.md          # Project overview
```

---

## Common Commands

### Installation

```bash
make install           # Install all dependencies
make install-frontend  # Frontend only
make install-backend   # Backend only
```

### Development

```bash
make dev               # Start all dev servers
make dev-frontend      # Frontend only (port 3000)
make dev-backend       # Backend only (port 3001)
```

### Building

```bash
make build             # Build all projects
make build-frontend    # Frontend production build
make build-backend     # Backend production build
```

### Docker

```bash
make docker-up         # Start containers
make docker-down       # Stop containers
make docker-logs       # View logs
make docker-clean      # Remove containers & volumes
```

### Database

```bash
make db-migrate        # Run migrations
make db-seed           # Seed test data
```

### Testing

```bash
make test              # Run all tests
make test-frontend     # Frontend tests
make test-backend      # Backend tests
```

### Other

```bash
make lint              # Lint all code
make clean             # Clean build artifacts
make reset             # Full reset (delete node_modules)
make help              # Show all commands
```

---

## Environment Setup

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_TON_NETWORK=testnet
```

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://vityaz:vityaz_secure_password_123@localhost:5432/vityaz_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key_change_in_production
TON_MNEMONIC=your_test_wallet_mnemonic_12_words
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Frontend changes
cd frontend
# Edit src/ files

# Backend changes
cd backend
# Edit src/ files

# Smart contract changes
cd contracts
# Edit .fc/.sol files
```

### 3. Test Your Changes

```bash
make test
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Open PR on GitHub with:
- Clear description
- Screenshots (if UI change)
- Test results
- Link to issue

---

## Debugging

### Frontend

```bash
# Open React DevTools
# Open Browser DevTools (F12)
# Check Network tab for API calls
# Check Console for errors
```

### Backend

```bash
# View logs
make docker-logs

# Connect to database
psql -h localhost -U vityaz -d vityaz_db

# Check Redis
redis-cli
redis-cli> KEYS *
```

### Database

```bash
# Open Prisma Studio
npm --workspace=backend run prisma:studio

# Runs at http://localhost:5555
```

---

## Next Steps

1. **Read Documentation**
   - [GAMEPLAY.md](docs/GAMEPLAY.md) - Game mechanics
   - [CRYPTOECONOMICS.md](docs/CRYPTOECONOMICS.md) - Token system
   - [SYMBOLISM.md](docs/SYMBOLISM.md) - Vityaz history

2. **Explore Codebase**
   - Frontend: Check `frontend/src/scenes/` for game logic
   - Backend: Check `backend/src/battles/` for combat system
   - Smart Contracts: Check `contracts/ton/` for TON integration

3. **Start Contributing**
   - Pick an issue from GitHub
   - Create feature branch
   - Submit pull request
   - See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines

4. **Join Community**
   - Discord: [Coming soon]
   - Telegram: [@vityaz_game](https://t.me/vityaz_game)
   - GitHub Discussions: Ask questions

---

## Troubleshooting

### "Port already in use"

```bash
# Find and kill process
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Database
lsof -i :6379  # Redis

# Kill process
kill -9 <PID>
```

### "Database connection failed"

```bash
# Check if PostgreSQL is running
make docker-logs

# Restart containers
make docker-down
make docker-up

# Wait 30 seconds for services to start
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules backend/node_modules
make install
```

### "TypeScript errors"

```bash
# Run type checker
make type-check

# Or per workspace
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

---

## Performance Tips

### Frontend
- Use React DevTools Profiler
- Check WebGL performance in Chrome DevTools
- Profile Phaser rendering
- Optimize assets (compress images, sprites)

### Backend
- Monitor database queries
- Check Redis cache hit rate
- Profile Node.js with clinic.js
- Use load testing: `ab`, `k6`, `locust`

---

## Resources

- **Phaser 3 Docs:** https://photonstorm.github.io/phaser3-docs/
- **NestJS Docs:** https://docs.nestjs.com/
- **Prisma Docs:** https://www.prisma.io/docs/
- **TON Docs:** https://ton.org/docs/
- **React Docs:** https://react.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

## Support

**Having issues?**

1. Check [Troubleshooting](#troubleshooting) section
2. Search [GitHub Issues](https://github.com/kaylas000/vityaz-special-operations/issues)
3. Ask in [GitHub Discussions](https://github.com/kaylas000/vityaz-special-operations/discussions)
4. Join Discord (coming soon)

---

**Status:** 🟢 Active Development  
**Last Updated:** December 2025  
**Need Help?** Submit an issue or discussion on GitHub!

**"If not me, then who?"**