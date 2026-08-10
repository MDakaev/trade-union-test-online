#!/usr/bin/env php
<?php

declare(strict_types=1);

$root = dirname(__DIR__);
require $root . '/public/bootstrap.php';

use TradeUnion\Api\Core\Database;
use TradeUnion\Api\Core\Env;

Env::load($root . '/.env');
$config = require $root . '/config/database.php';

if (($config['driver'] ?? '') === 'sqlite') {
    $dir = dirname($config['database']);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
}

$pdo = Database::connect($config);
$driver = $config['driver'];

try {
    if ($driver === 'sqlite') {
        $pdo->exec(file_get_contents($root . '/database/schema.sqlite.sql'));
        $pdo->exec(
            "INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES
             ('site_name', '{\"value\":\"Trade Union LMS\"}'),
             ('registration_enabled', '{\"value\":true}');"
        );
        $pdo->exec(
            "INSERT INTO courses (title, description, status)
             SELECT 'Getting started', 'Welcome course. Edit or replace this content from the admin API.', 'draft'
             WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Getting started');"
        );
    } else {
        $pdo->exec(file_get_contents($root . '/database/schema.sql'));
        $pdo->exec(file_get_contents($root . '/database/seed.sql'));
    }
    echo "Database seeded ({$driver}).\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'Seed failed: ' . $e->getMessage() . "\n");
    exit(1);
}
