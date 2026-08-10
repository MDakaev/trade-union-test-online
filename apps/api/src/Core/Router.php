<?php

declare(strict_types=1);

namespace TradeUnion\Api\Core;

use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, array $middleware = []): void
    {
        $pattern = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [strtoupper($method), '#^' . $pattern . '$#', $handler, $middleware];
    }

    public function dispatch(Request $request): never
    {
        foreach ($this->routes as [$method, $pattern, $handler, $middleware]) {
            if ($method !== $request->method || !preg_match($pattern, $request->path, $matches)) {
                continue;
            }
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            $core = fn (Request $req) => $handler($req, $params);
            $pipeline = array_reduce(
                array_reverse($middleware),
                fn ($next, $item) => fn (Request $req) => $item($req, $next),
                $core
            );
            $result = $pipeline($request);
            Response::json($result);
        }
        Response::error('Route not found', 404);
    }
}
