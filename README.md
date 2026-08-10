# Trade Union Learning Platform

Учебная платформа для курса **«Младшая медсестра по уходу за больными»**.

Лекции → закрепление карточками → тесты с оценкой → работа над ошибками. Mobile + desktop.

## Демо (основной канал)

Публикация на **GitHub Pages** — рабочий продукт без отдельного хостинга:

`https://<user>.github.io/trade-union-test-online/`

- Прогресс и результаты тестов хранятся локально в браузере
- В меню: **«Открыть демо админки»**
- Каталог тестов: итоговый + уход + первая помощь + лекарства/инъекции

## Возможности

- Обучение по модулям и урокам
- Flashcards и повторение
- Несколько тестов с объяснениями и шкалой оценок 2–5
- PWA (установка на телефон)
- PHP API (опционально, для production с сервером и MySQL)

## Стек

| Слой | Технология |
|------|------------|
| Web | React 19 + TypeScript + Vite + PWA |
| Demo | GitHub Pages (статическая сборка) |
| API (опционально) | PHP 8.2+ (PDO) + MySQL |

## Быстрый старт (локально)

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

Сборка под Pages:

```bash
npm run build:demo
npm run preview
```

### API (опционально)

```bash
cp apps/api/.env.example apps/api/.env
php apps/api/bin/seed.php
php apps/api/bin/create-admin.php --login=admin --password='ChangeMe123!'
npm run api:serve
```

## Структура репозитория

```
apps/web/          # SPA ученика и админа
apps/api/          # PHP API (опционально для shared hosting)
packages/          # Общие схемы курса
content/course/    # Курс + банки тестов
docs/              # Деплой, админка, безопасность
```

## Документация

- [Деплой](docs/DEPLOYMENT.md)
- [Руководство администратора](docs/ADMIN_GUIDE.md)
- [Работа с контентом](docs/CONTENT_GUIDE.md)
- [Changelog](CHANGELOG.md)

## Лицензия

Proprietary / All Rights Reserved. См. [LICENSE](LICENSE).

© 2026 Trade Union Learning Platform
