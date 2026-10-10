@echo off
setlocal
cd /d "%~dp0"

rem Usage: docker-push.bat username [tag] [repository]
set "DOCKERHUB_USERNAME=%~1"
set "DOCKER_TAG=%~2"
set "DOCKER_REPOSITORY=%~3"
if not defined DOCKERHUB_USERNAME set /p "DOCKERHUB_USERNAME=Docker Hub username: "
if not defined DOCKER_TAG set /p "DOCKER_TAG=Image tag [latest]: "
if not defined DOCKER_TAG set "DOCKER_TAG=latest"
if not defined DOCKER_REPOSITORY set "DOCKER_REPOSITORY=dream-house-front-ts"

powershell -NoProfile -Command "if ($env:DOCKERHUB_USERNAME -cnotmatch '^[a-z0-9][a-z0-9_-]*$' -or $env:DOCKER_TAG -cnotmatch '^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$' -or $env:DOCKER_REPOSITORY -cnotmatch '^[a-z0-9]+([._-][a-z0-9]+)*$') { exit 1 }"
if errorlevel 1 (
    echo Invalid Docker Hub username, tag or repository name.
    goto :fail
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not ready. Start Docker Desktop in Linux containers mode and try again.
    goto :fail
)

if not exist ".env" (
    echo Create .env using .env.docker.example and set the target backend URL.
    goto :fail
)

set "DOCKER_IMAGE=%DOCKERHUB_USERNAME%/%DOCKER_REPOSITORY%:%DOCKER_TAG%"
docker compose build frontend
if errorlevel 1 goto :fail

echo.
echo Sign in to Docker Hub. Use a personal access token when prompted for a password.
docker login --username "%DOCKERHUB_USERNAME%"
if errorlevel 1 goto :fail

docker compose push frontend
if errorlevel 1 goto :fail

echo.
echo Published: %DOCKER_IMAGE%
echo Run on another machine: docker run -d --name dream-house-front -p 8080:80 --restart unless-stopped %DOCKER_IMAGE%
pause
exit /b 0

:fail
echo.
echo Publishing failed. See the error above.
pause
exit /b 1
