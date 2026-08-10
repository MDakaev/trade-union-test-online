import type { Course } from '../lib/types'
import { demoCourse as fallbackCourse } from '../data/demoCourse'

let cached: Course | null = null

/** Loads the full verified course package for demo/Pages; falls back to bundled demo. */
export async function loadCourse(): Promise<Course> {
  if (cached) return cached
  try {
    const base = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${base}course.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Course
    const questions = (data.questions?.length ? data.questions : fallbackCourse.questions).map((question) => ({
      ...question,
      quizId: question.quizId || 'final',
    }))
    cached = {
      ...fallbackCourse,
      ...data,
      modules: data.modules?.length ? data.modules : fallbackCourse.modules,
      lessons: data.lessons?.length ? data.lessons : fallbackCourse.lessons,
      quizzes: data.quizzes?.length ? data.quizzes : fallbackCourse.quizzes,
      questions,
    }
    return cached
  } catch {
    cached = fallbackCourse
    return cached
  }
}
