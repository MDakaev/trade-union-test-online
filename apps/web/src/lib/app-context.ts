import { createContext, useContext } from 'react'
import type { Course, StudentProgress } from './types'

export interface AppContextValue {
  course: Course
  courseReady: boolean
  progress: StudentProgress
  setLessonProgress: (lessonId: string, value: number) => void
  completeLesson: (lessonId: string) => void
  toggleCard: (cardId: string) => void
  saveAttempt: (quizId: string, answers: Record<string, string>, score: number, total: number) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
