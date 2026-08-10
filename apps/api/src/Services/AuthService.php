<?php

declare(strict_types=1);

namespace TradeUnion\Api\Services;

use DateTimeImmutable;
use PDO;
use RuntimeException;

final class AuthService
{
    public function __construct(private readonly PDO $db, private readonly array $config)
    {
    }

    public function login(string $login, string $password, string $ip, string $userAgent): array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE login = ? AND is_active = 1');
        $stmt->execute([mb_strtolower(trim($login))]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new RuntimeException('Неверный логин или пароль');
        }
        if (password_needs_rehash($user['password_hash'], PASSWORD_ARGON2ID)) {
            $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                ->execute([password_hash($password, PASSWORD_ARGON2ID), $user['id']]);
        }
        return $this->createSession((int) $user['id'], $ip, $userAgent);
    }

    public function register(string $inviteCode, string $login, string $name, string $password, string $ip, string $userAgent): array
    {
        if (mb_strlen($password) < 8) {
            throw new RuntimeException('Пароль не короче 8 символов');
        }
        $login = mb_strtolower(trim($login));
        $name = trim($name);
        if (!preg_match('/^[a-z0-9._-]{3,40}$/', $login) || $name === '' || mb_strlen($name) > 190) {
            throw new RuntimeException('Укажите ФИО и логин (3–40 символов: латиница, цифры, ._- )');
        }
        $inviteCode = mb_strtoupper(trim($inviteCode));
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'SELECT * FROM invites WHERE code_hash = ? AND revoked_at IS NULL
                 AND expires_at > CURRENT_TIMESTAMP AND uses_count < max_uses
                 FOR UPDATE'
            );
            $stmt->execute([hash('sha256', $inviteCode)]);
            $invite = $stmt->fetch();
            if (!$invite) {
                throw new RuntimeException('Invite is invalid, expired, revoked, or exhausted');
            }
            $stmt = $this->db->prepare(
                'INSERT INTO users (login, password_hash, name, role, group_name) VALUES (?, ?, ?, ?, ?)'
            );
            $stmt->execute([$login, password_hash($password, PASSWORD_ARGON2ID), $name, 'student', $invite['group_name']]);
            $userId = (int) $this->db->lastInsertId();
            $this->db->prepare('UPDATE invites SET uses_count = uses_count + 1 WHERE id = ?')->execute([$invite['id']]);
            $this->db->commit();
            return $this->createSession($userId, $ip, $userAgent);
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            if ((string) $e->getCode() === '23000') {
                throw new RuntimeException('Логин уже занят');
            }
            throw $e;
        }
    }

    public function logout(string $token): void
    {
        $hash = hash('sha256', $token);
        $this->db->prepare('DELETE FROM csrf_tokens WHERE session_hash = ?')->execute([$hash]);
        $this->db->prepare('DELETE FROM sessions WHERE token_hash = ?')->execute([$hash]);
        $this->clearCookie();
    }

    public function csrf(string $sessionToken): string
    {
        $token = bin2hex(random_bytes(32));
        $this->db->prepare('DELETE FROM csrf_tokens WHERE session_hash = ?')->execute([hash('sha256', $sessionToken)]);
        $stmt = $this->db->prepare(
            'INSERT INTO csrf_tokens (session_hash, token_hash, expires_at) VALUES (?, ?, ?)'
        );
        $stmt->execute([
            hash('sha256', $sessionToken),
            hash('sha256', $token),
            (new DateTimeImmutable('+2 hours'))->format('Y-m-d H:i:s'),
        ]);
        return $token;
    }

    private function createSession(int $userId, string $ip, string $userAgent): array
    {
        $token = bin2hex(random_bytes(32));
        $expires = new DateTimeImmutable('+' . $this->config['session_ttl'] . ' seconds');
        $stmt = $this->db->prepare(
            'INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, hash('sha256', $token), $ip, mb_substr($userAgent, 0, 255), $expires->format('Y-m-d H:i:s')]);
        setcookie($this->config['session_cookie'], $token, [
            'expires' => $expires->getTimestamp(),
            'path' => '/',
            'secure' => $this->config['session_secure'],
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        return ['expires_at' => $expires->format(DATE_ATOM)];
    }

    private function clearCookie(): void
    {
        setcookie($this->config['session_cookie'], '', [
            'expires' => 1, 'path' => '/', 'secure' => $this->config['session_secure'],
            'httponly' => true, 'samesite' => 'Lax',
        ]);
    }
}
