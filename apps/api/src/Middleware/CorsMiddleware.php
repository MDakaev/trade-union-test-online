<?php

declare(strict_types=1);

namespace TradeUnion\Api\Middleware;

use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class CorsMiddleware
{
    public function __construct(private readonly array $config)
    {
    }

    public function apply(Request $request): void
    {
        $origin = $request->header('origin');
        if ($origin && rtrim($origin, '/') === $this->config['origin']) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
            header("Access-Control-Allow-Methods: {$this->config['methods']}");
            header("Access-Control-Allow-Headers: {$this->config['headers']}");
            header("Access-Control-Max-Age: {$this->config['max_age']}");
        } elseif ($origin) {
            Response::error('Origin is not allowed', 403);
        }

        if ($request->method === 'OPTIONS') {
            Response::json(null, 204);
        }
    }
}
