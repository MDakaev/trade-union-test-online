# OCR

PDF без извлекаемого текста:
1. Клизмы.pdf
2. Постановка компресса.pdf
3. нательного белья)..pdf
4. частично волосами. Кормление. Пролежни)..pdf

Скрипт: `scripts/ocr_pdfs.swift` (Apple Vision / PDFKit).

После OCR сохраняйте текст в `content/ocr/<name>.txt` и меняйте статус урока/вопросов с `needs_review` на `published` только после проверки преподавателем.

Плейсхолдеры best-effort лежат в `content/ocr/placeholders/`.
