@echo off
setlocal
cd /d "%~dp0"

docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not ready. Start Docker Desktop in Linux containers mode and try again.
    goto :fail
)

if not exist ".env" (
    echo Create .env using .env.docker.example and set your backend URL.
    goto :fail
)

set "DOCKER_IMAGE=dream-house-front-ts:local"
docker compose up -d --build --wait frontend
if errorlevel 1 goto :fail

echo.
echo Frontend is running. Default URL: http://localhost:8080
echo If FRONTEND_PORT is set in .env, use that port instead.
echo Stop: docker compose down
pause
exit /b 0

:fail
echo.
echo Local startup failed. See the error above.
pause
exit /b 1
