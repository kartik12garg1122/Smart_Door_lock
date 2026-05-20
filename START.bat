@echo off
title Shalimar Security — Launcher
color 0A

echo.
echo  =====================================================
echo   SHALIMAR SECURITY — Starting All Services...
echo  =====================================================
echo.

:: ── 1. Start the Python/Flask backend in its own window ──
echo  [1/2] Starting Python backend (Flask on port 5000)...
start "Shalimar Backend" cmd /k "cd /d "%~dp0Python_Server" && python app.py"

:: ── Give Flask 3 seconds to initialise before Vite tries to proxy ──
timeout /t 3 /nobreak > nul

:: ── 2. Start the Vite dev server in its own window ──
echo  [2/2] Starting Vite frontend (port 5173)...
start "Shalimar Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

:: ── 3. Wait a little then open the browser ──
timeout /t 4 /nobreak > nul
echo.
echo  Opening browser at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo  Both servers are running. Close this window safely.
echo  To stop: close the "Shalimar Backend" and "Shalimar Frontend" windows.
pause
