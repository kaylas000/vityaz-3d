#!/bin/bash

# VITYAZ Phase 1 Completion Checklist
# Verifies all Phase 1 tasks are complete

set -e

echo "✅ VITYAZ Phase 1 Completion Checklist"
echo "======================================="
echo ""

SCORE=0
TOTAL=10

# Check 1: Smart contracts deployed
echo "[1/10] Checking smart contracts..."
if grep -q "TON_TOKEN_ADDRESS" backend/.env 2>/dev/null; then
    echo "  ✅ Smart contracts deployed"
    ((SCORE++))
else
    echo "  ❌ Smart contracts NOT deployed"
fi

# Check 2: Graphics assets exist
echo "[2/10] Checking graphics assets..."
if [ -f "frontend/public/assets/sprites/player.png" ]; then
    echo "  ✅ Graphics assets found"
    ((SCORE++))
else
    echo "  ❌ Graphics assets missing"
fi

# Check 3: Unit tests exist
echo "[3/10] Checking unit tests..."
TEST_COUNT=$(find backend/src -name "*.spec.ts" | wc -l)
if [ "$TEST_COUNT" -gt 5 ]; then
    echo "  ✅ $TEST_COUNT test files found"
    ((SCORE++))
else
    echo "  ❌ Only $TEST_COUNT test files (need 5+)"
fi

# Check 4: Tests passing
echo "[4/10] Running tests..."
cd backend
if npm test &> /dev/null; then
    echo "  ✅ All tests passing"
    ((SCORE++))
else
    echo "  ❌ Some tests failing"
fi
cd ..

# Check 5: Error handling
echo "[5/10] Checking error handling..."
if grep -q "@Catch()" backend/src/**/*.ts 2>/dev/null; then
    echo "  ✅ Error handling implemented"
    ((SCORE++))
else
    echo "  ❌ Error handling missing"
fi

# Check 6: Logging setup
echo "[6/10] Checking logging..."
if grep -q "winston" backend/package.json 2>/dev/null; then
    echo "  ✅ Logging setup"
    ((SCORE++))
else
    echo "  ❌ Logging not setup"
fi

# Check 7: Docker running
echo "[7/10] Checking Docker services..."
if docker-compose ps | grep -q "Up"; then
    echo "  ✅ Docker services running"
    ((SCORE++))
else
    echo "  ❌ Docker services not running"
fi

# Check 8: Database migrations
echo "[8/10] Checking database..."
if docker exec vityaz-postgres psql -U postgres -d vityaz -c "\dt" &> /dev/null; then
    echo "  ✅ Database ready"
    ((SCORE++))
else
    echo "  ❌ Database not ready"
fi

# Check 9: Frontend builds
echo "[9/10] Checking frontend build..."
cd frontend
if npm run build &> /dev/null; then
    echo "  ✅ Frontend builds successfully"
    ((SCORE++))
else
    echo "  ❌ Frontend build failing"
fi
cd ..

# Check 10: Backend builds
echo "[10/10] Checking backend build..."
cd backend
if npm run build &> /dev/null; then
    echo "  ✅ Backend builds successfully"
    ((SCORE++))
else
    echo "  ❌ Backend build failing"
fi
cd ..

echo ""
echo "======================================="
echo "Score: $SCORE / $TOTAL"

if [ $SCORE -eq $TOTAL ]; then
    echo "🎉 PHASE 1 COMPLETE!"
    echo ""
    echo "You can now proceed to Phase 2:"
    echo "  - Frontend UI completion"
    echo "  - Ethereum deployment"
    echo "  - Solana deployment"
    echo "  - Telegram integration"
else
    echo "⚠️  Phase 1 incomplete. Please complete missing items."
    echo ""
    echo "Remaining tasks:"
    [ $SCORE -lt 1 ] && echo "  - Deploy smart contracts"
    [ $SCORE -lt 2 ] && echo "  - Add graphics assets"
    [ $SCORE -lt 3 ] && echo "  - Write unit tests"
    [ $SCORE -lt 4 ] && echo "  - Fix failing tests"
    [ $SCORE -lt 5 ] && echo "  - Implement error handling"
    [ $SCORE -lt 6 ] && echo "  - Setup logging"
    [ $SCORE -lt 7 ] && echo "  - Start Docker services"
    [ $SCORE -lt 8 ] && echo "  - Run database migrations"
    [ $SCORE -lt 9 ] && echo "  - Fix frontend build"
    [ $SCORE -lt 10 ] && echo "  - Fix backend build"
fi

echo ""