<?php

declare(strict_types=1);

namespace TradeUnion\Api\Http;

final class Request
{
    private ?array $json = null;
    public array $attributes = [];
    private readonly string $body;

    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        public readonly array $headers,
        public readonly array $cookies,
        string $body,
        public readonly string $ip
    ) {
        $this->body = $body;
    }

    public static function capture(bool $trustProxy = false): self
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $normalized = [];
        foreach ($headers as $key => $value) {
            $normalized[strtolower($key)] = $value;
        }
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if ($trustProxy && isset($normalized['x-forwarded-for'])) {
            $ip = trim(explode(',', $normalized['x-forwarded-for'])[0]);
        }

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            '/' . trim($uri, '/'),
            $_GET,
            $normalized,
            $_COOKIE,
            file_get_contents('php://input') ?: '',
            $ip
        );
    }

    public function json(): array
    {
        if ($this->json === null) {
            $decoded = json_decode($this->body, true);
            $this->json = is_array($decoded) ? $decoded : [];
        }
        return $this->json;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->json()[$key] ?? $default;
    }

    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    public function withPath(string $path): self
    {
        return new self(
            $this->method,
            $path,
            $this->query,
            $this->headers,
            $this->cookies,
            $this->body,
            $this->ip
        );
    }
}
