<?php

declare(strict_types=1);

/**
 * Shared bootstrap for CLI scripts (composer optional).
 */

$root = dirname(__DIR__);
$autoload = $root . '/vendor/autoload.php';
if (is_file($autoload)) {
    require $autoload;
    return;
}

spl_autoload_register(static function (string $class) use ($root): void {
    $prefix = 'TradeUnion\\Api\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $file = $root . '/src/' . $relative . '.php';
    if (is_file($file)) {
        require $file;
    }
});
