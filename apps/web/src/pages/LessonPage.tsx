import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  Lightbulb,
  ListChecks,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../lib/app-context'

export function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { course, progress, completeLesson, setLessonProgress } = useApp()
  const lesson = course.lessons.find((item) => item.id === lessonId)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showCards, setShowCards] = useState(false)

  const module = course.modules.find((item) => item.id === lesson?.moduleId)
  const lessonIndex = module?.lessonIds.indexOf(lessonId ?? '') ?? -1
  const nextLesson = course.lessons.find((item) => item.id === module?.lessonIds[lessonIndex + 1])
  const lessonProgress = progress.lessonProgress[lessonId ?? ''] ?? 0

  useEffect(() => {
    if (!lessonId) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const root = document.documentElement
        const scrollable = root.scrollHeight - root.clientHeight
        if (scrollable <= 0) return
        setLessonProgress(lessonId, Math.min(95, Math.round((root.scrollTop / scrollable) * 100)))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [lessonId, setLessonProgress])

  const cards = useMemo(() => lesson?.cards ?? [], [lesson])

  if (!lesson) {
    return (
      <div className="empty-state">
        <BookOpen size={42} />
        <h1>Урок не найден</h1>
        <Link className="primary-button" to="/course">Вернуться к курсу</Link>
      </div>
    )
  }

  const finish = () => {
    completeLesson(lesson.id)
    if (nextLesson) navigate(`/lesson/${nextLesson.id}`)
    else navigate('/course')
  }

  return (
    <div className="lesson-page">
      <div className="lesson-topline">
        <Link to="/course"><ArrowLeft size={18} /> К программе</Link>
        <div className="lesson-topline__progress">
          <span>{lessonProgress}%</span>
          <div className="progress-track progress-track--thin"><span style={{ width: `${lessonProgress}%` }} /></div>
        </div>
      </div>

      <article className="lesson-article">
        <header className="lesson-header">
          <div className="lesson-header__meta">
            <span>Модуль {module?.index}</span>
            <span><Clock3 size={15} /> {lesson.duration} минут</span>
            <span><BookOpen size={15} /> {lesson.source}</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          {lesson.status === 'needs_review' && (
            <div className="review-warning"><TriangleAlert size={18} /> Материал ожидает проверки преподавателем и не входит в итоговый зачёт.</div>
          )}
        </header>

        <div className="lesson-content">
          {lesson.blocks.map((block, index) => {
            if (block.type === 'lead') return <p className="lesson-lead" key={index}>{block.content}</p>
            if (block.type === 'text') return <section key={index}><h2>{block.title}</h2><p>{block.content}</p></section>
            if (block.type === 'callout') {
              return (
                <aside className={`lesson-callout lesson-callout--${block.tone ?? 'info'}`} key={index}>
                  <span>{block.tone === 'warning' ? <TriangleAlert size={21} /> : block.tone === 'success' ? <CheckCircle2 size={21} /> : <Lightbulb size={21} />}</span>
                  <div><strong>{block.title}</strong><p>{block.content}</p></div>
                </aside>
              )
            }
            if (block.type === 'steps') {
              return (
                <section key={index}>
                  <div className="content-title"><ListChecks size={22} /><h2>{block.title}</h2></div>
                  <ol className="procedure-steps">
                    {block.items?.map((item, itemIndex) => <li key={item}><span>{itemIndex + 1}</span><p>{item}</p></li>)}
                  </ol>
                </section>
              )
            }
            return (
              <section key={index}>
                <div className="content-title"><Info size={22} /><h2>{block.title}</h2></div>
                <ul className="fact-list">
                  {block.items?.map((item) => <li key={item}><Check size={16} /><span>{item}</span></li>)}
                </ul>
              </section>
            )
          })}
        </div>

        {cards.length > 0 && (
          <section className="lesson-cards">
            <div className="lesson-cards__intro">
              <span><Sparkles size={22} /></span>
              <div><p className="eyebrow">Закрепление</p><h2>Проверьте себя</h2><p>{cards.length} карточки по материалу урока</p></div>
              {!showCards && <button className="secondary-button" onClick={() => setShowCards(true)}>Начать</button>}
            </div>
            {showCards && (
              <div>
                <button className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
                  <small>{flipped ? 'Ответ' : 'Вопрос'} · {cardIndex + 1}/{cards.length}</small>
                  <strong>{flipped ? cards[cardIndex].back : cards[cardIndex].front}</strong>
                  <span>Нажмите, чтобы перевернуть</span>
                </button>
                <div className="flashcard-controls">
                  <button
                    className="secondary-button"
                    disabled={cardIndex === 0}
                    onClick={() => { setCardIndex((value) => value - 1); setFlipped(false) }}
                  >Назад</button>
                  <button
                    className="primary-button"
                    disabled={cardIndex === cards.length - 1}
                    onClick={() => { setCardIndex((value) => value + 1); setFlipped(false) }}
                  >Следующая <ArrowRight size={17} /></button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="lesson-finish">
          <div><CheckCircle2 size={27} /><div><strong>Материал изучен?</strong><p>Отметьте урок завершённым и переходите дальше.</p></div></div>
          <button className="primary-button" onClick={finish}>
            {progress.completedLessons.includes(lesson.id) ? 'Перейти дальше' : 'Завершить урок'} <ArrowRight size={18} />
          </button>
        </footer>
      </article>
    </div>
  )
}
