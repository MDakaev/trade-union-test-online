import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RotateCcw,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { MistakeReviewCard, QuestionSession } from '../components/QuizSession'
import { useApp } from '../lib/app-context'
import { wrongFromAnswers } from '../lib/mistakes'
import type { Question } from '../lib/types'

type Stage = 'intro' | 'active' | 'result' | 'mistakes' | 'practice' | 'practice-result'
type MistakesReturn = 'intro' | 'result'


export function QuizPage() {
  const { quizId = 'final' } = useParams()
  const [searchParams] = useSearchParams()
  const { course, progress, saveAttempt } = useApp()
  const quiz = course.quizzes?.find((item) => item.id === quizId)
  const questions = useMemo(
    () => course.questions.filter((item) => item.quizId === quizId && item.status === 'published'),
    [course.questions, quizId],
  )
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [mistakeQueue, setMistakeQueue] = useState<Question[]>([])
  const [mistakesReturn, setMistakesReturn] = useState<MistakesReturn>('result')
  const [checked, setChecked] = useState(false)

  const lastAttempt = progress.attempts.find((attempt) => attempt.quizId === quizId)
  const lastWrongCount = lastAttempt ? wrongFromAnswers(questions, lastAttempt.answers).length : 0

  const reviewMode = searchParams.get('mode') === 'mistakes'

  useEffect(() => {
    setStage('intro')
    setIndex(0)
    setAnswers({})
    setPracticeAnswers({})
    setMistakeQueue([])
    setChecked(false)
  }, [quizId])

  useEffect(() => {
    if (!reviewMode) return
    const last = progress.attempts.find((attempt) => attempt.quizId === quizId)
    if (!last || questions.length === 0) return
    const wrongs = wrongFromAnswers(questions, last.answers)
    setAnswers({ ...last.answers })
    setPracticeAnswers({})
    setMistakeQueue(wrongs)
    setMistakesReturn('intro')
    setIndex(0)
    setChecked(false)
    setStage(wrongs.length > 0 ? 'mistakes' : 'intro')
  }, [quizId, reviewMode, questions, progress.attempts])

  if (!quiz && course.quizzes?.length) {
    return <Navigate to="/quiz" replace />
  }

  const score = questions.reduce((sum, question) => sum + (answers[question.id] === question.correctOptionId ? 1 : 0), 0)
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const gradeScale = course.brand?.gradeScale ?? { five: 90, four: 75, three: 60 }
  const grade = percent >= gradeScale.five ? 5 : percent >= gradeScale.four ? 4 : percent >= gradeScale.three ? 3 : 2
  const title = quiz?.title ?? 'Тест'
  const subtitle = quiz?.subtitle ?? 'Проверьте знания, получите оценку и разберите ошибки.'
  const errorCount = questions.length - score

  const start = () => {
    setAnswers({})
    setPracticeAnswers({})
    setMistakeQueue([])
    setIndex(0)
    setChecked(false)
    setStage('active')
  }

  const openMistakes = (sourceAnswers: Record<string, string>, from: MistakesReturn) => {
    const wrongs = wrongFromAnswers(questions, sourceAnswers)
    setAnswers({ ...sourceAnswers })
    setPracticeAnswers({})
    setMistakeQueue(wrongs)
    setMistakesReturn(from)
    setIndex(0)
    setChecked(false)
    setStage(wrongs.length > 0 ? 'mistakes' : from)
  }

  const startPractice = () => {
    setPracticeAnswers({})
    setIndex(0)
    setChecked(false)
    setStage('practice')
  }

  const next = () => {
    if (!checked) {
      setChecked(true)
      return
    }
    if (index === questions.length - 1) {
      const finalScore = questions.reduce(
        (sum, question) => sum + (answers[question.id] === question.correctOptionId ? 1 : 0),
        0,
      )
      saveAttempt(quizId, answers, finalScore, questions.length)
      setMistakeQueue(wrongFromAnswers(questions, answers))
      setStage('result')
      return
    }
    setIndex((value) => value + 1)
    setChecked(false)
  }

  const nextMistake = () => {
    if (index >= mistakeQueue.length - 1) {
      setStage(mistakesReturn)
      return
    }
    setIndex((value) => value + 1)
  }

  const nextPractice = () => {
    if (!checked) {
      setChecked(true)
      return
    }
    if (index >= mistakeQueue.length - 1) {
      setStage('practice-result')
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
        {lastAttempt && (
          <div className="last-result">
            <Trophy size={20} />
            <span>Последний результат</span>
            <strong>{Math.round((lastAttempt.score / lastAttempt.total) * 100)}%</strong>
          </div>
        )}
        <button className="primary-button primary-button--large" onClick={start}>
          Начать тест <ArrowRight size={19} />
        </button>
        {lastAttempt && lastWrongCount > 0 && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => openMistakes(lastAttempt.answers, 'intro')}
          >
            <Brain size={17} /> Разобрать ошибки ({lastWrongCount})
          </button>
        )}
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
          <div><X size={21} /><span><strong>{errorCount}</strong> ошибок</span></div>
        </div>
        <div className="result-actions">
          {errorCount > 0 && (
            <button className="primary-button" type="button" onClick={() => openMistakes(answers, 'result')}>
              <Brain size={17} /> Разобрать ошибки
            </button>
          )}
          <button className="secondary-button" type="button" onClick={start}>
            <RotateCcw size={17} /> Пройти ещё раз
          </button>
          {errorCount === 0 ? (
            <Link className="primary-button" to="/quiz">К каталогу тестов <ArrowRight size={17} /></Link>
          ) : (
            <Link className="text-button" to="/quiz">К каталогу тестов</Link>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'mistakes') {
    if (mistakeQueue.length === 0) {
      return (
        <div className="quiz-result">
          <div className="result-grade result-grade--5"><CheckCircle2 size={42} /></div>
          <p className="eyebrow">Работа над ошибками</p>
          <h1>Ошибок нет</h1>
          <p>В этой попытке все ответы верные.</p>
          <div className="result-actions">
            <button className="secondary-button" type="button" onClick={() => setStage(mistakesReturn)}>Назад</button>
            <Link className="primary-button" to="/quiz">К каталогу <ArrowRight size={17} /></Link>
          </div>
        </div>
      )
    }

    const current = mistakeQueue[Math.min(index, mistakeQueue.length - 1)]
    const selectedId = answers[current.id]
    const isLast = index >= mistakeQueue.length - 1

    return (
      <div className="quiz-active">
        <header className="quiz-active__header">
          <button className="text-button" type="button" onClick={() => setStage(mistakesReturn)}>
            <ArrowLeft size={17} /> Назад
          </button>
          <div className="quiz-counter"><span>Ошибка {index + 1}</span><strong>из {mistakeQueue.length}</strong></div>
          <span className="quiz-topic">Работа над ошибками</span>
        </header>
        <div className="quiz-progress"><span style={{ width: `${((index + 1) / mistakeQueue.length) * 100}%` }} /></div>

        <MistakeReviewCard
          question={current}
          selectedId={selectedId}
          footerHint={isLast ? 'Можно потренировать эти вопросы ещё раз' : 'Разберите каждый ошибочный ответ'}
          footerAction={(
            <div className="mistake-footer-actions">
              {isLast && (
                <button className="secondary-button" type="button" onClick={startPractice}>
                  <RotateCcw size={17} /> Потренировать
                </button>
              )}
              <button className="primary-button" type="button" onClick={nextMistake}>
                {isLast ? (mistakesReturn === 'result' ? 'К результату' : 'Готово') : 'Следующая ошибка'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        />
      </div>
    )
  }

  if (stage === 'practice-result') {
    const practiceScore = mistakeQueue.reduce(
      (sum, question) => sum + (practiceAnswers[question.id] === question.correctOptionId ? 1 : 0),
      0,
    )
    const stillWrong = mistakeQueue.filter(
      (question) => practiceAnswers[question.id] !== question.correctOptionId,
    )
    const practicePercent = mistakeQueue.length > 0
      ? Math.round((practiceScore / mistakeQueue.length) * 100)
      : 0

    return (
      <div className="quiz-result">
        <div className={`result-grade ${stillWrong.length === 0 ? 'result-grade--5' : 'result-grade--3'}`}>
          <span>{practicePercent}%</span>
          <small>тренировка</small>
        </div>
        <p className="eyebrow">Повтор ошибочных</p>
        <h1>{stillWrong.length === 0 ? 'Все ошибки закрыты!' : 'Ещё есть над чем поработать'}</h1>
        <p>
          Верно {practiceScore} из {mistakeQueue.length} ранее ошибочных вопросов.
        </p>
        <div className="result-actions">
          {stillWrong.length > 0 && (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setMistakeQueue(stillWrong)
                setPracticeAnswers({})
                setIndex(0)
                setChecked(false)
                setStage('mistakes')
              }}
            >
              <Brain size={17} /> Разобрать оставшиеся
            </button>
          )}
          <button className="secondary-button" type="button" onClick={startPractice}>
            <RotateCcw size={17} /> Ещё раз
          </button>
          <button className="text-button" type="button" onClick={() => setStage(mistakesReturn)}>
            {mistakesReturn === 'result' ? 'К результату теста' : 'К тесту'}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'practice') {
    const current = mistakeQueue[index]
    if (!current) {
      return (
        <div className="quiz-result">
          <p className="eyebrow">Тренировка</p>
          <h1>Нет вопросов для повтора</h1>
          <div className="result-actions">
            <button className="primary-button" type="button" onClick={() => setStage(mistakesReturn)}>Назад</button>
          </div>
        </div>
      )
    }
    const selected = practiceAnswers[current.id]

    return (
      <QuestionSession
        current={current}
        index={index}
        total={mistakeQueue.length}
        selected={selected}
        checked={checked}
        counterLabel="Повтор"
        topicLabel="Тренировка ошибок"
        onExit={() => setStage('mistakes')}
        onSelect={(optionId) => setPracticeAnswers((items) => ({ ...items, [current.id]: optionId }))}
        onNext={nextPractice}
        footerHint={checked ? 'Закрепите объяснение и идите дальше' : 'Ответьте ещё раз на ошибочный вопрос'}
        finishLabel="Завершить тренировку"
      />
    )
  }

  const current = questions[index]
  const selected = answers[current?.id]

  return (
    <QuestionSession
      current={current}
      index={index}
      total={questions.length}
      selected={selected}
      checked={checked}
      counterLabel="Вопрос"
      topicLabel={current.topic}
      onExit={() => setStage('intro')}
      onSelect={(optionId) => setAnswers((items) => ({ ...items, [current.id]: optionId }))}
      onNext={next}
      footerHint={checked ? 'Ошибки можно разобрать после теста' : 'Можно изменить ответ до проверки'}
      finishLabel="Завершить"
    />
  )
}
