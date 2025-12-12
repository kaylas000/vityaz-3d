# 🚀 DEPLOY VITYAZ NOW - One Command

## ⚡ FASTEST START (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/kaylas000/vityaz-special-operations.git
cd vityaz-special-operations

# 2. ONE COMMAND TO RULE THEM ALL
make quickstart

# 3. Start development servers (open 2 terminals)
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run start:dev

# 4. Open browser
# http://localhost:3000
```

**DONE! Game is running!** ✅

---

## 📋 What `make quickstart` Does

1. ✅ Installs all npm dependencies (backend + frontend)
2. ✅ Starts Docker (PostgreSQL + Redis)
3. ✅ Runs database migrations
4. ✅ Seeds database with test data
5. ✅ Creates logs directory
6. ✅ Sets up environment

**Total time: ~5 minutes**

---

## 🎮 What You Get

### Running Services
- ✅ **Frontend**: http://localhost:3000 (React + Phaser 3)
- ✅ **Backend API**: http://localhost:3001 (NestJS)
- ✅ **API Docs**: http://localhost:3001/docs (Swagger)
- ✅ **Database**: PostgreSQL on localhost:5432
- ✅ **Cache**: Redis on localhost:6379

### Working Features
- ✅ User authentication
- ✅ Game engine (Phaser 3)
- ✅ Combat system
- ✅ Token economy
- ✅ NFT system
- ✅ WebSocket multiplayer
- ✅ REST API (25 endpoints)
- ✅ Error handling
- ✅ Logging
- ✅ Unit tests

---

## 🔧 Manual Setup (If make doesn't work)

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start Docker
docker-compose up -d
sleep 10

# Database
cd backend
npx prisma migrate deploy
npx prisma db seed
cd ..

# Start servers
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run start:dev
```

---

## ✅ Verify Installation

```bash
# Check Docker services
docker-compose ps

# Should show:
# - vityaz-postgres (Up)
# - vityaz-redis (Up)

# Check backend
curl http://localhost:3001/health
# Should return: {"status":"ok"}

# Check frontend
curl http://localhost:3000
# Should return HTML
```

---

## 🧪 Run Tests

```bash
# Run all tests
make test

# Or manually:
cd backend && npm test
cd frontend && npm test
```

---

## 🚀 Deploy to Testnet

Once local development works:

```bash
# Deploy smart contracts to TON testnet
./scripts/deploy-contracts.sh

# Deploy to staging server
make deploy-testnet
```

---

## 📊 Project Status

| Component | Status | Ready |
|-----------|--------|-------|
| Backend API | ✅ Working | YES |
| Frontend | ✅ Working | YES |
| Game Engine | ✅ Working | YES |
| Database | ✅ Working | YES |
| Tests | ✅ Working | YES |
| Error Handling | ✅ Working | YES |
| Logging | ✅ Working | YES |
| Docker | ✅ Working | YES |
| Smart Contracts | ⚠️ Not deployed | NO |
| Graphics | ⚠️ Placeholders | PARTIAL |

**Overall: 80% Complete - READY FOR LOCAL DEV**

---

## ⚠️ Known Issues

### 1. Graphics Missing
**Problem**: Game uses placeholder graphics (colored rectangles)
**Solution**: Run `./scripts/add-graphics.sh` to add free assets

### 2. Smart Contracts Not Deployed
**Problem**: Blockchain features use mock data
**Solution**: Follow `ACTION_ITEMS.md` Phase 1, Task 1.1

### 3. Port Already in Use
**Problem**: `Error: listen EADDRINUSE :::3000`
**Solution**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

---

## 🎯 Next Steps After Local Deploy

### Week 1: Complete Phase 1
1. Deploy smart contracts to TON testnet
2. Add real graphics
3. Improve test coverage to 50%+
4. Fix any bugs

### Week 2-3: Phase 2
1. Complete frontend UI
2. Deploy to Ethereum Sepolia
3. Deploy to Solana devnet
4. Telegram integration

### Week 4-6: Phase 3
1. Performance optimization
2. Advanced matchmaking
3. Monitoring setup
4. Security hardening

### Week 7-8: Testnet Launch
1. Deploy to staging
2. Invite alpha testers
3. Gather feedback
4. Fix bugs

---

## 📞 Support

**Issues?** Check:
1. `TROUBLESHOOTING.md` (coming soon)
2. GitHub Issues: https://github.com/kaylas000/vityaz-special-operations/issues
3. Documentation: All `.md` files in repo

---

## 🎉 Success!

If you see:
- ✅ Frontend running on :3000
- ✅ Backend running on :3001
- ✅ API docs on :3001/docs
- ✅ No errors in console

**CONGRATULATIONS! VITYAZ is running!** 🚀

Now:
1. Play the game locally
2. Test all features
3. Review the code
4. Start Phase 1 tasks from `ACTION_ITEMS.md`
5. Deploy to testnet

---

**Repository**: https://github.com/kaylas000/vityaz-special-operations  
**Status**: ✅ **READY TO DEPLOY LOCALLY**  
**Next**: Follow `ACTION_ITEMS.md` for testnet deployment
