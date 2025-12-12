#!/bin/bash

# VITYAZ Test Execution Script

set -e

echo "🧪 VITYAZ Test Suite"
echo "===================="
echo ""

# Backend tests
echo "📝 Running backend tests..."
cd backend
npm test -- --coverage

if [ $? -eq 0 ]; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
    exit 1
fi

echo ""
# Frontend tests
echo "📝 Running frontend tests..."
cd ../frontend
npm test -- --coverage

if [ $? -eq 0 ]; then
    echo "✅ Frontend tests passed"
else
    echo "❌ Frontend tests failed"
    exit 1
fi

echo ""
echo "📊 Coverage Report"
echo "=================="
echo "Backend coverage:"
cat ../backend/coverage/coverage-summary.json
echo ""
echo "Frontend coverage:"
cat coverage/coverage-summary.json

echo ""
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "  1. Review coverage reports in coverage/ directories"
echo "  2. Add more tests for uncovered code"
echo "  3. Target 80%+ coverage before production"
echo ""