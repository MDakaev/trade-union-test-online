import { ArrowRight, Brain, Check, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app-context'

export function ReviewPage() {
  const { course, progress, toggleCard } = useApp()
  const [cards] = useState(() =>
    course.lessons
      .flatMap((lesson) => lesson.cards)
      .filter((card) => !progress.masteredCards.includes(card.id)),
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const current = cards[index]

  const answer = (mastered: boolean) => {
    const already = progress.masteredCards.includes(current.id)
    if (mastered !== already) toggleCard(current.id)
    if (index === cards.length - 1) {
      setFinished(true)
    } else {
      setIndex((value) => value + 1)
      setFlipped(false)
    }
  }

  if (!current) {
    return (
      <div className="empty-state">
        <Brain size={42} />
        <h1>Карточек для повторения пока нет</h1>
        <Link className="primary-button" to="/course">Перейти к курсу</Link>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="review-finished">
        <span><Check size={36} /></span>
        <p className="eyebrow">Повторение завершено</p>
        <h1>Отлично, всё на сегодня</h1>
        <p>Вы повторили {cards.length} карточек. Следующая подборка появится завтра.</p>
        <button className="secondary-button" onClick={() => { setIndex(0); setFlipped(false); setFinished(false) }}>
          <RotateCcw size={17} /> Повторить ещё раз
        </button>
        <Link className="primary-button" to="/">На главную <ArrowRight size={17} /></Link>
      </div>
    )
  }

  return (
    <div className="review-page">
      <header className="review-header">
        <div>
          <p className="eyebrow">Интервальное повторение</p>
          <h1>Карточки на сегодня</h1>
          <p>Сначала попробуйте вспомнить ответ, затем переверните карточку.</p>
        </div>
        <div className="review-count"><Brain size={22} /><span><strong>{index + 1}</strong> / {cards.length}</span></div>
      </header>
      <div className="review-progress"><span style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>

      <div className="review-stage">
        <div className="review-topic"><Sparkles size={15} /> {current.topic}</div>
        <button className={`review-card ${flipped ? 'review-card--flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
          <small>{flipped ? 'Ответ' : 'Вопрос'}</small>
          <strong>{flipped ? current.back : current.front}</strong>
          <span>{flipped ? 'Нажмите, чтобы увидеть вопрос' : 'Нажмите, чтобы показать ответ'}</span>
        </button>
        {flipped ? (
          <div className="review-actions">
            <button className="review-answer review-answer--again" onClick={() => answer(false)}>
              <ThumbsDown size={19} /><span><strong>Повторить</strong><small>покажем снова скоро</small></span>
            </button>
            <button className="review-answer review-answer--know" onClick={() => answer(true)}>
              <ThumbsUp size={19} /><span><strong>Знаю</strong><small>увеличим интервал</small></span>
            </button>
          </div>
        ) : (
          <p className="review-hint">Не спешите — активное вспоминание укрепляет память лучше перечитывания.</p>
        )}
      </div>
    </div>
  )
}
