import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  Play,
  ShieldCheck,
  Siren,
  Stethoscope,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app-context'

const moduleIcons = { ShieldCheck, Activity, HeartHandshake, Stethoscope, Siren }

export function CoursePage() {
  const { course, progress } = useApp()
  const [expanded, setExpanded] = useState<string[]>(['assessment', 'foundation'])
  const published = course.lessons.filter((lesson) => lesson.status === 'published')
  const completedPublished = published.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
  const percent = published.length > 0 ? Math.round((completedPublished / published.length) * 100) : 0
  const currentModuleId = course.modules.find((module) =>
    module.lessonIds.some((id) => !progress.completedLessons.includes(id)),
  )?.id

  return (
    <div>
      <section className="course-hero">
        <div>
          <p className="eyebrow">Профессиональная подготовка</p>
          <h1>{course.title} <span>{course.subtitle}</span></h1>
          <p>Освойте основные навыки ухода шаг за шагом — от безопасного общения до выполнения процедур.</p>
          <div className="course-hero__meta">
            <span>{course.modules.length} модулей</span>
            <span>{published.length} уроков</span>
            <span>≈ 4 часа</span>
          </div>
        </div>
        <div className="course-completion">
          <div className="big-ring" style={{ '--progress': `${percent * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{percent}%</strong><small>пройдено</small></div>
          </div>
          <p>{completedPublished} из {published.length} уроков</p>
        </div>
      </section>

      <div className="section-heading">
        <div><p className="eyebrow">Программа курса</p><h2>Учебные модули</h2></div>
        <span className="legend"><span className="status-dot" /> Ваш текущий модуль</span>
      </div>

      <div className="course-modules">
        {course.modules.map((module) => {
          const lessons = module.lessonIds.flatMap((id) => {
            const lesson = course.lessons.find((item) => item.id === id)
            return lesson ? [lesson] : []
          })
          const done = lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
          const isOpen = expanded.includes(module.id)
          const Icon = moduleIcons[module.icon as keyof typeof moduleIcons] ?? ShieldCheck
          const current = module.id === currentModuleId
          return (
            <article className={`course-module ${current ? 'course-module--current' : ''}`} key={module.id}>
              <button
                type="button"
                className="course-module__header"
                onClick={() => setExpanded((items) => items.includes(module.id) ? items.filter((id) => id !== module.id) : [...items, module.id])}
                aria-expanded={isOpen}
              >
                <span className="course-module__icon"><Icon size={23} /></span>
                <span className="course-module__title">
                  <small>Модуль {module.index}</small>
                  <strong>{module.title}</strong>
                  <em>{module.description}</em>
                </span>
                <span className="course-module__summary">
                  <span>{done}/{lessons.length}</span>
                  <div className="progress-track progress-track--thin"><span style={{ width: `${lessons.length > 0 ? (done / lessons.length) * 100 : 0}%` }} /></div>
                </span>
                <ChevronDown className={isOpen ? 'rotate' : ''} size={20} />
              </button>
              {isOpen && (
                <div className="lesson-list">
                  {lessons.map((lesson, index) => {
                    const completed = progress.completedLessons.includes(lesson.id)
                    const lessonProgress = progress.lessonProgress[lesson.id] ?? 0
                    const review = lesson.status === 'needs_review'
                    return (
                      <Link
                        className={`lesson-row ${completed ? 'lesson-row--done' : ''} ${lessonProgress > 0 && !completed ? 'lesson-row--current' : ''}`}
                        to={`/lesson/${lesson.id}`}
                        key={lesson.id}
                      >
                        <span className="lesson-row__status">
                          {completed ? <Check size={17} /> : review ? <LockKeyhole size={16} /> : index + 1}
                        </span>
                        <span className="lesson-row__content">
                          <strong>{lesson.title}</strong>
                          <small><Clock3 size={14} /> {lesson.duration} мин {review && '· На проверке'}</small>
                        </span>
                        {lessonProgress > 0 && !completed && <span className="continue-label"><Play size={13} fill="currentColor" /> Продолжить</span>}
                        <ArrowRight size={18} />
                      </Link>
                    )
                  })}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
