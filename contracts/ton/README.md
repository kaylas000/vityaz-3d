# VITYAZ TON Smart Contracts

## Overview
TON blockchain smart contracts for the VITYAZ Special Operations game ecosystem.

## Quick Start

### Installation
```bash
npm install
```

### Configuration
Create `.env` file with:
```
WALLET_MNEMONIC=your 24-word BIP39 mnemonic
NETWORK=testnet
```

### Deployment
```bash
npm run deploy
```

## Project Structure
- `src/` - Smart contract source files (FunC)
- `deploy/` - Deployment scripts
- `tests/` - Contract tests

## Contracts

### VityazToken (src/VityazToken.fc)
- Main VITYAZ token contract
- Status: In Development

## Requirements
- Node.js >= 18
- TON SDK
- TypeScript

## Network
- Testnet: `testnet`
- Mainnet: `mainnet`
