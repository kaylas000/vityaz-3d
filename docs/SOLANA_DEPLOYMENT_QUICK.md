# 🔗 SOLANA DEPLOYMENT - QUICK START

**Статус:** 🔴 BLOCKED  
**Время:** 2-3 часа  
**Бюджет:** $0 (free devnet)

---

## 📋 ШАГИ УСТАНОВКИ

### 1. Установить Solana CLI

```bash
# macOS / Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Добавить в PATH
export PATH="/Users/$(whoami)/.local/share/solana/install/active_release/bin:$PATH"

# Проверить
solana --version  # v1.18.0+
```

### 2. Установить Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
anchor --version  # 0.29.0+
```

### 3. Конфигурировать Devnet

```bash
# Настроить devnet
solana config set --url devnet
solana config set --keypair ~/.config/solana/id.json

# Создать кошелёк
solana-keygen new --outfile ~/.config/solana/id.json

# Получить тестовые SOL
solana airdrop 2 $(solana address) --url devnet

# Проверить баланс
solana balance
```

---

## 💤 ПОдготовка Проекта

### 1. Новый Anchor проект

```bash
cd contracts/solana
anchor init vityaz_token --typescript
cd vityaz_token
```

### 2. Написать программы

**programs/vityaz_token/src/lib.rs:**
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod vityaz_token {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        decimals: u8,
    ) -> Result<()> {
        Ok(())
    }

    pub fn mint_token(
        ctx: Context<MintToken>,
        amount: u64,
    ) -> Result<()> {
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct MintToken {}
```

### 3. Компилировать

```bash
anchor build --skip-lint
```

---

## 🚀 НЕПЛоЙМЕНтАЦИЯ

```bash
# Проверить
anchor test

# Неплой на devnet
anchor deploy --provider.cluster devnet

# Ответ в консоли:
# Deploy address: Xxxxxx...
```

---

## 📚 ОБНОВЛЕНИЕ

**contracts/solana/DEPLOYED_ADDRESSES.md:**
```markdown
# Solana Devnet

| Программа | Адрес |
|-----------|--------|
| VityazToken | Xxxxx... |
| Staking | Xxxxx... |
| Marketplace | Xxxxx... |

## Проверка
https://explorer.solana.com/?cluster=devnet
```

## ✅ ПРОВЕРКА

```bash
# Смотреть адрес
solana address

# Проверить стак
solana balance

# Набрать в browser
# https://explorer.solana.com/address/YOUR_ADDRESS?cluster=devnet
```

---

**Время:** 2-3 часа  
**Бюджет:** $0  
**На двери после TON и Ethereum ✅

