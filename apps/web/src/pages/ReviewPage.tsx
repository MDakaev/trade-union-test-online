import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Library,
  Layers,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MistakeReviewCard, QuestionSession } from '../components/QuizSession'
import { useApp } from '../lib/app-context'
import { collectLatestMistakes, groupMistakesByQuiz, type MistakeItem } from '../lib/mistakes'
import type { Flashcard } from '../lib/types'

type View = 'hub' | 'mistakes' | 'practice' | 'practice-result' | 'cards' | 'cards-done' | 'library'

const DAILY_CARD_LIMIT = 10

type CatalogCard = Flashcard & { lessonId: string; lessonTitle: string }

export function ReviewPage() {
  const { course, progress, toggleCard } = useApp()
  const mistakes = useMemo(
    () => collectLatestMistakes(course, progress.attempts),
    [course, progress.attempts],
  )
  const mistakeGroups = useMemo(() => groupMistakesByQuiz(mistakes), [mistakes])

  const catalogCards = useMemo<CatalogCard[]>(
    () => course.lessons.flatMap((lesson) =>
      lesson.cards.map((card) => ({
        ...card,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      })),
    ),
    [course.lessons],
  )

  const allDueCards = useMemo(
    () => catalogCards.filter((card) => !progress.masteredCards.includes(card.id)),
    [catalogCards, progress.masteredCards],
  )
  const dailyCardLimit = Math.min(progress.dailyGoal || DAILY_CARD_LIMIT, DAILY_CARD_LIMIT)

  const [view, setView] = useState<View>('hub')
  const [queue, setQueue] = useState<MistakeItem[]>([])
  const [index, setIndex] = useState(0)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [flipped, setFlipped] = useState(false)
  const [libraryOpenId, setLibraryOpenId] = useState<string | null>(null)
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'due' | 'mastered'>('all')

  const startMistakes = (items: MistakeItem[] = mistakes) => {
    if (items.length === 0) return
    setQueue(items)
    setIndex(0)
    setPracticeAnswers({})
    setChecked(false)
    setView('mistakes')
  }

  const startCards = () => {
    const session = allDueCards.slice(0, dailyCardLimit)
    if (session.length === 0) return
    setCards(session)
    setIndex(0)
    setFlipped(false)
    setView('cards')
  }

  const goMistake = (direction: -1 | 1) => {
    setIndex((value) => Math.min(queue.length - 1, Math.max(0, value + direction)))
  }

  const nextMistake = () => {
    if (index >= queue.length - 1) {
      setView('hub')
      return
    }
    goMistake(1)
  }

  const nextPractice = () => {
    if (!checked) {
      setChecked(true)
      return
    }
    if (index >= queue.length - 1) {
      setView('practice-result')
      return
    }
    setIndex((value) => value + 1)
    setChecked(false)
  }

  const goCard = (direction: -1 | 1) => {
    setIndex((value) => Math.min(cards.length - 1, Math.max(0, value + direction)))
    setFlipped(false)
  }

  const answerCard = (mastered: boolean) => {
    const current = cards[index]
    if (!current) return
    const already = progress.masteredCards.includes(current.id)
    if (mastered !== already) toggleCard(current.id)
    if (index >= cards.length - 1) {
      setView('cards-done')
    } else {
      setIndex((value) => value + 1)
      setFlipped(false)
    }
  }

  const filteredLibrary = catalogCards.filter((card) => {
    const mastered = progress.masteredCards.includes(card.id)
    if (libraryFilter === 'due') return !mastered
    if (libraryFilter === 'mastered') return mastered
    return true
  })

  if (view === 'mistakes' && queue.length > 0) {
    const current = queue[Math.min(index, queue.length - 1)]
    const isFirst = index <= 0
    const isLast = index >= queue.length - 1
    return (
      <div className="quiz-active">
        <header className="quiz-active__header">
          <button className="text-button" type="button" onClick={() => setView('hub')}>Выйти</button>
          <div className="quiz-counter"><span>Ошибка {index + 1}</span><strong>из {queue.length}</strong></div>
          <span className="quiz-topic">{current.quizTitle}</span>
        </header>
        <div className="quiz-progress"><span style={{ width: `${((index + 1) / queue.length) * 100}%` }} /></div>
        <MistakeReviewCard
          question={current.question}
          selectedId={current.selectedId}
          topicLabel={current.question.topic}
          footerHint={isLast ? 'Можно сразу потренировать эти вопросы' : 'Листайте ошибки вперёд и назад'}
          footerAction={(
            <div className="mistake-footer-actions">
              <button className="secondary-button" type="button" disabled={isFirst} onClick={() => goMistake(-1)}>
                <ArrowLeft size={17} /> Предыдущая
              </button>
              {isLast && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPracticeAnswers({})
                    setIndex(0)
                    setChecked(false)
                    setView('practice')
                  }}
                >
                  <RotateCcw size={17} /> Потренировать
                </button>
              )}
              <button className="primary-button" type="button" onClick={nextMistake}>
                {isLast ? 'К повторению' : 'Далее'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        />
      </div>
    )
  }

  if (view === 'practice' && queue.length > 0) {
    const current = queue[index]
    if (!current) return null
    return (
      <QuestionSession
        current={current.question}
        index={index}
        total={queue.length}
        selected={practiceAnswers[current.question.id]}
        checked={checked}
        counterLabel="Повтор"
        topicLabel={current.quizTitle}
        onExit={() => setView('mistakes')}
        onSelect={(optionId) => setPracticeAnswers((items) => ({ ...items, [current.question.id]: optionId }))}
        onNext={nextPractice}
        footerHint={checked ? 'Закрепите объяснение и идите дальше' : 'Ответьте ещё раз на ошибочный вопрос'}
        finishLabel="Завершить тренировку"
      />
    )
  }

  if (view === 'practice-result') {
    const practiceScore = queue.reduce(
      (sum, item) => sum + (practiceAnswers[item.question.id] === item.question.correctOptionId ? 1 : 0),
      0,
    )
    const stillWrong = queue.filter(
      (item) => practiceAnswers[item.question.id] !== item.question.correctOptionId,
    )
    const practicePercent = queue.length > 0 ? Math.round((practiceScore / queue.length) * 100) : 0

    return (
      <div className="quiz-result">
        <div className={`result-grade ${stillWrong.length === 0 ? 'result-grade--5' : 'result-grade--3'}`}>
          <span>{practicePercent}%</span>
          <small>тренировка</small>
        </div>
        <p className="eyebrow">Повтор ошибочных</p>
        <h1>{stillWrong.length === 0 ? 'Все ошибки закрыты!' : 'Ещё есть над чем поработать'}</h1>
        <p>Верно {practiceScore} из {queue.length} вопросов из ошибок на тестах.</p>
        <div className="result-actions">
          {stillWrong.length > 0 && (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setQueue(stillWrong)
                setPracticeAnswers({})
                setIndex(0)
                setChecked(false)
                setView('mistakes')
              }}
            >
              <Brain size={17} /> Разобрать оставшиеся
            </button>
          )}
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setPracticeAnswers({})
              setIndex(0)
              setChecked(false)
              setView('practice')
            }}
          >
            <RotateCcw size={17} /> Ещё раз
          </button>
          <button className="text-button" type="button" onClick={() => setView('hub')}>
            К повторению
          </button>
        </div>
      </div>
    )
  }

  if (view === 'cards-done') {
    return (
      <div className="review-finished">
        <span><Check size={36} /></span>
        <p className="eyebrow">Карточки на сегодня</p>
        <h1>Сессия завершена</h1>
        <p>Вы прошли {cards.length} карточек. Неизученных осталось: {allDueCards.length}.</p>
        <button className="secondary-button" type="button" onClick={() => setView('hub')}>
          К повторению
        </button>
        <button className="secondary-button" type="button" onClick={() => setView('library')}>
          <Library size={17} /> Все карточки
        </button>
        <Link className="primary-button" to="/">На главную <ArrowRight size={17} /></Link>
      </div>
    )
  }

  if (view === 'cards' && cards.length > 0) {
    const current = cards[index]
    const isFirst = index <= 0
    const isLast = index >= cards.length - 1
    return (
      <div className="review-page">
        <header className="review-header">
          <div>
            <p className="eyebrow">Карточки</p>
            <h1>Короткая сессия</h1>
            <p>Листайте вперёд и назад. Отметьте «Знаю», когда карточка усвоена.</p>
          </div>
          <div className="review-count"><Brain size={22} /><span><strong>{index + 1}</strong> / {cards.length}</span></div>
        </header>
        <div className="review-progress"><span style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>
        <div className="review-stage">
          <button className="text-button review-exit" type="button" onClick={() => setView('hub')}>К повторению</button>
          <div className="review-topic"><Sparkles size={15} /> {current.topic}</div>
          <button className={`review-card ${flipped ? 'review-card--flipped' : ''}`} type="button" onClick={() => setFlipped((value) => !value)}>
            <small>{flipped ? 'Ответ' : 'Вопрос'}</small>
            <strong>{flipped ? current.back : current.front}</strong>
            <span>{flipped ? 'Нажмите, чтобы увидеть вопрос' : 'Нажмите, чтобы показать ответ'}</span>
          </button>

          <div className="review-nav">
            <button className="secondary-button" type="button" disabled={isFirst} onClick={() => goCard(-1)}>
              <ArrowLeft size={17} /> Назад
            </button>
            <button className="secondary-button" type="button" disabled={isLast} onClick={() => goCard(1)}>
              Далее <ArrowRight size={17} />
            </button>
          </div>

          {flipped ? (
            <div className="review-actions">
              <button className="review-answer review-answer--again" type="button" onClick={() => answerCard(false)}>
                <ThumbsDown size={19} /><span><strong>Ещё рано</strong><small>оставим в повторении</small></span>
              </button>
              <button className="review-answer review-answer--know" type="button" onClick={() => answerCard(true)}>
                <ThumbsUp size={19} /><span><strong>Знаю</strong><small>убрать из очереди</small></span>
              </button>
            </div>
          ) : (
            <p className="review-hint">Сначала вспомните ответ — потом переверните карточку.</p>
          )}

          {isLast && (
            <button className="text-button review-finish-link" type="button" onClick={() => setView('cards-done')}>
              Завершить сессию
            </button>
          )}
        </div>
      </div>
    )
  }

  if (view === 'library') {
    return (
      <div className="review-page">
        <header className="review-header">
          <div>
            <button className="text-button review-exit" type="button" onClick={() => setView('hub')}>
              <ArrowLeft size={16} /> К повторению
            </button>
            <p className="eyebrow">Справочник</p>
            <h1>Все карточки</h1>
            <p>Полный набор карточек курса. Откройте карточку, чтобы увидеть ответ.</p>
          </div>
          <div className="review-count"><Library size={22} /><span><strong>{filteredLibrary.length}</strong> / {catalogCards.length}</span></div>
        </header>

        <div className="card-library-filters" role="tablist" aria-label="Фильтр карточек">
          <button type="button" className={libraryFilter === 'all' ? 'is-active' : ''} onClick={() => setLibraryFilter('all')}>Все</button>
          <button type="button" className={libraryFilter === 'due' ? 'is-active' : ''} onClick={() => setLibraryFilter('due')}>К изучению</button>
          <button type="button" className={libraryFilter === 'mastered' ? 'is-active' : ''} onClick={() => setLibraryFilter('mastered')}>Изученные</button>
        </div>

        {filteredLibrary.length === 0 ? (
          <div className="empty-state empty-state--compact">
            <h2>В этом фильтре пока пусто</h2>
            <button className="secondary-button" type="button" onClick={() => setLibraryFilter('all')}>Показать все</button>
          </div>
        ) : (
          <div className="card-library">
            {filteredLibrary.map((card) => {
              const mastered = progress.masteredCards.includes(card.id)
              const open = libraryOpenId === card.id
              return (
                <article key={card.id} className={`card-library-item ${open ? 'card-library-item--open' : ''} ${mastered ? 'card-library-item--mastered' : ''}`}>
                  <button
                    type="button"
                    className="card-library-item__toggle"
                    onClick={() => setLibraryOpenId(open ? null : card.id)}
                    aria-expanded={open}
                  >
                    <div>
                      <small>{card.lessonTitle} · {card.topic}</small>
                      <strong>{card.front}</strong>
                    </div>
                    <span>{open ? 'Скрыть' : 'Ответ'}</span>
                  </button>
                  {open && (
                    <div className="card-library-item__answer">
                      <p>{card.back}</p>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => toggleCard(card.id)}
                      >
                        {mastered ? 'Вернуть к изучению' : 'Отметить изученной'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const cardsToday = Math.min(dailyCardLimit, allDueCards.length)
  const hasSessionWork = mistakes.length > 0 || allDueCards.length > 0

  if (!hasSessionWork && catalogCards.length === 0) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={42} />
        <h1>Пока нечего повторять</h1>
        <p>Пройдите тест или откройте уроки с карточками — материал для повторения появится здесь.</p>
        <div className="result-actions">
          <Link className="primary-button" to="/quiz">К тестам <ArrowRight size={17} /></Link>
          <Link className="secondary-button" to="/course">К курсу</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="review-page">
      <header className="review-header">
        <div>
          <p className="eyebrow">Закрепление</p>
          <h1>Повторение</h1>
          <p>Сначала разберите ошибки по тестам. Карточки помогут закрепить материал короткой сессией.</p>
        </div>
      </header>

      <div className="review-hub">
        <section className={`review-hub-card ${mistakes.length > 0 ? 'review-hub-card--priority' : ''}`}>
          <div className="review-hub-card__icon" aria-hidden="true">
            <Brain size={26} />
          </div>
          <div className="review-hub-card__body">
            <p className="eyebrow">Приоритет</p>
            <h2>Ошибки на тестах</h2>
            {mistakes.length > 0 ? (
              <>
                <p>
                  {mistakes.length} {pluralQuestions(mistakes.length)} из последних попыток. Разберите ответ и при желании потренируйте снова.
                </p>
                <ul className="review-mistake-list">
                  {mistakeGroups.map((group) => (
                    <li key={group.quizId}>
                      <span>{group.quizTitle}</span>
                      <strong>{group.count}</strong>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Пока ошибок нет — пройдите тест, и промахи появятся здесь.</p>
            )}
          </div>
          {mistakes.length > 0 ? (
            <button className="primary-button" type="button" onClick={() => startMistakes()}>
              Разобрать ошибки <ArrowRight size={17} />
            </button>
          ) : (
            <Link className="secondary-button" to="/quiz">К тестам <ArrowRight size={17} /></Link>
          )}
        </section>

        <section className="review-hub-card">
          <div className="review-hub-card__icon review-hub-card__icon--muted" aria-hidden="true">
            <Layers size={26} />
          </div>
          <div className="review-hub-card__body">
            <p className="eyebrow">Сессия</p>
            <h2>Карточки</h2>
            {allDueCards.length > 0 ? (
              <p>
                Сегодня в сессии: {cardsToday} из {allDueCards.length} неизученных карточек.
              </p>
            ) : (
              <p>Все доступные карточки отмечены как изученные.</p>
            )}
          </div>
          {allDueCards.length > 0 ? (
            <button className="secondary-button" type="button" onClick={startCards}>
              <BookOpen size={17} /> Открыть {cardsToday}
            </button>
          ) : catalogCards.length > 0 ? (
            <button className="secondary-button" type="button" onClick={() => setView('library')}>
              <Library size={17} /> Смотреть все
            </button>
          ) : (
            <Link className="text-button" to="/course">К урокам</Link>
          )}
        </section>

        {catalogCards.length > 0 && (
          <section className="review-hub-card">
            <div className="review-hub-card__icon review-hub-card__icon--muted" aria-hidden="true">
              <Library size={26} />
            </div>
            <div className="review-hub-card__body">
              <p className="eyebrow">Справочник</p>
              <h2>Все карточки</h2>
              <p>
                {catalogCards.length} {pluralCards(catalogCards.length)} курса — можно листать и отмечать изученные.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={() => { setLibraryOpenId(null); setView('library') }}>
              Открыть каталог <ArrowRight size={17} />
            </button>
          </section>
        )}
      </div>

      {mistakes.length === 0 && allDueCards.length > 0 && (
        <p className="review-hub-note">
          Рекомендуем начать с контрольного теста: после него здесь появятся персональные ошибки для разбора.
        </p>
      )}
    </div>
  )
}

function pluralQuestions(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'вопрос'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вопроса'
  return 'вопросов'
}

function pluralCards(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'карточка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'карточки'
  return 'карточек'
}
