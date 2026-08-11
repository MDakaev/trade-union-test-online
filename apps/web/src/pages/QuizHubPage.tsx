import { ArrowRight, Brain, Clock3, GraduationCap, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app-context'

export function QuizHubPage() {
  const { course, progress } = useApp()
  const quizzes = course.quizzes?.length
    ? course.quizzes
    : [{ id: 'final', title: 'Итоговый тест', topic: 'Итоговый контроль', estimatedMinutes: 12 }]

  return (
    <div className="quiz-hub">
      <header className="quiz-hub__header">
        <p className="eyebrow">Проверка знаний</p>
        <h1>Каталог тестов</h1>
        <p className="page-subtitle">
          Итоговый экзамен и промежуточные контроли. После теста можно разобрать ошибки.
        </p>
      </header>

      <div className="quiz-hub__grid">
        {quizzes.map((quiz) => {
          const publishedQuestions = course.questions.filter(
            (question) => question.quizId === quiz.id && question.status === 'published',
          )
          const last = progress.attempts.find((attempt) => attempt.quizId === quiz.id)
          const percent = last && last.total > 0 ? Math.round((last.score / last.total) * 100) : null
          const wrongCount = last
            ? publishedQuestions.filter((question) => {
                const selected = last.answers[question.id]
                return selected !== undefined && selected !== question.correctOptionId
              }).length
            : 0

          return (
            <article key={quiz.id} className="quiz-hub-card">
              <div className="quiz-hub-card__icon" aria-hidden="true">
                <GraduationCap size={24} />
              </div>
              <div className="quiz-hub-card__body">
                <p className="eyebrow">{quiz.topic}</p>
                <h2>{quiz.title}</h2>
                {quiz.subtitle ? <p>{quiz.subtitle}</p> : null}
                <div className="quiz-hub-card__meta">
                  <span>
                    <Target size={15} /> {publishedQuestions.length} вопросов
                  </span>
                  <span>
                    <Clock3 size={15} /> ≈ {quiz.estimatedMinutes} мин
                  </span>
                  {percent !== null ? (
                    <span>
                      <Trophy size={15} /> {percent}%
                    </span>
                  ) : (
                    <span>Ещё не проходили</span>
                  )}
                </div>
              </div>
              <div className="quiz-hub-card__actions">
                {wrongCount > 0 && (
                  <Link className="secondary-button" to={`/quiz/${quiz.id}?mode=mistakes`}>
                    <Brain size={16} /> Ошибки
                  </Link>
                )}
                <Link className="primary-button" to={`/quiz/${quiz.id}`}>
                  {last ? 'Пройти снова' : 'Начать'} <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
