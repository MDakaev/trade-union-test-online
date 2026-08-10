<?php

declare(strict_types=1);

namespace TradeUnion\Api\Middleware;

use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class RateLimitMiddleware
{
    public function __construct(
        private readonly string $directory,
        private readonly int $max,
        private readonly int $window
    ) {
    }

    public function __invoke(Request $request, callable $next): mixed
    {
        if (!is_dir($this->directory) && !mkdir($this->directory, 0700, true) && !is_dir($this->directory)) {
            Response::error('Rate limiter unavailable', 503);
        }
        $key = hash('sha256', $request->ip . '|' . $request->path);
        $file = $this->directory . '/' . $key . '.json';
        $handle = fopen($file, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            Response::error('Rate limiter unavailable', 503);
        }
        $raw = stream_get_contents($handle);
        $state = $raw ? json_decode($raw, true) : null;
        $now = time();
        if (!is_array($state) || $state['reset'] <= $now) {
            $state = ['count' => 0, 'reset' => $now + $this->window];
        }
        $state['count']++;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($state));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        header('X-RateLimit-Limit: ' . $this->max);
        header('X-RateLimit-Remaining: ' . max(0, $this->max - $state['count']));
        if ($state['count'] > $this->max) {
            Response::json(['error' => ['message' => 'Too many requests']], 429, [
                'Retry-After' => (string) max(1, $state['reset'] - $now),
            ]);
        }
        return $next($request);
    }
}
