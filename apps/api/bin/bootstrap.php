<?php

declare(strict_types=1);

use TradeUnion\Api\Core\Database;
use TradeUnion\Api\Core\Env;

$root = dirname(__DIR__);
if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    spl_autoload_register(static function (string $class) use ($root): void {
        $prefix = 'TradeUnion\\Api\\';
        if (str_starts_with($class, $prefix)) {
            require $root . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        }
    });
}
Env::load($root . '/.env');
return Database::connect(require $root . '/config/database.php');
