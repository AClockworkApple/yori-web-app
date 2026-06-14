@echo off
echo Starting Yori Web App...
echo.

echo [1/2] Starting server (port 3001)...
start "Yori Server" cmd /c "cd /d "%~dp0server" && npm run dev"

echo [2/2] Starting client (port 3000)...
start "Yori Client" cmd /c "cd /d "%~dp0client" && npm run dev"

echo.
echo Both started in separate windows. Close them to stop.
