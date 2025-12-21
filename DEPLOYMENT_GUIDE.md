# VITYAZ Special Operations - Deployment Guide

## Локальное тестирование (Development)

### Предварительные требования
- Node.js 18+
- npm или pnpm

### Шаги запуска

```bash
# 1. Установить зависимости
cd frontend
npm install

# 2. Запустить dev сервер
npm run dev

# Сервер будет доступен на http://localhost:5173
```

## Тестирование

```bash
# Запустить все тесты
npm test

# Запустить с покрытием
npm test -- --coverage

# Запустить лизер
npm run lint

# Проверить типы TypeScript
npm run type-check
```

## Production Build

```bash
# Собрать production версию
cd frontend
npm run build

# Вывод будет в папке dist/
```

## Деплой вариант 1: Vercel (Рекомендуется для быстрого старта)

### Шаги:

1. Установить Vercel CLI:
```bash
npm install -g vercel
```

2. Залогиться на Vercel:
```bash
vercel login
```

3. Развернуть проект:
```bash
vercel --prod
```

### Получение переменных окружения

Для GitHub Actions CI/CD нужны:
- `VERCEL_TOKEN` - токен для деплоя
- `VERCEL_ORG_ID` - ID организации
- `VERCEL_PROJECT_ID` - ID проекта

Получить можно из файла `.vercel/project.json` после первого деплоя.

## Деплой вариант 2: Docker

### Локальное тестирование с Docker

```bash
# Собрать Docker образ
docker build -t vityaz:latest .

# Запустить контейнер
docker run -p 3000:3000 vityaz:latest

# Сервер будет доступен на http://localhost:3000
```

### Docker Compose

```bash
# Запустить с docker-compose
docker-compose up -d

# Проверить логи
docker-compose logs -f

# Остановить
docker-compose down
```

## Деплой вариант 3: VPS (DigitalOcean, Linode, и т.д.)

### Требования:
- Ubuntu 20.04+
- Docker и Docker Compose
- Nginx (reverse proxy)

### Шаги:

1. SSH на VPS:
```bash
ssh root@your-vps-ip
```

2. Установить Docker и Docker Compose:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. Клонировать репозиторий:
```bash
git clone https://github.com/kaylas000/vityaz.git /opt/vityaz
cd /opt/vityaz
```

4. Запустить с Docker Compose:
```bash
docker-compose up -d
```

5. Установить Nginx:
```bash
sudo apt update
sudo apt install nginx
```

6. Создать конфиг Nginx:
```bash
sudo nano /etc/nginx/sites-available/vityaz
```

Вставить:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. Включить конфиг и перезагрузить Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/vityaz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. Установить SSL (Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## GitHub Actions CI/CD

Проект уже имеет настроенный GitHub Actions workflow (`.github/workflows/deploy.yml`).

Для включения:

1. Перейдите на GitHub репозиторий
2. Settings → Secrets and variables → Actions
3. Добавьте secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

После этого при каждом push на `main` ветку будет:
- Запущены тесты
- Собран проект
- Автоматически развернут на Vercel

## Мониторинг и логирование

### Docker логи
```bash
docker-compose logs -f vityaz-game
```

### VPS логи (Nginx)
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Healthcheck
```bash
curl http://localhost:3000
```

## Troubleshooting

### Ошибка: Port already in use
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>
```

### Ошибка: Build failed
```bash
# Очистить node_modules
rm -rf node_modules package-lock.json
npm install
```

### Docker image не собирается
```bash
# Пересобрать без кеша
docker build --no-cache -t vityaz:latest .
```

