<?php

declare(strict_types=1);

namespace TradeUnion\Api\Core;

use PDO;

final class Database
{
    public static function connect(array $config): PDO
    {
        if ($config['driver'] === 'sqlite') {
            $dsn = 'sqlite:' . $config['database'];
            $pdo = new PDO($dsn);
            $pdo->exec('PRAGMA foreign_keys = ON');
        } else {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );
            $pdo = new PDO($dsn, $config['username'], $config['password']);
        }

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        return $pdo;
    }
}
