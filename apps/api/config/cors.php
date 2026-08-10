<?php

declare(strict_types=1);

use TradeUnion\Api\Core\Env;

return [
    'origin' => rtrim(Env::get('SPA_ORIGIN', ''), '/'),
    'methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'headers' => 'Content-Type, X-CSRF-Token, Accept',
    'max_age' => 86400,
];
