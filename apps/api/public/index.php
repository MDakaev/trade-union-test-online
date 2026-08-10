<?php

declare(strict_types=1);

/**
 * Front controller — point shared-hosting /api rewrite here.
 */

$root = dirname(__DIR__);

$autoload = $root . '/vendor/autoload.php';
if (is_file($autoload)) {
    require $autoload;
} else {
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
}

use TradeUnion\Api\Controllers\AdminController;
use TradeUnion\Api\Controllers\AuthController;
use TradeUnion\Api\Controllers\CmsController;
use TradeUnion\Api\Controllers\CourseController;
use TradeUnion\Api\Controllers\ProgressController;
use TradeUnion\Api\Core\Database;
use TradeUnion\Api\Core\Env;
use TradeUnion\Api\Core\Router;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;
use TradeUnion\Api\Middleware\AuthMiddleware;
use TradeUnion\Api\Middleware\CorsMiddleware;
use TradeUnion\Api\Middleware\CsrfMiddleware;
use TradeUnion\Api\Middleware\RateLimitMiddleware;
use TradeUnion\Api\Repositories\CourseRepository;
use TradeUnion\Api\Services\AuditService;
use TradeUnion\Api\Services\AuthService;

Env::load($root . '/.env');
$config = require $root . '/config/app.php';
$dbConfig = require $root . '/config/database.php';
$corsConfig = require $root . '/config/cors.php';
date_default_timezone_set($config['timezone'] ?? 'Europe/Moscow');

try {
    $pdo = Database::connect($dbConfig);
} catch (Throwable $e) {
    Response::error($config['debug'] ? $e->getMessage() : 'Database unavailable', 503);
}

$request = Request::capture((bool) ($config['trust_proxy'] ?? false));
$path = $request->path;
if (str_starts_with($path, '/api')) {
    $request = $request->withPath(substr($path, 4) ?: '/');
}

$authService = new AuthService($pdo, $config);
$audit = new AuditService($pdo);
$courses = new CourseRepository($pdo);
$authController = new AuthController($authService);
$courseController = new CourseController($courses, $audit);
$progressController = new ProgressController($pdo);
$adminController = new AdminController($pdo, $audit);
$cmsController = new CmsController($pdo, $audit);

$rateMw = new RateLimitMiddleware(
    $config['rate_limit_dir'],
    $config['rate_limit_max'],
    $config['rate_limit_window']
);
$authMw = new AuthMiddleware($pdo, $config);
$adminMw = new AuthMiddleware($pdo, $config, 'admin');
$csrfMw = new CsrfMiddleware($pdo);
$cors = new CorsMiddleware($corsConfig);

$router = new Router();
$router->add('GET', '/health', static fn () => [
    'ok' => true,
    'service' => 'trade-union-lms-api',
    'time' => date(DATE_ATOM),
]);
$router->add('POST', '/auth/login', [$authController, 'login'], [$rateMw]);
$router->add('POST', '/auth/register', [$authController, 'register'], [$rateMw]);
$router->add('POST', '/auth/logout', [$authController, 'logout'], [$authMw, $csrfMw]);
$router->add('GET', '/auth/csrf', [$authController, 'csrf'], [$authMw]);
$router->add('GET', '/auth/me', [$authController, 'me'], [$authMw]);

$router->add('GET', '/courses', [$courseController, 'index'], [$authMw]);
$router->add('GET', '/courses/{id}', [$courseController, 'show'], [$authMw]);
$router->add('POST', '/courses/import', [$courseController, 'import'], [$adminMw, $csrfMw]);
$router->add('GET', '/courses/{id}/export', [$courseController, 'export'], [$adminMw]);
$router->add('POST', '/admin/cms/{entity}', [$cmsController, 'create'], [$adminMw, $csrfMw]);
$router->add('PATCH', '/admin/cms/{entity}/{id}', [$cmsController, 'update'], [$adminMw, $csrfMw]);
$router->add('DELETE', '/admin/cms/{entity}/{id}', [$cmsController, 'delete'], [$adminMw, $csrfMw]);

$router->add('GET', '/progress', [$progressController, 'mine'], [$authMw]);
$router->add('PUT', '/progress/lessons/{lessonId}', [$progressController, 'update'], [$authMw, $csrfMw]);
$router->add('POST', '/progress/cards/{cardId}/master', [$progressController, 'masterCard'], [$authMw, $csrfMw]);
$router->add('POST', '/progress/lessons/{lessonId}/quiz', [$progressController, 'submitQuiz'], [$authMw, $csrfMw]);

$router->add('GET', '/admin/analytics', [$adminController, 'analytics'], [$adminMw]);
$router->add('GET', '/admin/students', [$adminController, 'students'], [$adminMw]);
$router->add('GET', '/admin/students/{id}', [$adminController, 'student'], [$adminMw]);
$router->add('POST', '/admin/students/{id}/reset-password', [$adminController, 'resetPassword'], [$adminMw, $csrfMw]);
$router->add('POST', '/admin/students/{id}/block', [$adminController, 'block'], [$adminMw, $csrfMw]);
$router->add('GET', '/admin/invites', [$adminController, 'invites'], [$adminMw]);
$router->add('POST', '/admin/invites', [$adminController, 'createInvite'], [$adminMw, $csrfMw]);
$router->add('POST', '/admin/invites/{id}/revoke', [$adminController, 'revokeInvite'], [$adminMw, $csrfMw]);
$router->add('PUT', '/admin/lessons/{id}', [$adminController, 'updateLesson'], [$adminMw, $csrfMw]);
$router->add('PUT', '/admin/settings', [$adminController, 'updateSettings'], [$adminMw, $csrfMw]);

$cors->apply($request);
$router->dispatch($request);
