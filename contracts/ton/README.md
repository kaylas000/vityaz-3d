# 🏗️ VITYAZ TON Smart Contracts

**Статус:** 🟡 In Development  
**Network:** TON Testnet (https://testnet.toncenter.com)  
**Contract Types:** Token, Marketplace, Staking

---

## 📋 Содержание

1. [Требования](#требования)
2. [Установка](#установка)
3. [Структура проекта](#структура-проекта)
4. [Деплоймент](#деплоймент)
5. [Тестирование](#тестирование)
6. [Troubleshooting](#troubleshooting)

---

## Требования

### Системные требования

- Node.js v18+
- npm v9+
- Git v2.40+

### TON Инструменты

```bash
# Check if installed
fift --version
func --version

# Or install (macOS)
brew install ton

# Or install (Linux)
wget https://github.com/ton-blockchain/ton/releases/download/v0.50.0/ton-linux-x86_64.tar.gz
tar -xzf ton-linux-x86_64.tar.gz
sudo cp ton/bin/* /usr/local/bin/
```

---

## Установка

### Шаг 1: Клонировать репозиторий

```bash
cd contracts/ton
```

### Шаг 2: Установить зависимости

```bash
npm install
```

### Шаг 3: Настроить .env

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Получить API ключ с https://toncenter.com/api/v2/
TON_API_KEY=your_api_key_here

# Создать новый кошелек или использовать существующий
WALLET_MNEMONIC=word1 word2 ... word24

# Остальные параметры (опционально)
NETWORK=testnet
WALLET_VERSION=v4r2
```

### Шаг 4: Получить тестовые TON

```bash
# 1. Узнать адрес кошелька
toncli wallet address my-wallet --testnet

# 2. Перейти на https://testnet-faucet.toncenter.com/
# 3. Вставить адрес и получить тестовые TON

# 4. Проверить баланс
toncli wallet balance my-wallet --testnet
```

---

## Структура проекта

```
contracts/ton/
├── src/                          # Исходные коды контрактов
│   ├── VityazToken.fc           # Основной токен контракт
│   ├── Marketplace.fc            # Торговля контракт
│   └── Staking.fc                # Стейкинг контракт
├── build/                        # Скомпилированные контракты
│   ├── VityazToken.boc
│   ├── Marketplace.boc
│   └── Staking.boc
├── deploy/                       # Скрипты развертывания
│   ├── deploy-token.ts          # Deploy VityazToken
│   ├── deploy-marketplace.ts     # Deploy Marketplace
│   └── deploy-staking.ts         # Deploy Staking
├── tests/                        # Тест-скрипты
│   ├── test-balance.ts
│   ├── test-mint.ts
│   └── test-transfer.ts
├── wrappers/                     # TypeScript обертки
│   ├── VityazTokenContract.ts
│   ├── MarketplaceContract.ts
│   └── StakingContract.ts
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Деплоймент

### Шаг 1: Скомпилировать контракты

```bash
# Скомпилировать VityazToken
func -o build/VityazToken.fif src/VityazToken.fc
fift -I+:{stdlib.fif} -s build/VityazToken.fif

# Скомпилировать Marketplace
func -o build/Marketplace.fif src/Marketplace.fc
fift -I+:{stdlib.fif} -s build/Marketplace.fif

# Скомпилировать Staking
func -o build/Staking.fif src/Staking.fc
fift -I+:{stdlib.fif} -s build/Staking.fif

# Проверить результаты
ls -la build/
# Должны быть .boc файлы:
# - VityazToken.boc
# - Marketplace.boc
# - Staking.boc
```

### Шаг 2: Запустить развертывание

```bash
# Deploy VityazToken
npm run deploy

# Deploy Marketplace
npm run deploy:marketplace

# Deploy Staking
npm run deploy:staking
```

### Шаг 3: Проверить адреса контрактов

После развертывания, адреса будут сохранены в:
- `deploy/vityaz-token-testnet-{timestamp}.json`
- `.env` файл обновится автоматически

### Шаг 4: Проверить на TonScan

```
https://testnet.tonscan.org/address/EQD_YOUR_CONTRACT_ADDRESS
```

---

## Тестирование

### Тест баланса

```bash
npm run test:balance
```

Проверит:
- ✅ Подключение к сети
- ✅ Получение баланса кошелька
- ✅ Чтение состояния контракта

### Тест mint

```bash
npm run test:mint
```

Проверит:
- ✅ Mint функцию
- ✅ Увеличение баланса
- ✅ События

### Тест transfer

```bash
npm run test:transfer
```

Проверит:
- ✅ Transfer функцию
- ✅ Изменение балансов
- ✅ Fee расчет

---

## Troubleshooting

### ❌ "Not enough TON to deploy"

```bash
# Решение: Получить еще тестовых TON
# https://testnet-faucet.toncenter.com/

# Или отправить TON с другого адреса
toncli transfer <from_address> <to_address> <amount>
```

### ❌ "Compilation error"

```bash
# Решение: Проверить синтаксис FunC
func -o build/output.fif src/YourContract.fc 2>&1 | head -20

# Или использовать online IDE
# https://ton.org/docs/develop/smart-contracts/environment/ide
```

### ❌ "API connection failed"

```bash
# Решение: Проверить API ключ
echo $TON_API_KEY

# Или использовать публичный RPC
# https://ton.org/rpc (быстрый)
# https://testnet.toncenter.com (стабильный)
```

### ❌ "Contract not found"

```bash
# Решение: Проверить адрес на TonScan
# https://testnet.tonscan.org/

# И убедиться, что он активирован
# (имеет код и состояние)
```

---

## 📚 Дополнительные ресурсы

- [TON Documentation](https://ton.org/docs/)
- [TON FunC Guide](https://ton.org/docs/develop/smart-contracts/language/func/)
- [TonScan Explorer](https://testnet.tonscan.org/) (Testnet)
- [TON Center API](https://toncenter.com/api/v2/)
- [TON Community](https://t.me/toncoin)

---

## 🚀 Следующие шаги

1. ✅ Развернуть контракты на testnet
2. ⏳ Развернуть на mainnet (когда готово)
3. ⏳ Интегрировать с Backend API
4. ⏳ Интегрировать с Frontend

---

## 📝 Лицензия

MIT

---

**Последнее обновление:** 16.12.2025  
**Версия:** 1.0.0  
**Статус:** 🟡 Development Ready
