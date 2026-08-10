<?php

declare(strict_types=1);

namespace TradeUnion\Api\Controllers;

use RuntimeException;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;
use TradeUnion\Api\Repositories\CourseRepository;
use TradeUnion\Api\Services\AuditService;

final class CourseController
{
    public function __construct(private readonly CourseRepository $courses, private readonly AuditService $audit)
    {
    }

    public function index(Request $request): array
    {
        return ['courses' => $this->courses->list(($request->attributes['user']['role'] ?? '') === 'admin')];
    }

    public function show(Request $request, array $params): array
    {
        try {
            return ['course' => $this->courses->full(
                (int) $params['id'],
                ($request->attributes['user']['role'] ?? '') === 'admin'
            )];
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    public function import(Request $request): array
    {
        try {
            $id = $this->courses->import($request->json());
            $user = $request->attributes['user'];
            $this->audit->log((int) $user['id'], 'course.imported', 'course', $id, [], $request->ip);
            return ['course_id' => $id];
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function export(Request $request, array $params): array
    {
        $course = $this->courses->full((int) $params['id'], true);
        $user = $request->attributes['user'];
        $this->audit->log((int) $user['id'], 'course.exported', 'course', (int) $params['id'], [], $request->ip);
        return ['format' => 'trade-union-lms.v1', 'course' => $course];
    }
}
