# AGENT 1: Blockchain Developer Specification
## Phase 2.1 - TON Smart Contracts Deployment & Integration

### 🎯 PRIMARY OBJECTIVE
Deploy VityazToken to TON Testnet and establish blockchain foundation

### 📋 TASKS (Priority Order)

#### Task 1.1: Testnet Setup (CRITICAL)
```
□ Get testnet TON coins from faucet
□ Create production wallet (not test mnemonic)
□ Document wallet address
□ Verify balance > 1 TON
```

#### Task 1.2: Contract Deployment
```
□ Update deploy-token.js with real wallet
□ Deploy VityazToken contract
□ Capture contract address
□ Verify deployment on explorer
□ Test contract calls
```

#### Task 1.3: Token Minting
```
□ Create minting function in VityazToken.fc
□ Test minting 1,000,000 tokens
□ Verify token balance
□ Document minting process
```

#### Task 1.4: Contract Testing
```
□ Write contract unit tests
□ Test transfer functionality
□ Test minting permissions
□ Add to tests/ directory
```

### 📚 RESOURCES
- VityazToken.fc: `/contracts/ton/src/VityazToken.fc`
- Deploy script: `/contracts/ton/deploy/deploy-token.js`
- TON Docs: https://ton.org/docs
- Testnet Explorer: https://testnet.tonscan.org/

### 🔗 DEPENDENCIES
- None (can start immediately)

### ✅ SUCCESS CRITERIA
- Contract deployed to testnet
- Contract address documented
- Minting tested & working
- Unit tests passing

### 📤 DELIVERABLE
- Updated deploy script with testnet details
- Contract address documented in README
- Test results in tests/ folder
- PR to main with "feat(blockchain): TON testnet deployment"

### ⏱️ ESTIMATED TIME: 2-3 hours
