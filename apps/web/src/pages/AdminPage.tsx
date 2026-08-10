import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { demoInvites } from '../data/demoCourse'
import { useApp } from '../lib/app-context'

const students = [
  { id: 1, name: 'Алексей Морозов', initials: 'АМ', group: 'МС-26', progress: 72, score: 84, active: 'Сегодня, 18:32', status: 'active' },
  { id: 2, name: 'Мария Соколова', initials: 'МС', group: 'МС-26', progress: 91, score: 94, active: 'Сегодня, 17:10', status: 'active' },
  { id: 3, name: 'Дмитрий Волков', initials: 'ДВ', group: 'МС-26', progress: 46, score: 68, active: 'Вчера, 20:45', status: 'active' },
  { id: 4, name: 'Анна Лебедева', initials: 'АЛ', group: 'МС-27', progress: 34, score: 76, active: 'Вчера, 16:20', status: 'active' },
  { id: 5, name: 'Тимур Алиев', initials: 'ТА', group: 'МС-27', progress: 12, score: 55, active: '3 дня назад', status: 'warning' },
  { id: 6, name: 'Елена Кузнецова', initials: 'ЕК', group: 'МС-26', progress: 100, score: 97, active: 'Сегодня, 12:03', status: 'complete' },
]

export function AdminPage() {
  const location = useLocation()
  if (location.pathname.includes('/students')) return <StudentsAdmin />
  if (location.pathname.includes('/content')) return <ContentAdmin />
  if (location.pathname.includes('/settings')) return <SettingsAdmin />
  return <AdminDashboard />
}

function AdminDashboard() {
  return (
    <div>
      <div className="admin-heading">
        <div><p className="eyebrow">6 августа 2026</p><h1>Обзор обучения</h1><p>Вся активность курса в одном месте.</p></div>
        <button className="primary-button"><UserPlus size={18} /> Пригласить учеников</button>
      </div>
      <div className="admin-stats">
        <Metric icon={Users} label="Всего учеников" value="24" trend="+6" note="за 30 дней" tone="blue" />
        <Metric icon={Activity} label="Активны сегодня" value="18" trend="+12%" note="к прошлой неделе" tone="green" />
        <Metric icon={TrendingUp} label="Средний прогресс" value="64%" trend="+8%" note="за месяц" tone="violet" />
        <Metric icon={Check} label="Средний балл" value="82%" trend="+4%" note="по всем тестам" tone="amber" />
      </div>
      <div className="admin-grid">
        <section className="panel admin-activity">
          <div className="panel__header">
            <div><p className="eyebrow">Динамика</p><h2>Активность учеников</h2></div>
            <button className="select-button">Последние 7 дней <ChevronRight size={15} /></button>
          </div>
          <div className="chart">
            {[48, 68, 54, 83, 71, 94, 76].map((value, index) => (
              <div className="chart__bar-wrap" key={index}>
                <div className="chart__bar" style={{ height: `${value}%` }}><span>{Math.round(value / 4)}</span></div>
                <small>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel__header"><div><p className="eyebrow">Требует внимания</p><h2>Сложные темы</h2></div></div>
          <div className="hard-topics">
            <Topic label="Реанимация" value={48} students={12} />
            <Topic label="Лабораторные исследования" value={57} students={9} />
            <Topic label="Клизмы" value={63} students={7} />
            <Topic label="Питание пациента" value={71} students={5} />
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel__header">
          <div><p className="eyebrow">Последние события</p><h2>Активность</h2></div>
          <button className="text-button">Показать всё <ChevronRight size={16} /></button>
        </div>
        <div className="activity-feed">
          <Feed avatar="МС" name="Мария Соколова" action="завершила итоговый тест" meta="94% · оценка 5" time="12 мин назад" />
          <Feed avatar="ДВ" name="Дмитрий Волков" action="завершил урок «Антропометрия»" meta="18 минут" time="36 мин назад" />
          <Feed avatar="ЕК" name="Елена Кузнецова" action="завершила курс" meta="100% · средний балл 97%" time="1 час назад" />
        </div>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, trend, note, tone }: { icon: typeof Users; label: string; value: string; trend: string; note: string; tone: string }) {
  const positive = !trend.startsWith('-')
  return (
    <article className="admin-metric">
      <span className={`metric-icon metric-icon--${tone}`}><Icon size={21} /></span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p className={positive ? 'positive' : 'negative'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend} <span>{note}</span></p>
    </article>
  )
}

function Topic({ label, value, students: count }: { label: string; value: number; students: number }) {
  return (
    <div className="hard-topic">
      <div><strong>{label}</strong><span>{count} учеников ошибаются</span></div>
      <div className="hard-topic__score"><div className="progress-track progress-track--thin"><span style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>
    </div>
  )
}

function Feed({ avatar, name, action, meta, time }: { avatar: string; name: string; action: string; meta: string; time: string }) {
  return (
    <div className="feed-row"><span className="avatar">{avatar}</span><div><p><strong>{name}</strong> {action}</p><small>{meta}</small></div><time>{time}</time></div>
  )
}

function StudentsAdmin() {
  const [query, setQuery] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const filtered = students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div>
      <div className="admin-heading">
        <div><p className="eyebrow">Управление доступом</p><h1>Ученики</h1><p>Аккаунты, группы и индивидуальный прогресс.</p></div>
        <button className="primary-button" onClick={() => setShowInvite(true)}><KeyRound size={18} /> Создать код</button>
      </div>
      <div className="student-toolbar">
        <label className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени или группе…" /></label>
        <button className="secondary-button"><Filter size={17} /> Фильтры</button>
        <button className="secondary-button"><Download size={17} /> Экспорт</button>
      </div>
      <section className="panel table-panel">
        <div className="data-table">
          <div className="data-table__head"><span>Ученик</span><span>Группа</span><span>Прогресс</span><span>Средний балл</span><span>Активность</span><span /></div>
          {filtered.map((student) => (
            <button className="data-table__row" key={student.id}>
              <span className="student-cell"><span className="avatar">{student.initials}</span><span><strong>{student.name}</strong><small>student-{student.id}@trade-union</small></span></span>
              <span><mark>{student.group}</mark></span>
              <span className="table-progress"><span>{student.progress}%</span><div className="progress-track progress-track--thin"><span style={{ width: `${student.progress}%` }} /></div></span>
              <span className={student.score < 60 ? 'score-low' : 'score-good'}>{student.score}%</span>
              <span className="activity-cell"><i className={`presence presence--${student.status}`} />{student.active}</span>
              <span><MoreHorizontal size={18} /></span>
            </button>
          ))}
        </div>
      </section>

      <h2 className="subsection-title">Активные приглашения</h2>
      <div className="invite-grid">
        {demoInvites.map((invite) => (
          <article className="invite-card" key={invite.id}>
            <div><span><KeyRound size={18} /></span><button><MoreHorizontal size={18} /></button></div>
            <code>{invite.codePreview}</code>
            <strong>Группа {invite.group}</strong>
            <p><CalendarDays size={15} /> До {new Date(invite.expiresAt).toLocaleDateString('ru-RU')}</p>
            <div className="invite-use"><span>{invite.uses} из {invite.maxUses} использовано</span><div className="progress-track progress-track--thin"><span style={{ width: `${(invite.uses / invite.maxUses) * 100}%` }} /></div></div>
          </article>
        ))}
      </div>

      {showInvite && (
        <div className="modal-backdrop" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <span className="modal__icon"><KeyRound size={24} /></span>
            <h2>Новый код приглашения</h2>
            <p>Код будет показан только один раз. Ученик создаст с ним собственный аккаунт.</p>
            <label>Группа<select><option>МС-26</option><option>МС-27</option></select></label>
            <div className="form-row"><label>Количество использований<input type="number" defaultValue="20" /></label><label>Действует до<input type="date" defaultValue="2026-09-15" /></label></div>
            <div className="generated-code"><code>TU26-9K4P-8F2M</code><button><Copy size={17} /></button></div>
            <div className="modal__actions"><button className="secondary-button" onClick={() => setShowInvite(false)}>Отмена</button><button className="primary-button" onClick={() => setShowInvite(false)}>Создать код</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContentAdmin() {
  const { course } = useApp()
  const [selected, setSelected] = useState(course.modules[0]?.id ?? '')
  const module = course.modules.find((item) => item.id === selected)
  if (!module) {
    return (
      <div className="empty-state">
        <FileText size={42} />
        <h1>Модули курса пока не созданы</h1>
      </div>
    )
  }
  return (
    <div>
      <div className="admin-heading">
        <div><p className="eyebrow">CMS курса</p><h1>Материалы</h1><p>Редактируйте программу без участия разработчика.</p></div>
        <div className="heading-actions"><button className="secondary-button"><Upload size={17} /> Импорт</button><button className="primary-button"><Plus size={18} /> Новый урок</button></div>
      </div>
      <div className="content-admin">
        <aside className="content-tree panel">
          <div className="content-tree__header"><strong>Программа курса</strong><button><Plus size={17} /></button></div>
          {course.modules.map((item) => (
            <button className={selected === item.id ? 'active' : ''} onClick={() => setSelected(item.id)} key={item.id}>
              <span>{item.index}</span><div><strong>{item.title}</strong><small>{item.lessonIds.length} уроков</small></div><ChevronRight size={17} />
            </button>
          ))}
        </aside>
        <section className="content-editor panel">
          <div className="content-editor__header">
            <div><p className="eyebrow">Модуль {module.index}</p><h2>{module.title}</h2><p>{module.description}</p></div>
            <button className="secondary-button"><Settings size={17} /> Настроить</button>
          </div>
          <div className="editor-list">
            {module.lessonIds.map((id, index) => {
              const lesson = course.lessons.find((item) => item.id === id)!
              return (
                <article key={id}>
                  <span className="drag-handle">⠿</span>
                  <span className="file-icon"><FileText size={19} /></span>
                  <div><strong>{lesson.title}</strong><small>{lesson.duration} мин · {lesson.blocks.length} блоков · {lesson.cards.length} карточки</small></div>
                  <span className={`status-badge status-badge--${lesson.status}`}>{lesson.status === 'published' ? 'Опубликован' : 'На проверке'}</span>
                  <button title="Предпросмотр"><Eye size={18} /></button><button><MoreHorizontal size={18} /></button>
                  <span className="lesson-order">{index + 1}</span>
                </article>
              )
            })}
          </div>
          <button className="add-content"><Plus size={18} /> Добавить урок</button>
        </section>
      </div>
    </div>
  )
}

function SettingsAdmin() {
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <div className="admin-heading"><div><p className="eyebrow">Конфигурация</p><h1>Настройки</h1><p>Бренд, оценки и безопасность курса.</p></div></div>
      <div className="settings-layout">
        <nav className="settings-nav panel"><button className="active"><ShieldCheck size={18} /> Основные</button><button><TrendingUp size={18} /> Оценивание</button><button><KeyRound size={18} /> Безопасность</button><button><Download size={18} /> Резервные копии</button></nav>
        <section className="settings-form panel">
          <div className="settings-section"><h2>Основные настройки</h2><p>Информация отображается ученикам во всём приложении.</p></div>
          <label>Название платформы<input defaultValue="Trade Union" /></label>
          <label>Название курса<input defaultValue="Младшая медсестра по уходу за больными" /></label>
          <label>Описание<textarea defaultValue="Интерактивная подготовка специалистов по уходу за больными." /></label>
          <div className="form-row"><label>Основной цвет<div className="color-input"><span /><input defaultValue="#155EEF" /></div></label><label>Контакт администратора<input defaultValue="admin@trade-union.ru" /></label></div>
          <div className="settings-section settings-section--border"><h2>Шкала оценок</h2><p>Минимальный процент для получения каждой оценки.</p></div>
          <div className="grade-settings"><label>Оценка 5<input type="number" defaultValue="90" /><span>%</span></label><label>Оценка 4<input type="number" defaultValue="75" /><span>%</span></label><label>Оценка 3<input type="number" defaultValue="60" /><span>%</span></label></div>
          <div className="settings-save"><span>{saved && <><Check size={16} /> Изменения сохранены</>}</span><button className="primary-button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}>Сохранить</button></div>
        </section>
      </div>
    </div>
  )
}
