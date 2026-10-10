# Docker

## Локальный запуск

1. Запустите Docker Desktop в режиме Linux containers.
2. В корне проекта должен быть `.env` с действующим `VITE_API_URL`, `VITE_REPORTS_URL`. Существующий файл подходит. Образец дополнительных настроек — `.env.docker.example`.
3. Дважды щёлкните `docker-local.bat` или выполните его в терминале.
4. Откройте http://localhost:8080. Для другого порта задайте `FRONTEND_PORT` в `.env`.

Скрипт собирает образ `dream-house-front-ts:local`, запускает контейнер в фоне и ждёт успешной проверки состояния. Изменения исходников требуют повторного запуска скрипта.

Команды из папки проекта:

```powershell
docker compose logs -f frontend
docker compose down
```

## Отправка в Docker Hub

Запустите `docker-push.bat`: он запросит имя пользователя Docker Hub и тег (`latest` по умолчанию). Либо передайте параметры:

```powershell
.\docker-push.bat YOUR_USERNAME v1.0.0
# Необязательный третий параметр — имя репозитория:
.\docker-push.bat YOUR_USERNAME v1.0.0 my-frontend
```

Скрипт соберёт образ, выполнит `docker login` и отправит его в Docker Hub. По умолчанию имя образа — `YOUR_USERNAME/dream-house-front-ts:TAG`. Аккаунт должен иметь право записи в выбранный репозиторий. Если Docker Hub запрашивает пароль, можно использовать персональный токен доступа.

Для запуска опубликованного образа на другом компьютере:

```powershell
docker run -d --name dream-house-front -p 8080:80 --restart unless-stopped YOUR_USERNAME/dream-house-front-ts:v1.0.0
```

Для закрытого репозитория сначала выполните `docker login` на этом компьютере. Образ собирается для архитектуры текущего Docker Engine.

## Настройки сборки

Используется Node.js 22 и `yarn.lock`; готовую сборку обслуживает Nginx. Вложенные маршруты React Router открываются через `index.html`. Проверка состояния доступна по `/healthz`.

Compose читает `.env` и передаёт `VITE_API_URL`, `VITE_REPORTS_URL`, `VITE_SOCKET_URL`, `VITE_SOCKET_PATH` в сборку. Сам `.env` исключён из контекста Docker. Значения `VITE_*` входят в клиентский JavaScript: изменение адреса API или WebSocket требует пересборки образа. Перед публикацией укажите адрес backend для целевого окружения. Передача `docker run -e VITE_API_URL=...` уже собранный frontend не изменит.

В контейнер входит только frontend. Backend должен быть доступен браузеру и разрешать запросы с адреса frontend через CORS. `localhost` в URL API означает компьютер, на котором открыт браузер. По умолчанию WebSocket использует origin адреса API и путь `/socket.io`.

Документация: [параметры Compose из .env](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), [развёртывание сборки Vite](https://vite.dev/guide/static-deploy).
