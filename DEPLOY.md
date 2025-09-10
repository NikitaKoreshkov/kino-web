# Быстрый запуск и деплой

## Локальный запуск (c Docker Postgres)

1) Поднимите БД:
```
docker compose up -d
```
Postgres доступен на: `postgres://app:app@localhost:5432/appdb`.

2) Создайте файл `.env` в `web/`:
```
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
NEXTAUTH_SECRET="replace_with_strong_secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-please"
NEXTAUTH_URL="http://localhost:3000"
```

3) Установите зависимости:
```
npm install
```

4) Сгенерируйте Prisma Client и примените миграции:
```
npx prisma generate
npx prisma migrate dev --name init
```

5) Засейте первого администратора:
```
npm run db:seed
```

6) Запустите приложение:
```
npm run dev
```

7) Вход в админку:
- Перейдите на http://localhost:3000/admin/login
- Введите `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## Продовый деплой (любой хостинг)

1) Создайте Postgres БД у провайдера и получите `DATABASE_URL`.
2) Добавьте в переменные окружения приложения:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
NEXTAUTH_SECRET=случайная_длинная_строка
NEXTAUTH_URL=https://your-domain.com
# разово для сидирования
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-please
```
3) На стадии сборки/старта выполните:
```
npx prisma generate
npx prisma migrate deploy
npm run db:seed   # один раз, затем удалите переменные ADMIN_*
```

### Подсказки по платформам
- Vercel: "Install" (npm i), затем в "Build Command" можно добавить `prisma generate`; миграции применить в отдельном шаге (CI) или через `prisma migrate deploy` в пост-инсталле. Укажите `NEXTAUTH_URL`.
- Docker: добавьте Dockerfile и (опц.) compose для приложения; БД может быть внешней или отдельным сервисом.

---

## Безопасность
- Пароль хранится как Argon2id-хеш (`User.passwordHash`).
- Доступ к `/admin/*` только для авторизованных (см. `middleware.ts`).
- Секреты — только в переменных окружения.
