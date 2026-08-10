# Trade Union LMS API

Lean PHP 8.2+ API for Timeweb shared hosting. The controller/service/repository/
middleware layout and PSR-4 namespace intentionally mirror Laravel conventions,
making a later framework migration straightforward. Composer is recommended; a
fallback autoloader permits deployment when Composer is unavailable remotely.

## Requirements and local setup

PHP needs PDO MySQL, JSON, mbstring, and Argon2 support. Create a MySQL database,
then:

```bash
cd apps/api
cp .env.example .env
# Edit .env with local database credentials and set SESSION_SECURE=false for HTTP.
composer install
php bin/seed.php
php bin/create-admin.php --login=admin --password='ChangeMe123!'
php -S 127.0.0.1:8080 -t public public/index.php
```

Check `GET http://127.0.0.1:8080/api/health`. Run `php tests/smoke.php` or
`composer test`. Generate `APP_KEY` with:

```bash
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

## Security and authentication

Passwords use Argon2id. Session, CSRF, and invite values are random opaque tokens
whose hashes are stored in MySQL. Cookies are HttpOnly, Secure, and SameSite=Lax.
The SPA origin is an exact CORS allow-list entry. Authentication endpoints use a
lock-safe file rate limiter.

Typical flow:

1. Log in, then fetch `GET /api/auth/csrf`.
2. Send the returned token in `X-CSRF-Token` for every mutation.
3. An admin creates an invite; its plaintext code is returned once.
4. A student registers with `login`, `name`, `password`, and `invite_code`.

## Main routes

- Auth: `/api/auth/login`, `/register`, `/logout`, `/me`, `/csrf`
- Courses: `GET /api/courses`, `GET /api/courses/{id}`
- Progress: `GET /api/progress`, lesson update, card mastery, and quiz submission
- Invites: `GET|POST /api/admin/invites`, `POST /api/admin/invites/{id}/revoke`
- Analytics: `/api/admin/analytics`, `/api/admin/students/{id}`
- Import/export: `POST /api/courses/import`, `GET /api/courses/{id}/export` (admin)
- CMS CRUD: `POST /api/admin/cms/{entity}` and
  `PATCH|DELETE /api/admin/cms/{entity}/{id}`

CMS entities are `courses`, `modules`, `lessons`, `blocks`, `flashcards`,
`questions`, and `options`. Import accepts the same nested course hierarchy that
export returns. Publication statuses are `draft`, `published`, and `needs_review`.
Student responses never include correct-answer flags.

## Timeweb deployment

1. Upload the project and point the domain document root to `apps/api/public`.
2. Keep `.env`, `database`, and `bin` outside the public document root.
3. Set production MySQL credentials, the exact `SPA_ORIGIN`, a random `APP_KEY`,
   `APP_DEBUG=false`, and `SESSION_SECURE=true`.
4. Run `composer install --no-dev --optimize-autoloader` locally before uploading
   if Composer is unavailable on the host.
5. Import `database/schema.sql` and `database/seed.sql` with phpMyAdmin, or run
   `php bin/seed.php` over SSH. Then create the first admin with the CLI command.

Apache rewriting and security headers are included in `public/.htaccess`. For
Nginx, configure `try_files $uri $uri/ /index.php?$query_string;`.
