#!/bin/bash
# Start both server and client for Yori Web App
# Usage: ./dev.sh

echo "Starting Yori Web App..."
echo ""

echo "[1/2] Starting server (port 3001)..."
cd "$(dirname "$0")/server" && npm run dev &
SERVER_PID=$!

echo "[2/2] Starting client (port 3000)..."
cd "$(dirname "$0")/client" && npm run dev &
CLIENT_PID=$!

echo ""
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"
echo "Press Ctrl+C to stop both."

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait
