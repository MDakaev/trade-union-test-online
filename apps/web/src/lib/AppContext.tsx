import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { demoAdmin, demoUser, initialProgress } from '../data/demoCourse'
import { AppContext, type AppContextValue } from './app-context'
import { loadCourse } from './loadCourse'
import type { Attempt, Course, StudentProgress, User } from './types'

const STORAGE_KEY = 'trade-union-progress-v1'

function loadProgress(): StudentProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialProgress

    const parsed = JSON.parse(saved) as Partial<StudentProgress>
    return {
      ...initialProgress,
      ...parsed,
      completedLessons: stringArray(parsed.completedLessons),
      lessonProgress: numberRecord(parsed.lessonProgress),
      masteredCards: stringArray(parsed.masteredCards),
      attempts: Array.isArray(parsed.attempts) ? (parsed.attempts as Attempt[]) : [],
    }
  } catch {
    return initialProgress
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function numberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => Number.isFinite(entry[1])),
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(demoUser)
  const [progress, setProgress] = useState<StudentProgress>(loadProgress)
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    let alive = true
    loadCourse().then((data) => {
      if (alive) setCourse(data)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Progress still works for this session when storage is unavailable or full.
    }
  }, [progress])

  const updateProgress = useCallback((updater: (current: StudentProgress) => StudentProgress) => {
    setProgress(updater)
  }, [])

  const setRole = useCallback((role: AppContextValue['user']['role']) => {
    setUser(role === 'admin' ? demoAdmin : demoUser)
  }, [])

  const setLessonProgress = useCallback((lessonId: string, value: number) => {
    const normalized = Math.min(100, Math.max(0, value))
    updateProgress((current) => {
      const nextValue = Math.max(current.lessonProgress[lessonId] ?? 0, normalized)
      if (current.lessonProgress[lessonId] === nextValue) return current
      return {
        ...current,
        lessonProgress: { ...current.lessonProgress, [lessonId]: nextValue },
      }
    })
  }, [updateProgress])

  const completeLesson = useCallback((lessonId: string) => {
    updateProgress((current) => ({
      ...current,
      completedLessons: current.completedLessons.includes(lessonId)
        ? current.completedLessons
        : [...current.completedLessons, lessonId],
      lessonProgress: { ...current.lessonProgress, [lessonId]: 100 },
    }))
  }, [updateProgress])

  const toggleCard = useCallback((cardId: string) => {
    updateProgress((current) => ({
      ...current,
      masteredCards: current.masteredCards.includes(cardId)
        ? current.masteredCards.filter((id) => id !== cardId)
        : [...current.masteredCards, cardId],
    }))
  }, [updateProgress])

  const saveAttempt = useCallback<AppContextValue['saveAttempt']>((quizId, answers, score, total) => {
    updateProgress((current) => ({
      ...current,
      attempts: [
        {
          id: crypto.randomUUID(),
          quizId,
          date: new Date().toISOString(),
          score,
          total,
          answers,
        },
        ...current.attempts,
      ],
      lastStudyDate: new Date().toISOString().slice(0, 10),
    }))
  }, [updateProgress])

  const value = useMemo<AppContextValue>(
    () => ({
      course: course ?? {
        id: 'loading',
        title: 'Загрузка…',
        subtitle: '',
        modules: [],
        lessons: [],
        quizzes: [],
        questions: [],
      },
      courseReady: course !== null,
      user,
      progress,
      isDemo: import.meta.env.VITE_APP_MODE !== 'production',
      setRole,
      setLessonProgress,
      completeLesson,
      toggleCard,
      saveAttempt,
    }),
    [completeLesson, course, progress, saveAttempt, setLessonProgress, setRole, toggleCard, user],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
