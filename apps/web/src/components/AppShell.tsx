import {
  BarChart3,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Repeat2,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/app-context'

const studentNav = [
  { to: '/', label: 'Главная', icon: LayoutDashboard },
  { to: '/course', label: 'Обучение', icon: BookOpen },
  { to: '/review', label: 'Повторение', icon: Repeat2 },
  { to: '/quiz', label: 'Тесты', icon: GraduationCap },
]

const adminNav = [
  { to: '/admin', label: 'Обзор', icon: BarChart3 },
  { to: '/admin/students', label: 'Ученики', icon: Users },
  { to: '/admin/content', label: 'Материалы', icon: BookOpen },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
]

function Brand() {
  return (
    <div className="brand">
      <div className="brand__mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <div>
        <strong>Trade Union</strong>
        <small>Learning platform</small>
      </div>
    </div>
  )
}

export function AppShell() {
  const { user, progress, setRole, isDemo, courseReady } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigation = user.role === 'admin' ? adminNav : studentNav

  const closeMobile = () => setMobileOpen(false)

  if (!courseReady) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        <BookOpen size={42} />
        <h1>Загружаем курс…</h1>
      </div>
    )
  }

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Brand />
          <button
            className="icon-button sidebar__mobile-close"
            type="button"
            onClick={closeMobile}
            aria-label="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Основная навигация">
          <p className="nav-caption">{user.role === 'admin' ? 'Управление' : 'Моё обучение'}</p>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/' || to === '/admin'}
              onClick={closeMobile}
              className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user.role === 'student' && (
          <div className="sidebar__upgrade">
            <span className="sidebar__upgrade-icon">
              <Sparkles size={17} />
            </span>
            <strong>Серия: {progress.streak} дня</strong>
            <p>Ещё 7 минут сегодня — и цель выполнена</p>
            <div className="mini-progress">
              <span style={{ width: '54%' }} />
            </div>
          </div>
        )}

        <div className="sidebar__footer">
          {isDemo && (
            <button
              className="demo-switch"
              type="button"
              onClick={() => {
                setRole(user.role === 'admin' ? 'student' : 'admin')
                closeMobile()
              }}
            >
              <ShieldCheck size={18} />
              <span>{user.role === 'admin' ? 'Режим ученика' : 'Открыть демо админки'}</span>
            </button>
          )}
          <button className="profile-chip" type="button">
            <span className="avatar">{user.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>
            <span className="profile-chip__text">
              <strong>{user.name}</strong>
              <small>{user.role === 'admin' ? 'Администратор' : `Группа ${user.group}`}</small>
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-backdrop" onClick={closeMobile} aria-label="Закрыть меню" />}

      <div className="app-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
          <button
            className="icon-button collapse-button"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <PanelLeftClose size={20} />
          </button>
          <div className="topbar__crumb">
            <span>{user.role === 'admin' ? 'Панель управления' : 'Курс'}</span>
            <strong>{titleForPath(location.pathname)}</strong>
          </div>
          {isDemo && <span className="demo-badge">Демо</span>}
          <button className="icon-button topbar__logout" type="button" aria-label="Выйти">
            <LogOut size={19} />
          </button>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>

      {user.role === 'student' && (
        <nav className="mobile-tabs" aria-label="Навигация на телефоне">
          {studentNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}

function titleForPath(pathname: string) {
  if (pathname.startsWith('/lesson/')) return 'Урок'
  if (pathname.startsWith('/quiz')) return 'Тестирование'
  if (pathname === '/review') return 'Повторение'
  if (pathname === '/course') return 'Младшая медсестра'
  if (pathname.startsWith('/admin/students')) return 'Ученики'
  if (pathname.startsWith('/admin/content')) return 'Материалы'
  if (pathname.startsWith('/admin/settings')) return 'Настройки'
  if (pathname.startsWith('/admin')) return 'Обзор'
  return 'Главная'
}
