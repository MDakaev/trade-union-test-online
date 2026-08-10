<?php

declare(strict_types=1);

use TradeUnion\Api\Core\Env;

return [
    'env' => Env::get('APP_ENV', 'production'),
    'debug' => Env::bool('APP_DEBUG', false),
    'url' => rtrim(Env::get('APP_URL', ''), '/'),
    'key' => Env::get('APP_KEY', ''),
    'timezone' => Env::get('APP_TIMEZONE', 'UTC'),
    'session_cookie' => Env::get('SESSION_COOKIE', 'tu_lms_session'),
    'session_ttl' => Env::int('SESSION_TTL', 86400),
    'session_secure' => Env::bool('SESSION_SECURE', true),
    'trust_proxy' => Env::bool('TRUST_PROXY', false),
    'rate_limit_max' => Env::int('RATE_LIMIT_MAX', 10),
    'rate_limit_window' => Env::int('RATE_LIMIT_WINDOW', 60),
    'rate_limit_dir' => Env::get('RATE_LIMIT_DIR', sys_get_temp_dir() . '/trade-union-lms-rate-limits'),
];
