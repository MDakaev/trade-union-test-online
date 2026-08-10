-- Safe, idempotent non-secret defaults. Create the first admin with bin/create-admin.php.
INSERT INTO settings (setting_key, setting_value)
VALUES
  ('site_name', JSON_OBJECT('value', 'Trade Union LMS')),
  ('registration_enabled', JSON_OBJECT('value', true))
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO courses (title, description, status)
SELECT 'Getting started', 'Welcome course. Edit or replace this content from the admin API.', 'draft'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Getting started');
