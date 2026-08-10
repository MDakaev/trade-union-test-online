#!/usr/bin/env php
<?php

declare(strict_types=1);

$root = dirname(__DIR__);
require $root . '/public/bootstrap.php';

use TradeUnion\Api\Core\Database;
use TradeUnion\Api\Core\Env;
use TradeUnion\Api\Repositories\CourseRepository;
use TradeUnion\Api\Services\AuditService;

Env::load($root . '/.env');
$file = $argv[1] ?? (dirname($root, 2) . '/content/course/course.json');
if (!is_file($file)) {
    fwrite(STDERR, "Usage: php bin/import-course.php path/to/course.json\n");
    exit(1);
}

$data = json_decode(file_get_contents($file), true);
if (!is_array($data)) {
    fwrite(STDERR, "Invalid JSON\n");
    exit(1);
}

// Adapt SPA course package → API import shape
$payload = [
    'title' => ($data['title'] ?? 'Course') . ' ' . ($data['subtitle'] ?? ''),
    'description' => $data['brand']['name'] ?? 'Trade Union',
    'status' => 'published',
    'modules' => [],
];

$lessonsById = [];
foreach ($data['lessons'] ?? [] as $lesson) {
    $lessonsById[$lesson['id']] = $lesson;
}

foreach ($data['modules'] ?? [] as $mi => $module) {
    $mod = [
        'title' => $module['title'],
        'sort_order' => $module['index'] ?? $mi,
        'lessons' => [],
    ];
    foreach ($module['lessonIds'] ?? [] as $li => $lessonId) {
        $lesson = $lessonsById[$lessonId] ?? null;
        if (!$lesson) {
            continue;
        }
        $mod['lessons'][] = [
            'title' => $lesson['title'],
            'summary' => $lesson['description'] ?? null,
            'status' => $lesson['status'] ?? 'draft',
            'sort_order' => $li,
            'blocks' => array_map(static function ($block, $bi) {
                return [
                    'type' => $block['type'] ?? 'text',
                    'content' => $block,
                    'sort_order' => $bi,
                ];
            }, $lesson['blocks'] ?? [], array_keys($lesson['blocks'] ?? [])),
            'flashcards' => $lesson['cards'] ?? $lesson['flashcards'] ?? [],
            'questions' => [],
        ];
    }
    $payload['modules'][] = $mod;
}

// Attach exam questions to first published assessment lesson if present
$examQuestions = [];
foreach ($data['questions'] ?? [] as $qi => $q) {
    if (($q['status'] ?? '') !== 'published') {
        continue;
    }
    $examQuestions[] = [
        'prompt' => $q['text'] ?? $q['prompt'],
        'type' => 'single_choice',
        'explanation' => $q['explanation'] ?? null,
        'topic' => $q['topic'] ?? null,
        'sort_order' => $qi,
        'options' => array_map(static function ($opt, $oi) use ($q) {
            $id = (string) ($opt['id'] ?? $opt['key'] ?? $oi);
            return [
                'label' => $opt['text'] ?? $opt['label'] ?? '',
                'is_correct' => $id === (string) ($q['correctOptionId'] ?? $q['answer'] ?? ''),
                'sort_order' => $oi,
            ];
        }, $q['options'] ?? [], array_keys($q['options'] ?? [])),
    ];
}
if ($examQuestions !== [] && $payload['modules'] !== []) {
    // Put exam into last module as virtual lesson
    $payload['modules'][] = [
        'title' => 'Итоговый тест',
        'sort_order' => 99,
        'lessons' => [[
            'title' => 'Оценочный материал',
            'summary' => '50 вопросов теоретического контроля',
            'status' => 'published',
            'sort_order' => 0,
            'blocks' => [['type' => 'lead', 'content' => ['type' => 'lead', 'content' => 'Итоговый тест курса'], 'sort_order' => 0]],
            'flashcards' => [],
            'questions' => $examQuestions,
        ]],
    ];
}

$pdo = Database::connect(require $root . '/config/database.php');
$repo = new CourseRepository($pdo);
$id = $repo->import($payload);
(new AuditService($pdo))->log(null, 'course.imported.cli', 'course', $id, ['file' => basename($file)]);
echo "Imported course #{$id}\n";
