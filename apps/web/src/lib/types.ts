export type Role = 'student' | 'admin'
export type ContentStatus = 'draft' | 'published' | 'needs_review'

export interface User {
  id: string
  name: string
  login: string
  group: string
  role: Role
}

export interface LessonBlock {
  type: 'lead' | 'text' | 'callout' | 'steps' | 'facts'
  title?: string
  content?: string
  items?: string[]
  tone?: 'info' | 'success' | 'warning'
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  duration: number
  status: ContentStatus
  source: string
  blocks: LessonBlock[]
  cards: Flashcard[]
}

export interface Module {
  id: string
  index: number
  title: string
  description: string
  icon: string
  lessonIds: string[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
  topic: string
}

export interface QuizOption {
  id: string
  text: string
}

export interface Question {
  id: string
  quizId: string
  text: string
  topic: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
  source: string
  status: ContentStatus
}

export interface QuizBank {
  id: string
  title: string
  subtitle?: string
  topic: string
  estimatedMinutes: number
}

export interface Course {
  id: string
  title: string
  subtitle: string
  modules: Module[]
  lessons: Lesson[]
  quizzes: QuizBank[]
  questions: Question[]
  brand?: {
    name?: string
    primaryColor?: string
    gradeScale?: { five: number; four: number; three: number }
  }
  version?: string
  meta?: Record<string, unknown>
}

export interface Attempt {
  id: string
  quizId: string
  date: string
  score: number
  total: number
  answers: Record<string, string>
}

export interface StudentProgress {
  completedLessons: string[]
  lessonProgress: Record<string, number>
  masteredCards: string[]
  attempts: Attempt[]
  streak: number
  lastStudyDate: string | null
  dailyGoal: number
}

export interface Invite {
  id: string
  codePreview: string
  group: string
  expiresAt: string
  maxUses: number
  uses: number
  active: boolean
}
