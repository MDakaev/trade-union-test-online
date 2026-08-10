import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RotateCcw,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApp } from '../lib/app-context'

type Stage = 'intro' | 'active' | 'result'

export function QuizPage() {
  const { quizId = 'final' } = useParams()
  const { course, progress, saveAttempt } = useApp()
  const quiz = course.quizzes?.find((item) => item.id === quizId)
  const questions = useMemo(
    () => course.questions.filter((item) => item.quizId === quizId && item.status === 'published'),
    [course.questions, quizId],
  )
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setStage('intro')
    setIndex(0)
    setAnswers({})
    setChecked(false)
  }, [quizId])

  if (!quiz && course.quizzes?.length) {
    return <Navigate to="/quiz" replace />
  }

  const current = questions[index]
  const selected = answers[current?.id]
  const score = questions.reduce((sum, question) => sum + (answers[question.id] === question.correctOptionId ? 1 : 0), 0)
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const gradeScale = course.brand?.gradeScale ?? { five: 90, four: 75, three: 60 }
  const grade = percent >= gradeScale.five ? 5 : percent >= gradeScale.four ? 4 : percent >= gradeScale.three ? 3 : 2
  const title = quiz?.title ?? 'Тест'
  const subtitle = quiz?.subtitle ?? 'Проверьте знания, получите оценку и разберите ошибки.'

  const start = () => {
    setAnswers({})
    setIndex(0)
    setChecked(false)
    setStage('active')
  }

  const next = () => {
    if (!checked) {
      setChecked(true)
      return
    }
    if (index === questions.length - 1) {
      saveAttempt(quizId, answers, score, questions.length)
      setStage('result')
      return
    }
    setIndex((value) => value + 1)
    setChecked(false)
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <Brain size={42} />
        <h1>Опубликованных вопросов пока нет</h1>
        <Link className="primary-button" to="/quiz">К каталогу тестов</Link>
      </div>
    )
  }

  if (stage === 'intro') {
    const last = progress.attempts.find((attempt) => attempt.quizId === quizId)
    return (
      <div className="quiz-intro">
        <div className="quiz-intro__art"><GraduationCap size={58} /></div>
        <p className="eyebrow">{quiz?.topic ?? 'Проверка знаний'}</p>
        <h1>{title}</h1>
        <p>{subtitle} В учебном режиме объяснение появляется сразу после ответа.</p>
        <div className="quiz-feature-grid">
          <div><span><Target size={20} /></span><strong>{questions.length} вопросов</strong><small>в этом тесте</small></div>
          <div><span><Clock3 size={20} /></span><strong>≈ {quiz?.estimatedMinutes ?? 8} минут</strong><small>без ограничения</small></div>
          <div><span><Brain size={20} /></span><strong>С объяснениями</strong><small>учимся на ошибках</small></div>
        </div>
        {last && (
          <div className="last-result">
            <Trophy size={20} />
            <span>Последний результат</span>
            <strong>{Math.round((last.score / last.total) * 100)}%</strong>
          </div>
        )}
        <button className="primary-button primary-button--large" onClick={start}>
          Начать тест <ArrowRight size={19} />
        </button>
        <Link className="text-button quiz-back-link" to="/quiz"><ArrowLeft size={16} /> Все тесты</Link>
        <small className="quiz-note">Результат сохраняется автоматически</small>
      </div>
    )
  }

  if (stage === 'result') {
    return (
      <div className="quiz-result">
        <div className={`result-grade result-grade--${grade}`}><span>{grade}</span><small>оценка</small></div>
        <p className="eyebrow">Тест завершён</p>
        <h1>{grade >= 4 ? 'Отличная работа!' : grade === 3 ? 'Хорошее начало' : 'Стоит повторить материал'}</h1>
        <p>Вы ответили правильно на {score} из {questions.length} вопросов.</p>
        <div className="result-score">
          <strong>{percent}%</strong>
          <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
        </div>
        <div className="result-breakdown">
          <div><CheckCircle2 size={21} /><span><strong>{score}</strong> правильных</span></div>
          <div><X size={21} /><span><strong>{questions.length - score}</strong> ошибок</span></div>
        </div>
        <div className="result-actions">
          <button className="secondary-button" onClick={start}><RotateCcw size={17} /> Пройти ещё раз</button>
          <Link className="primary-button" to="/quiz">К каталогу тестов <ArrowRight size={17} /></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-active">
      <header className="quiz-active__header">
        <button className="text-button" onClick={() => setStage('intro')}><ArrowLeft size={17} /> Выйти</button>
        <div className="quiz-counter"><span>Вопрос {index + 1}</span><strong>из {questions.length}</strong></div>
        <span className="quiz-topic">{current.topic}</span>
      </header>
      <div className="quiz-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>

      <article className="question-card">
        <p className="eyebrow">Выберите один ответ</p>
        <h1>{current.text}</h1>
        <div className="answer-options">
          {current.options.map((option, optionIndex) => {
            const isSelected = selected === option.id
            const isCorrect = checked && option.id === current.correctOptionId
            const isWrong = checked && isSelected && option.id !== current.correctOptionId
            return (
              <button
                key={option.id}
                type="button"
                disabled={checked}
                onClick={() => setAnswers((items) => ({ ...items, [current.id]: option.id }))}
                className={`answer-option ${isSelected ? 'answer-option--selected' : ''} ${isCorrect ? 'answer-option--correct' : ''} ${isWrong ? 'answer-option--wrong' : ''}`}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                <strong>{option.text}</strong>
                {isCorrect && <Check size={19} />}
                {isWrong && <X size={19} />}
              </button>
            )
          })}
        </div>
        {checked && (
          <div className={`answer-explanation ${selected === current.correctOptionId ? 'answer-explanation--correct' : 'answer-explanation--wrong'}`}>
            <span>{selected === current.correctOptionId ? <CheckCircle2 size={22} /> : <Brain size={22} />}</span>
            <div>
              <strong>{selected === current.correctOptionId ? 'Верно!' : 'Разберём ответ'}</strong>
              <p>{current.explanation}</p>
              <small>Источник: {current.source}</small>
            </div>
          </div>
        )}
        <footer className="question-card__footer">
          <span>{checked ? 'Объяснение сохранится в работе над ошибками' : 'Можно изменить ответ до проверки'}</span>
          <button className="primary-button" disabled={!selected} onClick={next}>
            {!checked ? 'Проверить' : index === questions.length - 1 ? 'Завершить' : 'Следующий вопрос'} <ArrowRight size={18} />
          </button>
        </footer>
      </article>
    </div>
  )
}
