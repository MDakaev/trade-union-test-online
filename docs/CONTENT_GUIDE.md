# Работа с контентом

## Источники

Исходные PDF/DOCX лежат в корне репозитория. Тексты извлечены в `extracted/`, каталог — `index/CATALOG.md`.

## Формат курса

`content/course/course.json` — канонический экспорт:
- modules, lessons, blocks, flashcards, questions
- provenance: источник файла/страницы
- status: `draft` | `published` | `needs_review`

Схема: `packages/course-schema/course.schema.json`

## Импорт в production

```bash
php apps/api/bin/import-course.php content/course/course.json
```

Или через админку: **Материалы → Импорт**.

## OCR

Сканы без текста:
- `Клизмы.pdf`
- `Постановка компресса.pdf`
- `нательного белья)..pdf`
- частично `волосами. Кормление. Пролежни)..pdf`

Скрипт: `scripts/ocr_pdfs.swift` (Apple Vision). Результаты — `content/ocr/`.

Материалы после OCR помечаются `needs_review` до утверждения преподавателем.

## Ответы теста

Ключ: `content/course/ANSWER_KEY.md`  
JSON: `content/course/questions.json`

Спорные вопросы (лаборатория, реанимация, OCR-процедуры) имеют `status: needs_review`.
