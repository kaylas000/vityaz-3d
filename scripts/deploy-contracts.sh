#!/bin/bash

# VITYAZ Smart Contract Deployment Script
# This script deploys all contracts to TON testnet

set -e

echo "🚀 VITYAZ Contract Deployment to TON Testnet"
echo "============================================="
echo ""

# Check if TON CLI is installed
if ! command -v fift &> /dev/null; then
    echo "❌ TON tools not installed. Installing..."
    # Installation instructions
    echo "Please install TON tools:"
    echo "  macOS: brew install ton"
    echo "  Linux: wget https://ton.org/download && chmod +x install.sh && ./install.sh"
    exit 1
fi

echo "✅ TON tools found"

# Navigate to contracts directory
cd "$(dirname "$0")/../contracts/ton" || exit 1

echo ""
echo "📝 Step 1: Compiling VityazToken.fc"
fift -s compile.fif VityazToken.fc
if [ $? -eq 0 ]; then
    echo "✅ VityazToken compiled successfully"
else
    echo "❌ VityazToken compilation failed"
    exit 1
fi

echo ""
echo "📝 Step 2: Deploying VityazToken to testnet"
# Replace with actual deployment command
echo "tonlib deploy testnet VityazToken.boc"
echo "⚠️  Manual step: Run the command above and paste the contract address below"
read -p "VityazToken address: " TOKEN_ADDRESS

echo ""
echo "📝 Step 3: Compiling Marketplace.fc"
fift -s compile.fif Marketplace.fc
if [ $? -eq 0 ]; then
    echo "✅ Marketplace compiled successfully"
else
    echo "❌ Marketplace compilation failed"
    exit 1
fi

echo ""
echo "📝 Step 4: Deploying Marketplace to testnet"
echo "tonlib deploy testnet Marketplace.boc"
echo "⚠️  Manual step: Run the command above and paste the contract address below"
read -p "Marketplace address: " MARKETPLACE_ADDRESS

echo ""
echo "📝 Step 5: Compiling Staking.func"
fift -s compile.fif Staking.func
if [ $? -eq 0 ]; then
    echo "✅ Staking compiled successfully"
else
    echo "❌ Staking compilation failed"
    exit 1
fi

echo ""
echo "📝 Step 6: Deploying Staking to testnet"
echo "tonlib deploy testnet Staking.boc"
echo "⚠️  Manual step: Run the command above and paste the contract address below"
read -p "Staking address: " STAKING_ADDRESS

echo ""
echo "📝 Step 7: Updating .env file"
cd ../../backend || exit 1

# Backup existing .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%s)
fi

# Update .env with contract addresses
cat >> .env << EOF

# TON Testnet Contract Addresses (Deployed $(date))
TON_NETWORK=testnet
TON_TOKEN_ADDRESS=$TOKEN_ADDRESS
TON_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS
TON_STAKING_ADDRESS=$STAKING_ADDRESS
EOF

echo "✅ .env updated with contract addresses"

echo ""
echo "============================================="
echo "🎉 Contract Deployment Complete!"
echo "============================================="
echo ""
echo "Contract Addresses:"
echo "  VityazToken:  $TOKEN_ADDRESS"
echo "  Marketplace:  $MARKETPLACE_ADDRESS"
echo "  Staking:      $STAKING_ADDRESS"
echo ""
echo "Next steps:"
echo "  1. Verify contracts on TON explorer"
echo "  2. Test token transfers"
echo "  3. Run integration tests"
echo "  4. Update frontend config"
echo ""
echo "View on TON Testnet Explorer:"
echo "  https://testnet.tonscan.org/address/$TOKEN_ADDRESS"
echo ""