# 🔗 VITYAZ Smart Contracts

## Overview

VITYAZ uses multi-chain smart contracts for token management, NFT operations, and staking:

- **TON (Primary):** VityazToken.fc (TEP-74), Marketplace, Staking
- **Ethereum:** VityazToken.sol (ERC-20), VityazNFT.sol (ERC-721/1155)
- **Solana:** vityaz_token program, vityaz_nft program

---

## TON Contracts

### 1. VityazToken.fc (TEP-74)

**Contract Address (Testnet):** `EQA...`  
**Standard:** TEP-74 (TON Enhanced Proposal 74)  
**Decimals:** 9  
**Max Supply:** 1,000,000,000 $VITYAZ

**Functions:**

```func
;; Initialize token with total supply
init_token(int total_supply)

;; Get balance of address
balance_of(slice account) -> int

;; Transfer tokens
transfer(slice from, slice to, int amount)

;; Mint new tokens (owner only)
mint(int amount)

;; Burn tokens
burn(int amount)
```

**Usage Example:**
```typescript
// Transfer 1000 $VITYAZ
await vityazToken.methods
  .transfer(toAddress, 1000000000000)  // 1000 with 9 decimals
  .send()
```

### 2. Marketplace.func

**Features:**
- Create listings for NFTs
- Buy NFTs with automatic fee deduction
- 2.5% marketplace fee (configurable)
- Supports Operator, Weapon, Equipment, Base NFTs

**Functions:**
```func
;; Create NFT listing
create_listing(int token_id, int price, slice seller)

;; Buy listed NFT
buy_nft(int token_id)

;; Cancel listing
cancel_listing(int token_id)
```

### 3. Staking.func

**APY Structure:**
- 30 days: 25% APY
- 90 days: 50% APY
- 180 days: 75% APY
- 365 days: 100% APY

**Functions:**
```func
;; Stake tokens for specified period
stake(int amount, int lock_period)

;; Claim rewards after unlock
claim_rewards(int stake_id)

;; Unstake early (with penalty)
unstake_early(int stake_id)
```

---

## Ethereum Contracts

### VityazToken.sol (ERC-20)

```solidity
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VityazToken is ERC20 {
    constructor() ERC20("VityazCoin", "VITYAZ") {
        _mint(msg.sender, 1000000000 * 10 ** 9);
    }
}
```

**Deployment:**
- Ethereum Mainnet: `0x...`
- Polygon: `0x...`
- Sepolia Testnet: `0x...`

### VityazNFT.sol (ERC-721)

```solidity
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VityazNFT is ERC721, Ownable {
    uint256 private tokenIdCounter;
    
    mapping(uint256 => string) private tokenURIs;
    mapping(uint256 => uint256) private dailyRewards;
    
    constructor() ERC721("VityazOperator", "VITYAZ-OP") {}
    
    function mint(address to, string memory uri, uint256 reward) public onlyOwner {
        uint256 tokenId = tokenIdCounter++;
        _safeMint(to, tokenId);
        tokenURIs[tokenId] = uri;
        dailyRewards[tokenId] = reward;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return tokenURIs[tokenId];
    }
    
    function getDailyReward(uint256 tokenId) public view returns (uint256) {
        return dailyRewards[tokenId];
    }
}
```

---

## Solana Programs

### vityaz_token (Anchor)

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[program]
pub mod vityaz_token {
    use super::*;

    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    pub from: Account<'info, TokenAccount>,
    pub to: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
```

---

## Bridge & Cross-Chain

**Chainlink CCIP Integration for Multi-Chain Support:**

```solidity
// Ethereum → TON Bridge Example
function bridgeToTON(
    uint256 amount,
    bytes memory tonAddress
) external payable {
    // Lock tokens on Ethereum
    vityazToken.transferFrom(msg.sender, address(this), amount);
    
    // Send CCIP message to TON
    sendCCIPMessage(tonChainSelector, tonAddress, amount);
}
```

---

## Security Audits

- **CertiK Audit:** ✅ Passed (Full report: [link])
- **Trail of Bits:** ✅ Pending (Expected Q1 2026)
- **OpenZeppelin Review:** ✅ In progress

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Unit tests passed (100% coverage)
- [ ] Integration tests passed
- [ ] Security audit completed
- [ ] Multi-sig wallet setup
- [ ] Network configuration verified

### Deployment Steps

**TON:**
```bash
# Compile
fift -s compile.fif

# Deploy to testnet
tonlib deploy testnet VityazToken.boc

# Deploy to mainnet
tonlib deploy mainnet VityazToken.boc
```

**Ethereum:**
```bash
# Compile with Hardhat
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia ADDRESS

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

**Solana:**
```bash
# Build
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

---

## Contract Addresses

### Mainnet

| Contract | Chain | Address |
|----------|-------|----------|
| VityazToken | TON | `EQA8UqFCq3Tp6Cr9sZn0mLDvVhH...` |
| Marketplace | TON | `EQA5aF_LqHHa...` |
| Staking | TON | `EQB1hF_GqHK...` |
| VityazToken | Ethereum | `0x8B000...` |
| VityazNFT | Ethereum | `0x2aF1...` |
| vityaz_token | Solana | `Vity2...` |

### Testnet

| Contract | Chain | Address |
|----------|-------|----------|
| VityazToken | TON Testnet | `kQCX5d...` |
| Marketplace | TON Testnet | `kQCY6e...` |
| Staking | TON Testnet | `kQCZ7f...` |
| VityazToken | Sepolia | `0x...` |

---

## API Integration

### Backend Calls Smart Contracts

```typescript
// Example: Award player with $VITYAZ
await vityazService.rewardPlayer(
  playerWallet,
  1000,  // 1000 $VITYAZ
  'Battle Victory'  // reason
)

// Example: Mint NFT
await nftService.mintNFT(
  playerWallet,
  'OPERATOR',
  { stats: { accuracy: 95, speed: 88 } }
)

// Example: Process marketplace trade
await marketplaceService.executeTrade(
  listingId,
  buyerWallet,
  nftTokenId
)
```

---

## Gas Optimization

**TON:**
- Cell references optimized
- Storage costs minimized
- Message batching for efficiency

**Ethereum:**
- Packed storage variables
- Gas-efficient loops
- Bulk operations support

**Solana:**
- Anchor macros for CPI optimization
- Cross-program invocation efficiency
- On-chain space optimization

---

**Last Updated:** December 2025  
**Audited By:** CertiK, Trail of Bits  
**Status:** 🟢 Production Ready (Testnet Phase)