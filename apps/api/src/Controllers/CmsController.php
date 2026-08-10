<?php

declare(strict_types=1);

namespace TradeUnion\Api\Controllers;

use PDO;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;
use TradeUnion\Api\Services\AuditService;

final class CmsController
{
    private const ENTITIES = [
        'courses' => ['table' => 'courses', 'fields' => ['title', 'description', 'status'], 'required' => ['title']],
        'modules' => ['table' => 'modules', 'fields' => ['course_id', 'title', 'sort_order'], 'required' => ['course_id', 'title']],
        'lessons' => ['table' => 'lessons', 'fields' => ['module_id', 'title', 'summary', 'status', 'sort_order'], 'required' => ['module_id', 'title']],
        'blocks' => ['table' => 'lesson_blocks', 'fields' => ['lesson_id', 'type', 'content', 'sort_order'], 'required' => ['lesson_id', 'type', 'content'], 'json' => ['content']],
        'flashcards' => ['table' => 'flashcards', 'fields' => ['lesson_id', 'front', 'back', 'topic', 'sort_order'], 'required' => ['lesson_id', 'front', 'back']],
        'questions' => ['table' => 'questions', 'fields' => ['lesson_id', 'prompt', 'type', 'explanation', 'topic', 'sort_order'], 'required' => ['lesson_id', 'prompt']],
        'options' => ['table' => 'question_options', 'fields' => ['question_id', 'label', 'is_correct', 'sort_order'], 'required' => ['question_id', 'label']],
    ];

    public function __construct(private readonly PDO $db, private readonly AuditService $audit)
    {
    }

    public function create(Request $request, array $params): array
    {
        $definition = $this->definition($params['entity']);
        $data = $this->validatedData($request->json(), $definition, true);
        $columns = array_keys($data);
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $definition['table'],
            implode(', ', $columns),
            implode(', ', array_fill(0, count($columns), '?'))
        );
        $this->db->prepare($sql)->execute(array_values($data));
        $id = (int) $this->db->lastInsertId();
        $this->record($request, 'cms.created', $params['entity'], $id, $columns);
        return ['id' => $id];
    }

    public function update(Request $request, array $params): array
    {
        $definition = $this->definition($params['entity']);
        $data = $this->validatedData($request->json(), $definition, false);
        if ($data === []) {
            Response::error('At least one editable field is required', 422);
        }
        $assignments = array_map(static fn (string $field): string => "{$field} = ?", array_keys($data));
        $values = [...array_values($data), (int) $params['id']];
        $stmt = $this->db->prepare(
            sprintf('UPDATE %s SET %s WHERE id = ?', $definition['table'], implode(', ', $assignments))
        );
        $stmt->execute($values);
        if ($stmt->rowCount() === 0) {
            $exists = $this->db->prepare("SELECT id FROM {$definition['table']} WHERE id = ?");
            $exists->execute([(int) $params['id']]);
            if (!$exists->fetchColumn()) {
                Response::error('CMS record not found', 404);
            }
        }
        $this->record($request, 'cms.updated', $params['entity'], (int) $params['id'], array_keys($data));
        return ['message' => 'Updated'];
    }

    public function delete(Request $request, array $params): array
    {
        $definition = $this->definition($params['entity']);
        $stmt = $this->db->prepare("DELETE FROM {$definition['table']} WHERE id = ?");
        $stmt->execute([(int) $params['id']]);
        if ($stmt->rowCount() === 0) {
            Response::error('CMS record not found', 404);
        }
        $this->record($request, 'cms.deleted', $params['entity'], (int) $params['id'], []);
        return ['message' => 'Deleted'];
    }

    private function definition(string $entity): array
    {
        if (!isset(self::ENTITIES[$entity])) {
            Response::error('Unknown CMS entity', 404);
        }
        return self::ENTITIES[$entity];
    }

    private function validatedData(array $input, array $definition, bool $creating): array
    {
        if ($creating) {
            foreach ($definition['required'] as $field) {
                if (!array_key_exists($field, $input) || $input[$field] === '') {
                    Response::error("Field '{$field}' is required", 422);
                }
            }
        }
        $data = array_intersect_key($input, array_flip($definition['fields']));
        if (isset($data['status']) && !in_array($data['status'], ['draft', 'published', 'needs_review'], true)) {
            Response::error('Invalid publication status', 422);
        }
        if (isset($data['type']) && $definition['table'] === 'questions'
            && !in_array($data['type'], ['single_choice', 'multiple_choice', 'true_false'], true)) {
            Response::error('Invalid question type', 422);
        }
        foreach ($definition['json'] ?? [] as $field) {
            if (isset($data[$field]) && !is_string($data[$field])) {
                $data[$field] = json_encode($data[$field], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            }
        }
        return $data;
    }

    private function record(Request $request, string $action, string $entity, int $id, array $fields): void
    {
        $this->audit->log(
            (int) $request->attributes['user']['id'],
            $action,
            $entity,
            $id,
            ['fields' => $fields],
            $request->ip
        );
    }
}
