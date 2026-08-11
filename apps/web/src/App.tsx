import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CoursePage } from './pages/CoursePage'
import { DashboardPage } from './pages/DashboardPage'
import { LessonPage } from './pages/LessonPage'
import { QuizHubPage } from './pages/QuizHubPage'
import { QuizPage } from './pages/QuizPage'
import { ReviewPage } from './pages/ReviewPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/quiz" element={<QuizHubPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
