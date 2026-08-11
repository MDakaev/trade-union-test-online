import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Repeat2,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/app-context'

const navigation = [
  { to: '/', label: 'Главная', icon: LayoutDashboard },
  { to: '/course', label: 'Обучение', icon: BookOpen },
  { to: '/review', label: 'Повторение', icon: Repeat2 },
  { to: '/quiz', label: 'Тесты', icon: GraduationCap },
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
  const { progress, courseReady } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

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
          <p className="nav-caption">Моё обучение</p>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={closeMobile}
              className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__upgrade">
          <span className="sidebar__upgrade-icon">
            <Sparkles size={17} />
          </span>
          <strong>Серия: {progress.streak} {streakWord(progress.streak)}</strong>
          <p>Ещё 7 минут сегодня — и цель выполнена</p>
          <div className="mini-progress">
            <span style={{ width: '54%' }} />
          </div>
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
            <span>Курс</span>
            <strong>{titleForPath(location.pathname)}</strong>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-tabs" aria-label="Навигация на телефоне">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function streakWord(days: number) {
  const mod10 = days % 10
  const mod100 = days % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
  return 'дней'
}

function titleForPath(pathname: string) {
  if (pathname.startsWith('/lesson/')) return 'Урок'
  if (pathname.startsWith('/quiz')) return 'Тестирование'
  if (pathname === '/review') return 'Повторение'
  if (pathname === '/course') return 'Младшая медсестра'
  return 'Главная'
}
