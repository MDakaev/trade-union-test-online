<?php

declare(strict_types=1);

namespace TradeUnion\Api\Middleware;

use PDO;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class AuthMiddleware
{
    public function __construct(
        private readonly PDO $db,
        private readonly array $config,
        private readonly ?string $role = null
    ) {
    }

    public function __invoke(Request $request, callable $next): mixed
    {
        $token = $request->cookies[$this->config['session_cookie']] ?? '';
        if ($token === '') {
            Response::error('Authentication required', 401);
        }
        $stmt = $this->db->prepare(
            'SELECT u.id, u.login, u.name, u.role, u.group_name
             FROM sessions s JOIN users u ON u.id = s.user_id
             WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1'
        );
        $stmt->execute([hash('sha256', $token)]);
        $user = $stmt->fetch();
        if (!$user) {
            Response::error('Session expired or invalid', 401);
        }
        if ($this->role !== null && $user['role'] !== $this->role) {
            Response::error('Insufficient permissions', 403);
        }
        $request->attributes['user'] = $user;
        $request->attributes['session_token'] = $token;
        return $next($request);
    }
}
