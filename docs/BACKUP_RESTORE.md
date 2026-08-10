# Бэкапы и восстановление

## Что бэкапить

1. MySQL база (пользователи, прогресс, курс)
2. `apps/api/.env` (секреты)
3. Загруженные медиа (если появятся)
4. Экспорт курса JSON (`content/course/course.json`)

## Хостинг

Timeweb/Beget делают ежедневные бэкапы автоматически. Храните также свой экспорт раз в неделю.

## Экспорт вручную

```bash
# База
mysqldump -u USER -p DB > backup-$(date +%F).sql

# Курс
php apps/api/bin/export-course.php > course-backup.json
```

## Восстановление

1. Создайте пустую БД.
2. `mysql -u USER -p DB < backup-YYYY-MM-DD.sql`
3. Восстановите `.env`
4. Проверьте `/api/health`
5. Войдите админом и сделайте smoke-test: приглашение → урок → тест

## Disaster recovery checklist

- [ ] SQL восстановлен
- [ ] `.env` на месте, `APP_KEY` тот же (иначе сессии/хэши могут отличаться для cookies)
- [ ] Фронтенд указывает на правильный API URL
- [ ] SSL активен
- [ ] Создан тестовый ученик и пройден мини-квиз
