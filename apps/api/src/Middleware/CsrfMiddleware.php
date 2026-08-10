<?php

declare(strict_types=1);

namespace TradeUnion\Api\Middleware;

use PDO;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class CsrfMiddleware
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function __invoke(Request $request, callable $next): mixed
    {
        if (in_array($request->method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return $next($request);
        }
        $sessionToken = $request->attributes['session_token'] ?? '';
        $csrf = $request->header('x-csrf-token') ?? '';
        $stmt = $this->db->prepare(
            'SELECT id FROM csrf_tokens WHERE session_hash = ? AND token_hash = ? AND expires_at > CURRENT_TIMESTAMP'
        );
        $stmt->execute([hash('sha256', $sessionToken), hash('sha256', $csrf)]);
        if (!$stmt->fetchColumn()) {
            Response::error('Invalid CSRF token', 419);
        }
        return $next($request);
    }
}
