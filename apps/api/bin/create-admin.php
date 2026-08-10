#!/usr/bin/env php
<?php

declare(strict_types=1);

$root = dirname(__DIR__);
require $root . '/public/bootstrap.php';

use TradeUnion\Api\Core\Database;
use TradeUnion\Api\Core\Env;

Env::load($root . '/.env');
$config = require $root . '/config/database.php';
$pdo = Database::connect($config);

$opts = getopt('', ['login:', 'password:', 'name::']);
$login = strtolower(trim((string) ($opts['login'] ?? '')));
$password = (string) ($opts['password'] ?? '');
$name = trim((string) ($opts['name'] ?? 'Администратор'));

if ($login === '' || strlen($password) < 8) {
    fwrite(STDERR, "Usage: php bin/create-admin.php --login=admin --password='SecurePass123'\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_ARGON2ID);
$driver = $config['driver'] ?? 'mysql';

if ($driver === 'sqlite') {
    $sql = <<<'SQL'
INSERT INTO users (login, password_hash, name, role, group_name, is_active)
VALUES (?, ?, ?, ?, ?, 1)
ON CONFLICT(login) DO UPDATE SET
  password_hash = excluded.password_hash,
  role = 'admin',
  is_active = 1,
  name = excluded.name
SQL;
} else {
    $sql = <<<'SQL'
INSERT INTO users (login, password_hash, name, role, group_name, is_active)
VALUES (?, ?, ?, ?, ?, 1)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = 'admin',
  is_active = 1,
  name = VALUES(name)
SQL;
}

$pdo->prepare($sql)->execute([$login, $hash, $name, 'admin', 'Trade Union']);
echo "Admin ready: {$login}\n";
