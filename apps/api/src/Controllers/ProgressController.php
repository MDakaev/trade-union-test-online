<?php

declare(strict_types=1);

namespace TradeUnion\Api\Controllers;

use PDO;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;

final class ProgressController
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function mine(Request $request): array
    {
        $stmt = $this->db->prepare(
            'SELECT sp.*, l.title lesson_title FROM student_progress sp
             JOIN lessons l ON l.id = sp.lesson_id WHERE sp.user_id = ? ORDER BY sp.updated_at DESC'
        );
        $stmt->execute([$request->attributes['user']['id']]);
        return ['progress' => $stmt->fetchAll()];
    }

    public function update(Request $request, array $params): array
    {
        $percent = min(100, max(0, (int) $request->input('progress_percent', 0)));
        $completed = $percent === 100 ? date('Y-m-d H:i:s') : null;
        $sql = 'INSERT INTO student_progress (user_id, lesson_id, progress_percent, completed_at, last_block_id)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE progress_percent = VALUES(progress_percent),
                completed_at = COALESCE(completed_at, VALUES(completed_at)),
                last_block_id = VALUES(last_block_id), updated_at = CURRENT_TIMESTAMP';
        $this->db->prepare($sql)->execute([
            $request->attributes['user']['id'], (int) $params['lessonId'], $percent, $completed,
            $request->input('last_block_id'),
        ]);
        return ['progress_percent' => $percent, 'completed' => $completed !== null];
    }

    public function masterCard(Request $request, array $params): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO mastered_cards (user_id, flashcard_id, mastered_at) VALUES (?, ?, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE mastered_at = CURRENT_TIMESTAMP'
        );
        $stmt->execute([$request->attributes['user']['id'], (int) $params['cardId']]);
        return ['mastered' => true];
    }

    public function submitQuiz(Request $request, array $params): array
    {
        $answers = $request->input('answers', []);
        if (!is_array($answers) || $answers === []) {
            Response::error('Answers are required', 422);
        }
        $lessonId = (int) $params['lessonId'];
        $questionIds = [];
        foreach ($answers as $answer) {
            if (!is_array($answer)) {
                Response::error('Each answer must contain question_id and option_id', 422);
            }
            $questionId = (int) ($answer['question_id'] ?? 0);
            $optionId = (int) ($answer['option_id'] ?? 0);
            if ($questionId <= 0 || $optionId <= 0 || isset($questionIds[$questionId])) {
                Response::error('Answers contain invalid or duplicate questions', 422);
            }
            $questionIds[$questionId] = true;
        }
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM questions WHERE lesson_id = ?');
        $stmt->execute([$lessonId]);
        $questionCount = (int) $stmt->fetchColumn();
        if ($questionCount === 0 || count($answers) !== $questionCount) {
            Response::error('Every lesson question must be answered exactly once', 422);
        }

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO quiz_attempts (user_id, lesson_id) VALUES (?, ?)');
            $stmt->execute([$request->attributes['user']['id'], $lessonId]);
            $attemptId = (int) $this->db->lastInsertId();
            $correct = 0;
            foreach ($answers as $answer) {
                $questionId = (int) ($answer['question_id'] ?? 0);
                $optionId = (int) ($answer['option_id'] ?? 0);
                $stmt = $this->db->prepare(
                    'SELECT qo.is_correct FROM question_options qo JOIN questions q ON q.id = qo.question_id
                     WHERE qo.id = ? AND qo.question_id = ? AND q.lesson_id = ?'
                );
                $stmt->execute([$optionId, $questionId, $lessonId]);
                $result = $stmt->fetchColumn();
                if ($result === false) {
                    throw new \RuntimeException('Answer option does not belong to the lesson question');
                }
                $isCorrect = (int) $result;
                $correct += $isCorrect;
                $this->db->prepare(
                    'INSERT INTO attempt_answers (attempt_id, question_id, option_id, is_correct) VALUES (?, ?, ?, ?)'
                )->execute([$attemptId, $questionId, $optionId, $isCorrect]);
            }
            $score = round(100 * $correct / $questionCount, 2);
            $this->db->prepare('UPDATE quiz_attempts SET score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?')
                ->execute([$score, $attemptId]);
            $this->db->commit();
            return ['attempt_id' => $attemptId, 'score' => $score, 'correct' => $correct, 'total' => $questionCount];
        } catch (\RuntimeException $e) {
            $this->db->rollBack();
            Response::error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
