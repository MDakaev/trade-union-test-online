<?php

declare(strict_types=1);

namespace TradeUnion\Api\Repositories;

use PDO;
use RuntimeException;

final class CourseRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function list(bool $includeDrafts): array
    {
        $sql = 'SELECT * FROM courses' . ($includeDrafts ? '' : " WHERE status = 'published'") . ' ORDER BY created_at DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function full(int $id, bool $includeDrafts): array
    {
        $stmt = $this->db->prepare('SELECT * FROM courses WHERE id = ?' . ($includeDrafts ? '' : " AND status = 'published'"));
        $stmt->execute([$id]);
        $course = $stmt->fetch();
        if (!$course) {
            throw new RuntimeException('Course not found');
        }
        $stmt = $this->db->prepare('SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order');
        $stmt->execute([$id]);
        $course['modules'] = $stmt->fetchAll();
        foreach ($course['modules'] as &$module) {
            $lessonSql = 'SELECT * FROM lessons WHERE module_id = ?'
                . ($includeDrafts ? '' : " AND status = 'published'")
                . ' ORDER BY sort_order';
            $stmt = $this->db->prepare($lessonSql);
            $stmt->execute([$module['id']]);
            $module['lessons'] = $stmt->fetchAll();
            foreach ($module['lessons'] as &$lesson) {
                $lesson['blocks'] = $this->children('lesson_blocks', 'lesson_id', (int) $lesson['id']);
                foreach ($lesson['blocks'] as &$block) {
                    $block['content'] = json_decode($block['content'], true) ?? $block['content'];
                }
                $lesson['flashcards'] = $this->children('flashcards', 'lesson_id', (int) $lesson['id']);
                $questions = $this->children('questions', 'lesson_id', (int) $lesson['id']);
                foreach ($questions as &$question) {
                    $question['options'] = $this->children('question_options', 'question_id', (int) $question['id']);
                    if (!$includeDrafts) {
                        unset($question['explanation']);
                        foreach ($question['options'] as &$option) {
                            unset($option['is_correct']);
                        }
                    }
                }
                $lesson['questions'] = $questions;
            }
        }
        return $course;
    }

    public function import(array $data): int
    {
        if (empty($data['title']) || !in_array($data['status'] ?? '', ['draft', 'published', 'needs_review'], true)) {
            throw new RuntimeException('Course title and valid status are required');
        }
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO courses (title, description, status) VALUES (?, ?, ?)');
            $stmt->execute([$data['title'], $data['description'] ?? null, $data['status']]);
            $courseId = (int) $this->db->lastInsertId();
            foreach ($data['modules'] ?? [] as $mi => $module) {
                $stmt = $this->db->prepare('INSERT INTO modules (course_id, title, sort_order) VALUES (?, ?, ?)');
                $stmt->execute([$courseId, $module['title'], $module['sort_order'] ?? $mi]);
                $moduleId = (int) $this->db->lastInsertId();
                foreach ($module['lessons'] ?? [] as $li => $lesson) {
                    $stmt = $this->db->prepare(
                        'INSERT INTO lessons (module_id, title, summary, status, sort_order) VALUES (?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([$moduleId, $lesson['title'], $lesson['summary'] ?? null, $lesson['status'] ?? 'draft', $lesson['sort_order'] ?? $li]);
                    $lessonId = (int) $this->db->lastInsertId();
                    $this->insertItems('lesson_blocks', $lessonId, $lesson['blocks'] ?? [], ['type', 'content', 'sort_order']);
                    $this->insertItems('flashcards', $lessonId, $lesson['flashcards'] ?? [], ['front', 'back', 'topic', 'sort_order']);
                    foreach ($lesson['questions'] ?? [] as $qi => $question) {
                        $stmt = $this->db->prepare(
                            'INSERT INTO questions (lesson_id, prompt, type, explanation, topic, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
                        );
                        $stmt->execute([$lessonId, $question['prompt'], $question['type'] ?? 'single_choice', $question['explanation'] ?? null, $question['topic'] ?? null, $question['sort_order'] ?? $qi]);
                        $questionId = (int) $this->db->lastInsertId();
                        foreach ($question['options'] ?? [] as $oi => $option) {
                            $stmt = $this->db->prepare(
                                'INSERT INTO question_options (question_id, label, is_correct, sort_order) VALUES (?, ?, ?, ?)'
                            );
                            $stmt->execute([$questionId, $option['label'], !empty($option['is_correct']) ? 1 : 0, $option['sort_order'] ?? $oi]);
                        }
                    }
                }
            }
            $this->db->commit();
            return $courseId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function children(string $table, string $column, int $id): array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$table} WHERE {$column} = ? ORDER BY sort_order, id");
        $stmt->execute([$id]);
        return $stmt->fetchAll();
    }

    private function insertItems(string $table, int $lessonId, array $items, array $columns): void
    {
        foreach ($items as $index => $item) {
            $values = [];
            foreach ($columns as $column) {
                $value = $column === 'sort_order' ? ($item[$column] ?? $index) : ($item[$column] ?? null);
                $values[] = $column === 'content' && is_array($value)
                    ? json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)
                    : $value;
            }
            $names = implode(', ', $columns);
            $marks = implode(', ', array_fill(0, count($columns) + 1, '?'));
            $this->db->prepare("INSERT INTO {$table} (lesson_id, {$names}) VALUES ({$marks})")->execute([$lessonId, ...$values]);
        }
    }
}
