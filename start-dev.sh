#!/bin/bash

# Kill any existing processes
kill $(lsof -t -i:3000) 2>/dev/null || true
kill $(lsof -t -i:5173) 2>/dev/null || true
kill $(lsof -t -i:3001) 2>/dev/null || true

sleep 2

# Start Backend
echo "Starting Backend..."
cd backend
npm install
npm run start:dev &
BACKEND_PID=$!

sleep 3

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
npm install
npm run dev
