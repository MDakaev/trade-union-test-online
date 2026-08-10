<?php

declare(strict_types=1);

namespace TradeUnion\Api\Controllers;

use DateTimeImmutable;
use PDO;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;
use TradeUnion\Api\Services\AuditService;

final class AdminController
{
    public function __construct(private readonly PDO $db, private readonly AuditService $audit)
    {
    }

    public function createInvite(Request $request): array
    {
        $maxUses = max(1, (int) $request->input('max_uses', 1));
        $days = min(365, max(1, (int) $request->input('expires_in_days', 7)));
        $code = mb_strtoupper(rtrim(strtr(base64_encode(random_bytes(24)), '+/', '-_'), '='));
        $stmt = $this->db->prepare(
            'INSERT INTO invites (code_hash, group_name, max_uses, expires_at, created_by) VALUES (?, ?, ?, ?, ?)'
        );
        $user = $request->attributes['user'];
        $stmt->execute([
            hash('sha256', $code),
            trim((string) $request->input('group')),
            $maxUses,
            (new DateTimeImmutable("+{$days} days"))->format('Y-m-d H:i:s'),
            $user['id'],
        ]);
        $id = (int) $this->db->lastInsertId();
        $this->audit->log((int) $user['id'], 'invite.created', 'invite', $id, ['max_uses' => $maxUses], $request->ip);
        return ['invite' => ['id' => $id, 'code' => $code, 'max_uses' => $maxUses, 'expires_in_days' => $days]];
    }

    public function listInvites(Request $request): array
    {
        return ['invites' => $this->db->query(
            'SELECT id, group_name, max_uses, uses_count, expires_at, revoked_at, created_at FROM invites ORDER BY created_at DESC'
        )->fetchAll()];
    }

    public function revokeInvite(Request $request, array $params): array
    {
        $this->db->prepare('UPDATE invites SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([(int) $params['id']]);
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], 'invite.revoked', 'invite', (int) $params['id'], [], $request->ip);
        return ['message' => 'Invite revoked'];
    }

    public function analytics(Request $request): array
    {
        $students = $this->db->query(
                    "SELECT u.id, u.name, u.login, u.group_name,
                    COUNT(DISTINCT sp.lesson_id) lessons_started,
                    SUM(CASE WHEN sp.completed_at IS NOT NULL THEN 1 ELSE 0 END) lessons_completed,
                    ROUND(AVG(sp.progress_percent), 1) average_progress
             FROM users u LEFT JOIN student_progress sp ON sp.user_id = u.id
             WHERE u.role = 'student' GROUP BY u.id ORDER BY u.name"
        )->fetchAll();
        $hardTopics = $this->db->query(
            "SELECT q.topic, COUNT(*) answers,
                    ROUND(100 * SUM(CASE WHEN aa.is_correct = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) error_rate
             FROM attempt_answers aa JOIN questions q ON q.id = aa.question_id
             WHERE q.topic IS NOT NULL GROUP BY q.topic HAVING COUNT(*) >= 3 ORDER BY error_rate DESC LIMIT 20"
        )->fetchAll();
        $activity = $this->db->query(
            "SELECT DATE(created_at) day, COUNT(*) events FROM audit_logs
             WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL 30 DAY GROUP BY DATE(created_at) ORDER BY day"
        )->fetchAll();
        return ['students' => $students, 'hard_topics' => $hardTopics, 'activity' => $activity];
    }

    public function student(Request $request, array $params): array
    {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.name, u.login, u.group_name, sp.*, l.title lesson_title
             FROM users u LEFT JOIN student_progress sp ON sp.user_id = u.id
             LEFT JOIN lessons l ON l.id = sp.lesson_id WHERE u.id = ? AND u.role = 'student'"
        );
        $stmt->execute([(int) $params['id']]);
        return ['progress' => $stmt->fetchAll()];
    }

    public function students(Request $request): array
    {
        return $this->analytics($request);
    }

    public function invites(Request $request): array
    {
        return $this->listInvites($request);
    }

    public function resetPassword(Request $request, array $params): array
    {
        $password = (string) $request->input('password', '');
        if (mb_strlen($password) < 8) {
            Response::error('Пароль не короче 8 символов', 422);
        }
        $studentId = (int) $params['id'];
        $stmt = $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ? AND role = ?');
        $stmt->execute([
            password_hash($password, PASSWORD_ARGON2ID),
            $studentId,
            'student',
        ]);
        if ($stmt->rowCount() === 0) {
            Response::error('Ученик не найден', 404);
        }
        $this->db->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$studentId]);
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], 'student.password_reset', 'user', $studentId, [], $request->ip);
        return ['message' => 'Пароль обновлён'];
    }

    public function block(Request $request, array $params): array
    {
        $active = (int) (!(bool) $request->input('blocked', true));
        $this->db->prepare('UPDATE users SET is_active = ? WHERE id = ? AND role = ?')->execute([
            $active,
            (int) $params['id'],
            'student',
        ]);
        if ($active === 0) {
            $this->db->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([(int) $params['id']]);
        }
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], $active ? 'student.unblocked' : 'student.blocked', 'user', (int) $params['id'], [], $request->ip);
        return ['is_active' => (bool) $active];
    }

    public function updateLesson(Request $request, array $params): array
    {
        $fields = [];
        $values = [];
        foreach (['title', 'summary', 'status', 'sort_order'] as $field) {
            if ($request->input($field) !== null) {
                $fields[] = "$field = ?";
                $values[] = $request->input($field);
            }
        }
        if ($fields === []) {
            return ['message' => 'Нет изменений'];
        }
        $values[] = (int) $params['id'];
        $this->db->prepare('UPDATE lessons SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], 'lesson.updated', 'lesson', (int) $params['id'], $request->json(), $request->ip);
        return ['message' => 'Урок обновлён'];
    }

    public function updateSettings(Request $request): array
    {
        foreach ($request->json() as $key => $value) {
            $this->db->prepare(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
            )->execute([(string) $key, json_encode($value, JSON_UNESCAPED_UNICODE)]);
        }
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], 'settings.updated', 'settings', null, array_keys($request->json()), $request->ip);
        return ['message' => 'Настройки сохранены'];
    }
}
