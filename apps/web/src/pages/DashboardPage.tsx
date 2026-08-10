import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app-context'

export function DashboardPage() {
  const { course, user, progress } = useApp()
  const totalLessons = course.lessons.filter((lesson) => lesson.status === 'published').length
  const completed = course.lessons.filter(
    (lesson) => lesson.status === 'published' && progress.completedLessons.includes(lesson.id),
  ).length
  const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0
  const currentLesson =
    course.lessons.find((lesson) => {
      const value = progress.lessonProgress[lesson.id] ?? 0
      return value > 0 && value < 100
    }) ?? course.lessons.find((lesson) => !progress.completedLessons.includes(lesson.id))
  const recentAttempt = progress.attempts[0]
  const totalCards = course.lessons.reduce((total, lesson) => total + lesson.cards.length, 0)
  const dueCards = Math.max(0, totalCards - progress.masteredCards.length)

  return (
    <div className="dashboard">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">Добрый вечер, {user.name.split(' ')[0]}</p>
          <h1>Продолжим обучение?</h1>
          <p className="page-subtitle">Небольшой шаг сегодня — уверенные навыки завтра.</p>
        </div>
        <div className="streak-pill">
          <span><Flame size={20} fill="currentColor" /></span>
          <div><strong>{progress.streak} дня</strong><small>серия занятий</small></div>
        </div>
      </section>

      <section className="hero-study-card">
        <div className="hero-study-card__body">
          <div className="course-kicker">
            <span><BookOpen size={16} /></span>
            Текущий урок
          </div>
          <h2>{currentLesson?.title}</h2>
          <p>{currentLesson?.description}</p>
          <div className="lesson-meta">
            <span><Clock3 size={16} /> {currentLesson?.duration} минут</span>
            <span><Sparkles size={16} /> +{Math.max(2, currentLesson?.cards.length ?? 0)} карточки</span>
          </div>
          <div className="hero-progress">
            <div>
              <span>Пройдено</span>
              <strong>{progress.lessonProgress[currentLesson?.id ?? ''] ?? 0}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${progress.lessonProgress[currentLesson?.id ?? ''] ?? 0}%` }} /></div>
          </div>
          {currentLesson ? (
            <Link className="primary-button" to={`/lesson/${currentLesson.id}`}>
              <Play size={18} fill="currentColor" /> Продолжить <ArrowRight size={18} />
            </Link>
          ) : (
            <Link className="primary-button" to="/course">
              <BookOpen size={18} /> Открыть программу <ArrowRight size={18} />
            </Link>
          )}
        </div>
        <div className="hero-study-card__visual" aria-hidden="true">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <div className="medical-symbol">
            <span />
            <span />
          </div>
          <div className="floating-note floating-note--top">
            <Check size={16} />
            <span>{completed} уроков пройдено</span>
          </div>
          <div className="floating-note floating-note--bottom">
            <Brain size={17} />
            <span>Знания растут</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon stat-icon--blue"><Target size={20} /></span>
          <div><small>Прогресс курса</small><strong>{percent}%</strong></div>
          <div className="stat-ring" style={{ '--progress': `${percent * 3.6}deg` } as React.CSSProperties}><span>{completed}/{totalLessons}</span></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon--violet"><Brain size={20} /></span>
          <div><small>Карточек изучено</small><strong>{progress.masteredCards.length}</strong><em>из {totalCards}</em></div>
          <span className="stat-trend">{dueCards} осталось</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon--amber"><Trophy size={20} /></span>
          <div><small>Последний тест</small><strong>{recentAttempt && recentAttempt.total > 0 ? Math.round((recentAttempt.score / recentAttempt.total) * 100) : 0}%</strong><em>{recentAttempt ? `${recentAttempt.score} из ${recentAttempt.total}` : 'Нет попыток'}</em></div>
          <Link to={recentAttempt ? `/quiz/${recentAttempt.quizId}` : '/quiz'}>
            {recentAttempt ? 'Повторить' : 'К тестам'} <ChevronRight size={15} />
          </Link>
        </article>
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel__header">
            <div><p className="eyebrow">Учебный план</p><h2>Ваш курс</h2></div>
            <Link to="/course">Все модули <ArrowRight size={16} /></Link>
          </div>
          <div className="module-list">
            {course.modules.slice(0, 4).map((module) => {
              const done = module.lessonIds.filter((id) => progress.completedLessons.includes(id)).length
              const modulePercent = module.lessonIds.length > 0 ? Math.round((done / module.lessonIds.length) * 100) : 0
              return (
                <Link className="module-row" to="/course" key={module.id}>
                  <span className={`module-number ${modulePercent === 100 ? 'module-number--done' : ''}`}>
                    {modulePercent === 100 ? <Check size={18} /> : module.index}
                  </span>
                  <div className="module-row__content">
                    <div><strong>{module.title}</strong><span>{done} из {module.lessonIds.length} уроков</span></div>
                    <div className="progress-track progress-track--thin"><span style={{ width: `${modulePercent}%` }} /></div>
                  </div>
                  <ChevronRight size={19} />
                </Link>
              )
            })}
          </div>
        </section>

        <aside className="panel review-panel">
          <div className="review-panel__art" aria-hidden="true"><Brain size={48} /></div>
          <p className="eyebrow">Умное повторение</p>
          <h2>Освежите знания</h2>
          <p>Повторите карточки, которые ещё не отмечены как изученные.</p>
          <div className="review-due"><span>{dueCards}</span><div><strong>карточек</strong><small>≈ {Math.max(1, Math.ceil(dueCards / 2))} минут</small></div></div>
          <Link className="secondary-button" to="/review">Начать повторение <ArrowRight size={17} /></Link>
        </aside>
      </div>
    </div>
  )
}
