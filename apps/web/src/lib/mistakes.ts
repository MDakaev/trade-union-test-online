import type { Attempt, Course, Question } from './types'

export type MistakeItem = {
  question: Question
  selectedId: string
  quizId: string
  quizTitle: string
}

export function wrongFromAnswers(questions: Question[], answers: Record<string, string>) {
  return questions.filter((question) => {
    const selected = answers[question.id]
    return selected !== undefined && selected !== question.correctOptionId
  })
}

/** Latest attempt per quiz → wrong answers only. */
export function collectLatestMistakes(course: Course, attempts: Attempt[]): MistakeItem[] {
  const latestByQuiz = new Map<string, Attempt>()
  for (const attempt of attempts) {
    if (!latestByQuiz.has(attempt.quizId)) {
      latestByQuiz.set(attempt.quizId, attempt)
    }
  }

  const items: MistakeItem[] = []
  for (const [quizId, attempt] of latestByQuiz) {
    const quizTitle = course.quizzes?.find((quiz) => quiz.id === quizId)?.title ?? 'Тест'
    const questions = course.questions.filter(
      (question) => question.quizId === quizId && question.status === 'published',
    )
    for (const question of questions) {
      const selectedId = attempt.answers[question.id]
      if (selectedId !== undefined && selectedId !== question.correctOptionId) {
        items.push({ question, selectedId, quizId, quizTitle })
      }
    }
  }
  return items
}

export function groupMistakesByQuiz(items: MistakeItem[]) {
  const groups = new Map<string, { quizId: string; quizTitle: string; count: number }>()
  for (const item of items) {
    const current = groups.get(item.quizId)
    if (current) {
      current.count += 1
    } else {
      groups.set(item.quizId, { quizId: item.quizId, quizTitle: item.quizTitle, count: 1 })
    }
  }
  return [...groups.values()]
}
