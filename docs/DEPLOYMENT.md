# Деплой

## Production (Timeweb / Beget shared hosting)

### Требования
- PHP 8.2+
- MySQL 5.7+ / 8.x
- HTTPS (Let's Encrypt)
- Возможность указать Document Root

### Шаги

1. Создайте сайт и базу MySQL в панели хостинга.
2. Скопируйте `apps/api` на сервер (например в `~/api`).
3. Соберите фронтенд:

```bash
npm ci
VITE_APP_MODE=production VITE_API_URL=https://your-domain.ru/api npm run build --workspace=web
```

4. Залейте `apps/web/dist/*` в Document Root сайта.
5. Настройте rewrite: все `/api/*` → `apps/api/public/index.php`.
6. Скопируйте `.env.example` → `.env` и заполните:

```
APP_ENV=production
APP_URL=https://your-domain.ru
APP_KEY=сгенерируйте-длинную-строку
DB_DRIVER=mysql
DB_HOST=localhost
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
SPA_ORIGIN=https://your-domain.ru
SESSION_SECURE=true
```

7. Импортируйте схему:

```bash
mysql -u USER -p DB < apps/api/database/schema.sql
php apps/api/bin/seed.php
php apps/api/bin/create-admin.php --login=admin --password='...'
```

8. Проверьте `https://your-domain.ru/api/health`.

### Apache example (.htaccess в корне сайта)

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ /api/public/index.php [QSA,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## GitHub Pages (основной канал)

Workflow `.github/workflows/pages.yml` собирает SPA с `VITE_APP_MODE=demo` из корня monorepo (`npm ci` + `npm run build:demo`) и публикует `apps/web/dist`.

Демо **не** содержит реальных приглашений, паролей и PII. Прогресс и результаты тестов хранятся в `localStorage` браузера.

Каталог тестов: итоговый экзамен + промежуточные банки (уход, первая помощь, лекарства/инъекции).

## Домен

После покупки домена укажите A/NS записи хостинга и включите бесплатный SSL в панели.
