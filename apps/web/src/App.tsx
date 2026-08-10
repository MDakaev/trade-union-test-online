import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useApp } from './lib/app-context'
import type { Role } from './lib/types'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CoursePage } from './pages/CoursePage'
import { DashboardPage } from './pages/DashboardPage'
import { LessonPage } from './pages/LessonPage'
import { QuizHubPage } from './pages/QuizHubPage'
import { QuizPage } from './pages/QuizPage'
import { ReviewPage } from './pages/ReviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route element={<RoleRoute role="student" />}>
          <Route index element={<DashboardPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/quiz" element={<QuizHubPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
        </Route>
        <Route element={<RoleRoute role="admin" />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/students" element={<AdminPage />} />
          <Route path="/admin/content" element={<AdminPage />} />
          <Route path="/admin/settings" element={<AdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RoleRoute({ role }: { role: Role }) {
  const { user } = useApp()
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }
  return <Outlet />
}
