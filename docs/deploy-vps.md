# Deploy on VPS

Этот набор файлов рассчитан на VPS, где основной nginx уже живет отдельно и проксирует запросы в контейнеры по общей Docker-сети.

## Что лежит в ветке

- `compose.deploy.yml` — поднимает приложение как отдельный контейнер.
- `deploy/.env.example` — переменные для compose.
- `deploy/nginx/rabbit-detector.conf` — шаблон server-блока для существующего nginx.
- `deploy/.gitignore` — не дает случайно закоммитить `deploy/secrets/.htpasswd`.

## Почему порт 2532 открывать не нужно

Рекомендуемая схема такая:

1. Внешний трафик приходит только на основной nginx.
2. Основной nginx проксирует в контейнер `rabbit-detector` по общей Docker-сети.
3. Сам контейнер приложения наружу отдельный порт не публикует.

При такой схеме порт `2532` не используется и в firewall его открывать не надо.

## Что нужно на VPS один раз

1. Должна существовать общая внешняя Docker-сеть для reverse proxy, по умолчанию `proxy`.
2. Контейнер со стеком nginx должен быть подключен к этой сети.
3. В nginx-конфиг нужно добавить `deploy/nginx/rabbit-detector.conf`, заменив домен на реальный.

Создать сеть, если ее еще нет:

```bash
docker network create proxy
```

## Подготовка приложения на VPS

```bash
git clone -b deploy <YOUR_REPO_URL> rabbit-detector
cd rabbit-detector
cp deploy/.env.example deploy/.env
mkdir -p deploy/secrets
htpasswd -cB deploy/secrets/.htpasswd rabbit-admin
docker compose --env-file deploy/.env -f compose.deploy.yml build
docker compose --env-file deploy/.env -f compose.deploy.yml up -d
docker compose --env-file deploy/.env -f compose.deploy.yml ps
docker compose --env-file deploy/.env -f compose.deploy.yml logs -f
```

Если `htpasswd` не установлен:

```bash
sudo apt update
sudo apt install -y apache2-utils
```

## Подключение к существующему nginx-стеку

В compose-файле nginx-стека должен быть доступ к той же внешней сети:

```yaml
services:
  nginx:
    networks:
      - proxy

networks:
  proxy:
    external: true
```

После этого:

1. Скопируй `deploy/nginx/rabbit-detector.conf` в папку с конфигами nginx на VPS.
2. Замени `rabbit.example.com` на свой домен.
3. Перезапусти nginx-стек.

Пример команды:

```bash
docker compose up -d
```

## Проверка

Проверка healthcheck из контейнера приложения:

```bash
docker exec rabbit-detector wget -q -O - http://127.0.0.1/healthz
```

Проверка по домену после проксирования:

```bash
curl -I http://rabbit.example.com
```

Ожидаемо приложение попросит логин и пароль, потому что basic auth остается включенной.

## Если все-таки нужен прямой порт 2532

Это не основной вариант, но можно временно открыть приложение напрямую:

1. Добавь в сервис `rabbit-detector` публикацию порта `2532:80`.
2. Разреши порт в firewall.

Например:

```bash
sudo ufw allow 2532/tcp
```

Но в обычной схеме за reverse proxy этого делать не нужно.
