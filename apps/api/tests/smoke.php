#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Lightweight syntax + wiring smoke test (no DB required).
 */

$root = dirname(__DIR__);
$failures = 0;

$required = [
    'public/index.php',
    'public/.htaccess',
    'src/Core/Router.php',
    'src/Services/AuthService.php',
    'database/schema.sql',
    'bin/seed.php',
    'bin/create-admin.php',
    '.env.example',
];

foreach ($required as $rel) {
    if (!is_file("$root/$rel")) {
        fwrite(STDERR, "MISSING $rel\n");
        $failures++;
    }
}

$schema = file_get_contents("$root/database/schema.sql");
foreach (['users', 'invites', 'sessions', 'courses', 'lessons', 'questions', 'student_progress', 'audit_logs'] as $table) {
    if (!str_contains($schema, "CREATE TABLE IF NOT EXISTS $table")) {
        fwrite(STDERR, "SCHEMA missing table $table\n");
        $failures++;
    }
}

if (!str_contains($schema, 'login VARCHAR')) {
    fwrite(STDERR, "SCHEMA should use login column\n");
    $failures++;
}

$index = file_get_contents("$root/public/index.php");
foreach (['/health', '/auth/login', '/admin/invites', '/courses'] as $route) {
    if (!str_contains($index, $route)) {
        fwrite(STDERR, "ROUTE missing $route\n");
        $failures++;
    }
}

exit($failures === 0 ? 0 : 1);
