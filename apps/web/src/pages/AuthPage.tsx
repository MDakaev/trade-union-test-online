import { ArrowRight, BookOpen, Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'invite'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'invite' && step === 1) setStep(2)
    else navigate('/')
  }

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand__mark"><span /><span /></div>
          <strong>Trade Union</strong>
        </div>
        <div className="auth-copy">
          <span className="auth-copy__icon"><BookOpen size={28} /></span>
          <p className="eyebrow">Учитесь уверенно</p>
          <h1>Знания, которые остаются с вами.</h1>
          <p>Лекции, практика и умное повторение в единой образовательной среде.</p>
          <ul><li><Check size={17} /> Учитесь в удобном темпе</li><li><Check size={17} /> Закрепляйте материал карточками</li><li><Check size={17} /> Следите за своим прогрессом</li></ul>
        </div>
        <small>© 2026 Trade Union · Учебная платформа</small>
        <div className="auth-decoration auth-decoration--one" />
        <div className="auth-decoration auth-decoration--two" />
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-brand"><div className="brand__mark"><span /><span /></div><strong>Trade Union</strong></div>
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setStep(1) }}>Войти</button>
            <button className={mode === 'invite' ? 'active' : ''} onClick={() => { setMode('invite'); setStep(1) }}>Есть код</button>
          </div>
          {mode === 'login' ? (
            <>
              <div className="auth-title"><span><ShieldCheck size={22} /></span><h2>С возвращением</h2><p>Продолжите обучение с того места, где остановились.</p></div>
              <form onSubmit={submit}>
                <label>Логин<div className="field"><input required placeholder="Ваш логин" autoComplete="username" /></div></label>
                <label>Пароль<div className="field"><LockKeyhole size={17} /><input required type={showPassword ? 'text' : 'password'} placeholder="Введите пароль" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
                <div className="auth-options"><label className="checkbox"><input type="checkbox" /><span /> Запомнить меня</label><button type="button">Забыли пароль?</button></div>
                <button className="primary-button primary-button--large" type="submit">Войти <ArrowRight size={18} /></button>
              </form>
            </>
          ) : step === 1 ? (
            <>
              <div className="auth-title"><span><KeyRound size={22} /></span><h2>Введите код доступа</h2><p>Одноразовый код выдаёт администратор Trade Union.</p></div>
              <form onSubmit={submit}>
                <label>Код приглашения<div className="field invite-field"><input required placeholder="TU26-XXXX-XXXX" autoFocus /></div></label>
                <p className="field-hint">Код не чувствителен к регистру и используется один раз.</p>
                <button className="primary-button primary-button--large" type="submit">Продолжить <ArrowRight size={18} /></button>
              </form>
            </>
          ) : (
            <>
              <div className="auth-title"><span><Check size={22} /></span><h2>Создайте аккаунт</h2><p>Код подтверждён. Ваш прогресс будет доступен на всех устройствах.</p></div>
              <form onSubmit={submit}>
                <label>ФИО<div className="field"><input required placeholder="Иванов Иван Иванович" /></div></label>
                <label>Логин<div className="field"><input required placeholder="Придумайте логин" autoComplete="username" /></div></label>
                <label>Пароль<div className="field"><LockKeyhole size={17} /><input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="Не менее 8 символов" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
                <button className="primary-button primary-button--large" type="submit">Создать аккаунт <ArrowRight size={18} /></button>
              </form>
            </>
          )}
          <div className="auth-security"><LockKeyhole size={14} /> Соединение защищено. Мы не передаём ваши данные третьим лицам.</div>
        </div>
      </main>
    </div>
  )
}
