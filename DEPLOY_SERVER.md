# Продовый деплой на VPS (Ubuntu 20.04/22.04) — PM2 + Nginx (без Docker)

Ниже пошаговые команды, которые можно копи‑пастить. Предполагается домен `киношоу.рф` и приложение из папки `web/`.

## 1) Подготовка сервера

```bash
# 1. Обновления и базовые пакеты
sudo apt update && sudo apt -y upgrade
sudo apt -y install curl git ufw

# 2. Swap (1 ГБ)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo swapon -a

# 3. Node.js LTS + PM2
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2

# 4. Nginx + certbot
sudo apt -y install nginx
sudo apt -y install certbot python3-certbot-nginx

# 5. Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 2) PostgreSQL на этом VPS (локальная БД)

Если база данных должна работать на этом же сервере, установите PostgreSQL и создайте пользователя/БД для приложения.

```bash
# 1. Установка PostgreSQL
sudo apt -y install postgresql postgresql-contrib

# 2. Включаем автозапуск и проверяем статус
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql --no-pager

# 3. Создаём пользователя и БД (ЗАМЕНИТЕ ПАРОЛЬ!)
sudo -u postgres psql <<'SQL'
CREATE ROLE app WITH LOGIN PASSWORD 'change-me-strong';
ALTER ROLE app CREATEDB;
CREATE DATABASE appdb OWNER app;
GRANT ALL PRIVILEGES ON DATABASE appdb TO app;
SQL

# 4. Проверяем подключение
psql "postgresql://app:change-me-strong@localhost:5432/appdb" -c "SELECT current_database(), current_user;"

# 5. (Опционально) Базовая настройка памяти под 2 ГБ RAM
PGCONF=$(dirname $(pg_lsclusters -h | awk 'NR==2{print $6}'))/postgresql.conf
sudo sed -i 's/^#*shared_buffers.*/shared_buffers = 256MB/' "$PGCONF"
sudo sed -i 's/^#*work_mem.*/work_mem = 8MB/' "$PGCONF"
sudo sed -i 's/^#*maintenance_work_mem.*/maintenance_work_mem = 64MB/' "$PGCONF"
sudo sed -i 's/^#*effective_cache_size.*/effective_cache_size = 768MB/' "$PGCONF"
sudo systemctl restart postgresql
```

Пример строки подключения для локальной БД:

```
DATABASE_URL="postgresql://app:change-me-strong@localhost:5432/appdb?schema=public"
```

## 3) Развёртывание кода

```bash
# Рекомендуемая структура
sudo mkdir -p /var/www/kino
sudo chown -R $USER:$USER /var/www/kino
cd /var/www/kino

# Скопируйте файлы проекта (папку web) сюда
# например, через git clone или rsync/scp из локальной машины
# git clone ... && cd web

cd web
npm ci
npm run build
```

## 4) Переменные окружения

Создайте файл `.env` в `web/` на сервере (НЕ коммитьте в git). Шаблон лежит в `deploy/.env.production.sample`.

Обязательно:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
NEXTAUTH_SECRET=<длинная_случайная_строка>
NEXTAUTH_URL=https://киношоу.рф
# только на первый запуск для сидирования
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-please
```
Сгенерировать секрет:
```bash
openssl rand -base64 48 | tr -d '\n'
```

## 5) Prisma миграции и seed
```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
# затем удалите ADMIN_* из .env
sed -i '/^ADMIN_EMAIL=/d' .env
sed -i '/^ADMIN_PASSWORD=/d' .env
```

## 6) PM2

В репозитории есть `ecosystem.config.cjs`.
```bash
pm2 start ecosystem.config.cjs --time
pm2 save
pm2 startup    # следуйте инструкции, чтобы зафиксировать автозапуск
```

Проверка:
```bash
pm2 status
curl -I http://127.0.0.1:3000/
```

## 7) Nginx и SSL

Скопируйте пример конфига `deploy/nginx.conf.example` в `/etc/nginx/sites-available/kino.conf`, подставьте домен и путь.
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/kino.conf
sudo ln -s /etc/nginx/sites-available/kino.conf /etc/nginx/sites-enabled/kino.conf
sudo nginx -t && sudo systemctl reload nginx
```
Выпустите сертификат:
```bash
sudo apt -y install idn2
# Примечание: для кириллических доменов certbot/некоторые утилиты ожидают punycode.
# Получить punycode: idn2 киношоу.рф  (например, xn--80aaaknhd0apj1a.xn--p1ai)
sudo certbot --nginx -d $(idn2 киношоу.рф) -d $(idn2 www.киношоу.рф) --agree-tos -m admin@киношоу.рф --redirect
```

## 8) DNS на Reg.ru

В зоне домена:
- `@` → A → 83.166.247.31
- `www` → CNAME → `@` (или A на тот же IP)

Подождите 5–30 минут до распространения.

## 9) Обновления релизов
```bash
cd /var/www/kino/web
git pull
npm ci
npm run build
npx prisma migrate deploy
pm2 reload kino-web
```

## 10) Траблшутинг
- Логи приложения: `pm2 logs kino-web`
- Логи Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- Проверка сертификатов: `sudo certbot renew --dry-run`

```
Стек проекта: Next.js 15, NextAuth, Prisma/Postgres. Конфиги: next.config.ts, prisma/schema.prisma, middleware.ts. Скрипты: npm run build / start, prisma migrate deploy, db:seed.
```
