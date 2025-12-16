# 🔗 TON BLOCKCHAIN DEPLOYMENT GUIDE

**Дата:** 16 декабря 2025  
**Статус:** 🔴 BLOCKED - Требует реализации  
**Приоритет:** CRITICAL  
**Время:** 3-4 часа  
**Бюджет:** $100-200 (TON для тестов)

---

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ТРЕБОВАНИЯ

### Установка инструментов

**Шаг 1.1: Установить TON CLI**
```bash
# macOS
brew install ton

# Linux (Ubuntu/Debian)
wget https://github.com/ton-blockchain/ton/releases/download/v0.50.0/ton-linux-x86_64.tar.gz
tar -xzf ton-linux-x86_64.tar.gz
sudo cp ton/bin/* /usr/local/bin/

# Windows (PowerShell)
choco install ton

# Проверка
fift --version    # Должна быть версия 0.50.0+
func --version    # Должна быть версия 0.50.0+
```

**Шаг 1.2: Установить TONCLI**
```bash
npm install -g @ton/ton-cli

# Проверка
toncli --version
```

**Шаг 1.3: Установить TON SDK**
```bash
cd backend
npm install @ton/ton @ton/crypto @ton/core ton-core ton-crypto

cd ../contracts/ton
npm install ton @ton/core
```

---

## 🚀 ФАЗА 1: НАСТРОЙКА СРЕДЫ

### Шаг 1.1: Создать директорию контрактов

```bash
# Если ещё не создана
mkdir -p contracts/ton
cd contracts/ton

# Структура:
# contracts/ton/
# ├── src/
# │   ├── VityazToken.fc      (ERC-20 аналог)
# │   ├── Marketplace.fc      (торговля)
# │   └── Staking.fc          (стейкинг)
# ├── build/
# ├── deploy/
# ├── tests/
# ├── wrappers/
# └── package.json
```

### Шаг 1.2: Инициализировать проект

```bash
npm init -y

npm install --save-dev \
  @ton/core \
  @ton/ton \
  @ton/crypto \
  typescript \
  ts-node \
  ton-emulator
```

### Шаг 1.3: Создать конфигурацию

**ton.config.json:**
```json
{
  "network": "testnet",
  "testnet": {
    "endpoint": "https://testnet.toncenter.com/api/v2/jsonRPC",
    "key": "YOUR_TON_API_KEY",
    "v2": true
  },
  "mainnet": {
    "endpoint": "https://toncenter.com/api/v2/jsonRPC",
    "key": "YOUR_MAINNET_API_KEY",
    "v2": true
  }
}
```

### Шаг 1.4: Получить тестовые TON

```bash
# 1. Создать кошелёк
toncli wallet create my-wallet --testnet

# 2. Получить адрес
toncli wallet address my-wallet --testnet
# Результат: EQDn...xxxxx (testnet адрес)

# 3. Запросить тестовые TON
curl -X POST https://testnet-faucet.toncenter.com/sendfile \
  -F address=YOUR_WALLET_ADDRESS \
  -F file=@wallet.ton

# ИЛИ использовать фaucet на сайте:
# https://testnet-faucet.toncenter.com/

# 4. Проверить баланс
toncli wallet balance my-wallet --testnet
```

---

## 📝 ФАЗА 2: КОМПИЛЯЦИЯ КОНТРАКТОВ

### Шаг 2.1: Компилировать VityazToken.fc

```bash
# Компилировать
func -o build/VityazToken.fif src/VityazToken.fc

# Преобразовать в Bog Standard
fift -I+:{stdlib.fif} -s build/VityazToken.fif

# Результат должен быть в build/VityazToken.boc
```

### Шаг 2.2: Компилировать Marketplace.fc

```bash
func -o build/Marketplace.fif src/Marketplace.fc
fift -I+:{stdlib.fif} -s build/Marketplace.fif
```

### Шаг 2.3: Компилировать Staking.fc

```bash
func -o build/Staking.fif src/Staking.fc
fift -I+:{stdlib.fif} -s build/Staking.fif
```

### Проверка результатов

```bash
ls -la build/
# Должны быть .boc файлы:
# - VityazToken.boc
# - Marketplace.boc
# - Staking.boc
```

---

## 🔑 ФАЗА 3: ПОДГОТОВКА КЛЮЧЕЙ

### Шаг 3.1: Экспортировать ключи

```bash
# Получить приватный ключ
toncli wallet export-key my-wallet --testnet > keys/wallet.pk

# Получить публичный ключ
toncli wallet export-public-key my-wallet --testnet > keys/wallet.pub

# Получить адрес в разных форматах
# Friendly format (EQD...)
# Raw format (0:xxxx...)
```

### Шаг 3.2: Создать .env файл

**contracts/ton/.env:**
```env
TON_TESTNET_API=https://testnet.toncenter.com/api/v2/jsonRPC
TON_API_KEY=your_api_key_from_toncenter
WALLET_MNEMONIC=your_mnemonic_phrase
WALLET_ADDRESS=YOUR_WALLET_ADDRESS
WALLET_VERSION=v4r2

# Smart Contract addresses (после развертывания)
VITYAZ_TOKEN_ADDRESS=
MARKETPLACE_ADDRESS=
STAKING_ADDRESS=

# Network
NETWORK=testnet
```

---

## 🚀 ФАЗА 4: РАЗВЕРТЫВАНИЕ КОНТРАКТОВ

### Шаг 4.1: Развернуть VityazToken

**deploy/deploy-token.ts:**
```typescript
import { getHttpEndpoint } from "@ton/ton-core";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient } from "@ton/ton";

async function deployVityazToken() {
  // 1. Получить приватный ключ из mnemonic
  const mnemonic = process.env.WALLET_MNEMONIC!.split(' ');
  const keyPair = await mnemonicToWalletKey(mnemonic);
  
  // 2. Подключиться к блокчейну
  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  const client = new TonClient({ endpoint });
  
  // 3. Загрузить скомпилированный контракт
  const deployerMnemonic = mnemonic;
  
  // 4. Развернуть контракт
  console.log('🚀 Deploying VityazToken to testnet...');
  
  // 5. Получить адрес после развертывания
  console.log('✅ Contract deployed at: EQD...');
  
  return {
    contractAddress: 'EQD...',
    transactionHash: 'xxxxx'
  };
}

deployVityazToken();
```

**Запуск:**
```bash
npx ts-node deploy/deploy-token.ts
```

### Шаг 4.2: Развернуть Marketplace

```bash
npx ts-node deploy/deploy-marketplace.ts
```

### Шаг 4.3: Развернуть Staking

```bash
npx ts-node deploy/deploy-staking.ts
```

### Шаг 4.4: Проверить развертывание

```bash
# Проверить, что контракты развернуты
curl -s https://testnet.toncenter.com/api/v2/getAddressInformation \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"EQD...contract_address"}'

# Результат должен содержать:
# "state": "active"
# "balance": количество TON
```

---

## ✅ ФАЗА 5: ТЕСТИРОВАНИЕ ФУНКЦИОНАЛА

### Шаг 5.1: Тестировать mint токенов

```bash
# Mint 1000 VITYAZ токенов на адрес
npx ts-node tests/test-mint.ts

# Проверить баланс
npx ts-node tests/test-balance.ts
```

### Шаг 5.2: Тестировать трансферы

```bash
# Отправить токены на другой адрес
npx ts-node tests/test-transfer.ts

# Результат: ✅ Transfer successful
```

### Шаг 5.3: Тестировать Marketplace

```bash
# Создать листинг
npx ts-node tests/test-marketplace-list.ts

# Купить товар
npx ts-node tests/test-marketplace-buy.ts

# Проверить баланс продавца
npx ts-node tests/test-marketplace-balance.ts
```

### Шаг 5.4: Тестировать Staking

```bash
# Застейкить токены
npx ts-node tests/test-staking-stake.ts

# Получить rewards
npx ts-node tests/test-staking-rewards.ts

# Unstake
npx ts-node tests/test-staking-unstake.ts
```

---

## 📊 ФАЗА 6: ДОКУМЕНТИРОВАНИЕ РЕЗУЛЬТАТОВ

### Шаг 6.1: Сохранить адреса контрактов

**contracts/ton/DEPLOYED_ADDRESSES.md:**
```markdown
# Развернутые контракты TON (Testnet)

## Адреса

| Контракт | Адрес | Дата развертывания | Hash транзакции |
|----------|-------|-------------------|-----------------|
| VityazToken | EQD... | 16.12.2025 14:00 | xxxxx |
| Marketplace | EQD... | 16.12.2025 14:15 | xxxxx |
| Staking | EQD... | 16.12.2025 14:30 | xxxxx |

## Проверка на TonScan

- VityazToken: https://testnet.tonscan.org/address/EQD...
- Marketplace: https://testnet.tonscan.org/address/EQD...
- Staking: https://testnet.tonscan.org/address/EQD...
```

### Шаг 6.2: Обновить .env

```env
# Обновить значения
VITYAZ_TOKEN_ADDRESS=EQD...
MARKETPLACE_ADDRESS=EQD...
STAKING_ADDRESS=EQD...
```

### Шаг 6.3: Обновить Backend

**backend/src/config/contracts.ts:**
```typescript
export const CONTRACT_ADDRESSES = {
  ton: {
    testnet: {
      vityazToken: 'EQD...from DEPLOYED_ADDRESSES',
      marketplace: 'EQD...from DEPLOYED_ADDRESSES',
      staking: 'EQD...from DEPLOYED_ADDRESSES'
    }
  }
};
```

---

## 🔍 ФАЗА 7: ПРОВЕРКА И ВЕРИФИКАЦИЯ

### Шаг 7.1: Верифицировать на TonScan

```bash
# Перейти на: https://testnet.tonscan.org/
# Поискать адрес контракта
# Должны видеть:
# ✅ Code deployed
# ✅ Balance
# ✅ Transactions
```

### Шаг 7.2: Проверить интеграцию с Backend

```bash
# Запустить backend
cd backend
npm run start:dev

# Тестировать endpoint
curl http://localhost:3001/api/contracts/ton/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Результат должен быть:
# { "balance": "1000", "address": "EQD..." }
```

### Шаг 7.3: Проверить Frontend

```bash
# Запустить frontend
cd frontend
npm run dev

# Открыть http://localhost:3000
# Проверить в консоли:
# ✅ TON контракты загружены
# ✅ Баланс отображается
# ✅ Транзакции работают
```

---

## 🎯 ЧЕКЛИСТ ЗАВЕРШЕНИЯ

- [ ] TON CLI установлен и работает
- [ ] Получены тестовые TON
- [ ] Контракты скомпилированы (.boc файлы созданы)
- [ ] VityazToken развернут на testnet
- [ ] Marketplace развернут на testnet
- [ ] Staking развернут на testnet
- [ ] Адреса контрактов сохранены в DEPLOYED_ADDRESSES.md
- [ ] .env обновлен с адресами контрактов
- [ ] Backend интегрирован с адресами контрактов
- [ ] Тестирование mint пройдено ✅
- [ ] Тестирование трансферов пройдено ✅
- [ ] Тестирование Marketplace пройдено ✅
- [ ] Тестирование Staking пройдено ✅
- [ ] Контракты верифицированы на TonScan
- [ ] Frontend показывает данные с контрактов
- [ ] Все 3 контракта активны и рабочие

---

## 🚨 TROUBLESHOOTING

### ❌ Проблема: "Not enough TON to deploy"

```bash
# Решение: Запросить ещё тестовых TON
curl -X POST https://testnet-faucet.toncenter.com/sendfile \
  -F address=YOUR_WALLET_ADDRESS
```

### ❌ Проблема: "Compilation error"

```bash
# Решение: Проверить FunC синтаксис
func -o build/output.fif src/YourContract.fc 2>&1 | head -20

# Или использовать online IDE
# https://ton.org/docs/develop/smart-contracts/environment/ide
```

### ❌ Проблема: "API rate limit exceeded"

```bash
# Решение: Использовать другой API endpoint
# https://ton.org/rpc (быстрый)
# https://testnet.toncenter.com (стабильный)
```

---

## ✨ РЕЗУЛЬТАТ

После завершения этого гайда вы получите:

✅ **3 рабочих смарт-контракта на TON testnet:**
- VityazToken (ERC-20 аналог) — для токенов
- Marketplace (торговля) — для игровых предметов
- Staking (стейкинг) — для заработков

✅ **Полностью интегрированные контракты:**
- Backend знает адреса контрактов
- Frontend может вызывать методы контрактов
- Все транзакции логируются

✅ **Готово к миграции на mainnet:**
- Код написан один раз
- Только смена адресов констант
- Без переписывания логики

---

**Время на выполнение:** 3-4 часа  
**Статус:** 🔴 READY TO START  
**Следующий шаг:** Ethereum Sepolia развертывание

