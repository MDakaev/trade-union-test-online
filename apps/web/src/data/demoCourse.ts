import type { Course, Invite, StudentProgress, User } from '../lib/types'

export const demoUser: User = {
  id: 'student-demo',
  name: 'Алексей Морозов',
  login: 'demo',
  group: 'МС-26',
  role: 'student',
}

export const demoAdmin: User = {
  id: 'admin-demo',
  name: 'Администратор',
  login: 'admin',
  group: 'Trade Union',
  role: 'admin',
}

export const initialProgress: StudentProgress = {
  completedLessons: ['medical-law', 'hygiene-hands'],
  lessonProgress: {
    'medical-law': 100,
    'hygiene-hands': 100,
    anthropometry: 64,
  },
  masteredCards: ['card-vbi', 'card-rights', 'card-pulse'],
  attempts: [
    {
      id: 'attempt-1',
      quizId: 'final',
      date: '2026-08-05T17:40:00.000Z',
      score: 7,
      total: 10,
      answers: {},
    },
  ],
  streak: 4,
  lastStudyDate: '2026-08-06',
  dailyGoal: 15,
}

export const demoInvites: Invite[] = [
  {
    id: 'invite-1',
    codePreview: 'TU26-••••-8F2K',
    group: 'МС-26',
    expiresAt: '2026-09-01',
    maxUses: 25,
    uses: 18,
    active: true,
  },
  {
    id: 'invite-2',
    codePreview: 'TU27-••••-4D7M',
    group: 'МС-27',
    expiresAt: '2026-10-15',
    maxUses: 20,
    uses: 6,
    active: true,
  },
]

export const demoCourse: Course = {
  id: 'junior-nurse-care',
  title: 'Младшая медсестра',
  subtitle: 'по уходу за больными',
  quizzes: [
    {
      id: 'final',
      title: 'Итоговый тест',
      subtitle: 'Проверка по материалам курса',
      topic: 'Итоговый контроль',
      estimatedMinutes: 12,
    },
    {
      id: 'nursing-care',
      title: 'Уход за больными',
      subtitle: 'Промежуточный контроль',
      topic: 'Технология медицинских услуг',
      estimatedMinutes: 8,
    },
    {
      id: 'first-aid',
      title: 'Первая помощь',
      subtitle: 'Угрожающие жизни состояния',
      topic: 'Неотложная помощь',
      estimatedMinutes: 10,
    },
    {
      id: 'meds-injections',
      title: 'Лекарства и инъекции',
      subtitle: 'Хранение ЛС, пути введения, осложнения',
      topic: 'Лекарственная терапия',
      estimatedMinutes: 10,
    },
  ],
  modules: [
    {
      id: 'foundation',
      index: 1,
      title: 'Основы профессии',
      description: 'Медицинское право, этика, ЛПУ и инфекционная безопасность',
      icon: 'ShieldCheck',
      lessonIds: ['medical-law', 'hygiene-hands'],
    },
    {
      id: 'assessment',
      index: 2,
      title: 'Оценка состояния',
      description: 'Антропометрия, пульс, давление, дыхание и температура',
      icon: 'Activity',
      lessonIds: ['anthropometry', 'vital-signs', 'thermometry'],
    },
    {
      id: 'daily-care',
      index: 3,
      title: 'Ежедневный уход',
      description: 'Гигиена, бельё, кормление и профилактика пролежней',
      icon: 'HeartHandshake',
      lessonIds: ['patient-hygiene', 'pressure-sores', 'feeding'],
    },
    {
      id: 'procedures',
      index: 4,
      title: 'Процедуры',
      description: 'Клизмы, катетеризация, компрессы и оксигенотерапия',
      icon: 'Stethoscope',
      lessonIds: ['oxygen', 'catheter', 'enema'],
    },
    {
      id: 'emergency',
      index: 5,
      title: 'Неотложная помощь',
      description: 'Гипертонический криз, реанимация и терминальные состояния',
      icon: 'Siren',
      lessonIds: ['hypertensive-crisis', 'resuscitation'],
    },
  ],
  lessons: [
    {
      id: 'medical-law',
      moduleId: 'foundation',
      title: 'Медицинское право и этика',
      description: 'Права пациента, обязанности младшей медсестры и деонтология',
      duration: 12,
      status: 'published',
      source: 'Урок 1.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Медицинское право регулирует отношения, возникающие при оказании медицинской помощи. Знание прав пациента — основа безопасной и уважительной работы.',
        },
        {
          type: 'facts',
          title: 'Главные права пациента',
          items: [
            'Получение медицинской помощи в гарантированном объёме',
            'Выбор врача и медицинской организации',
            'Полная информация о состоянии здоровья и методах лечения',
            'Добровольное согласие или отказ от вмешательства',
            'Сохранение врачебной тайны и облегчение боли',
          ],
        },
        {
          type: 'callout',
          title: 'Запомните',
          content:
            'Любая процедура начинается с идентификации пациента, объяснения цели и хода действий, получения согласия и обеспечения конфиденциальности.',
          tone: 'info',
        },
      ],
      cards: [
        {
          id: 'card-rights',
          front: 'Что такое медицинское право?',
          back: 'Отрасль права, регулирующая отношения при оказании медицинской помощи.',
          topic: 'Медицинское право',
        },
        {
          id: 'card-vbi',
          front: 'Что означает ВБИ?',
          back: 'Внутрибольничная инфекция, возникшая в связи с пребыванием или работой в медицинской организации.',
          topic: 'Инфекционная безопасность',
        },
      ],
    },
    {
      id: 'hygiene-hands',
      moduleId: 'foundation',
      title: 'Инфекционная безопасность',
      description: 'СИЗ, уровни обработки рук и медицинские отходы',
      duration: 18,
      status: 'published',
      source: 'Урок 3-4.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Руки медицинского работника — главный фактор передачи микроорганизмов. Обработка рук проводится до и после контакта с пациентом и перчатками.',
        },
        {
          type: 'steps',
          title: 'Социальная обработка рук',
          items: [
            'Снять кольца и часы, проверить целостность кожи',
            'Намылить руки и мыть не менее 30 секунд',
            'Обработать пальцы, межпальцевые промежутки, ладони и тыл кистей',
            'Смыть пену, держа пальцы выше локтей',
            'Высушить одноразовой салфеткой и закрыть кран салфеткой',
          ],
        },
      ],
      cards: [
        {
          id: 'card-gloves',
          front: 'Заменяют ли перчатки обработку рук?',
          back: 'Нет. Руки обрабатывают до надевания и после снятия перчаток.',
          topic: 'Инфекционная безопасность',
        },
      ],
    },
    {
      id: 'anthropometry',
      moduleId: 'assessment',
      title: 'Антропометрия',
      description: 'Измерение массы, роста и окружности грудной клетки',
      duration: 16,
      status: 'published',
      source: 'Антропометрия, Анатомия.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Антропометрия — комплекс методов оценки морфологических особенностей и физического развития человека.',
        },
        {
          type: 'facts',
          title: 'Что измеряют',
          items: [
            'Массу тела',
            'Рост',
            'Окружность грудной клетки',
            'Жизненную ёмкость лёгких (спирометрия)',
            'Мышечную силу (динамометрия)',
          ],
        },
        {
          type: 'callout',
          title: 'Условия взвешивания',
          content:
            'Утром натощак, после опорожнения мочевого пузыря и кишечника, в одинаковое время и в нательном белье.',
          tone: 'success',
        },
      ],
      cards: [
        {
          id: 'card-anthro',
          front: 'Что не относится к стандартной антропометрии?',
          back: 'Окружность запястья не входит в базовый набор из массы, роста и окружности грудной клетки.',
          topic: 'Антропометрия',
        },
      ],
    },
    {
      id: 'vital-signs',
      moduleId: 'assessment',
      title: 'Пульс и артериальное давление',
      description: 'Нормы, измерение и регистрация показателей',
      duration: 20,
      status: 'published',
      source: 'д.pdf; Урок 3-4.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Пульс и артериальное давление отражают работу сердечно-сосудистой системы и оцениваются в покое.',
        },
        {
          type: 'facts',
          title: 'Ориентиры для взрослого',
          items: [
            'Нормальная частота пульса: 60–80 ударов в минуту',
            'Ориентир АД: 120/80–130/90 мм рт. ст.',
            'Пульсовое давление: 40–50 мм рт. ст.',
            'Первый тон соответствует систолическому давлению',
            'Исчезновение тонов соответствует диастолическому давлению',
          ],
        },
      ],
      cards: [
        {
          id: 'card-pulse',
          front: 'Норма пульса взрослого в покое',
          back: '60–80 ударов в минуту по материалам курса.',
          topic: 'Витальные показатели',
        },
      ],
    },
    {
      id: 'thermometry',
      moduleId: 'assessment',
      title: 'Термометрия и дыхание',
      description: 'Температура тела, частота дыхания и отклонения',
      duration: 18,
      status: 'published',
      source: 'Оксигенотерапия.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Температура зависит от места измерения, времени суток, возраста, приёма пищи и физической активности.',
        },
        {
          type: 'facts',
          title: 'Ключевые термины',
          items: [
            'Апноэ — кратковременная остановка дыхания',
            'Тахипноэ — учащённое дыхание',
            'Брадипноэ — урежённое дыхание',
            'Термометрию в стационаре обычно выполняют дважды в сутки',
          ],
        },
      ],
      cards: [],
    },
    {
      id: 'patient-hygiene',
      moduleId: 'daily-care',
      title: 'Личная гигиена пациента',
      description: 'Уход за кожей, полостью рта и физиологическими отправлениями',
      duration: 22,
      status: 'published',
      source: 'волосами. Кормление. Пролежни)..pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Гигиенический уход сохраняет комфорт, достоинство и здоровье кожи тяжёлого пациента.',
        },
        {
          type: 'callout',
          title: 'Смена белья',
          content:
            'Бельё меняют по мере загрязнения, но не реже одного раза в 7 дней; в реанимации — ежедневно.',
          tone: 'info',
        },
      ],
      cards: [],
    },
    {
      id: 'pressure-sores',
      moduleId: 'daily-care',
      title: 'Профилактика пролежней',
      description: 'Факторы риска, стадии и профилактические меры',
      duration: 24,
      status: 'published',
      source: 'волосами. Кормление. Пролежни)..pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Пролежень — некроз кожи и мягких тканей из-за длительного давления с нарушением кровообращения.',
        },
        {
          type: 'facts',
          title: 'Основные причины',
          items: ['Давление', 'Трение', 'Срезывающая сила', 'Влажность кожи', 'Обездвиженность и обезвоживание'],
        },
        {
          type: 'callout',
          title: 'Критически важно',
          content: 'Положение пациента меняют каждые два часа, оценивая кожу в местах костных выступов.',
          tone: 'warning',
        },
      ],
      cards: [],
    },
    {
      id: 'feeding',
      moduleId: 'daily-care',
      title: 'Кормление и питание',
      description: 'Естественное, энтеральное и парентеральное питание',
      duration: 20,
      status: 'published',
      source: 'волосами. Кормление. Пролежни)..pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Способ питания выбирают по состоянию пациента и сохранности функций пищеварительного тракта.',
        },
      ],
      cards: [],
    },
    {
      id: 'oxygen',
      moduleId: 'procedures',
      title: 'Оксигенотерапия',
      description: 'Способы подачи кислорода и контроль безопасности',
      duration: 16,
      status: 'published',
      source: 'Оксигенотерапия.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Оксигенотерапия повышает уровень кислорода в крови при дыхательной недостаточности.',
        },
        {
          type: 'facts',
          title: 'Методы',
          items: ['Назальные канюли', 'Кислородная маска', 'Высокопоточная терапия', 'Кислородная подушка'],
        },
      ],
      cards: [],
    },
    {
      id: 'catheter',
      moduleId: 'procedures',
      title: 'Мочевой катетер',
      description: 'Асептика, оснащение и алгоритм катетеризации',
      duration: 18,
      status: 'published',
      source: 'Мочевой катетер.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Катетеризация выполняется стерильно, с объяснением процедуры и сохранением приватности пациента.',
        },
      ],
      cards: [],
    },
    {
      id: 'enema',
      moduleId: 'procedures',
      title: 'Клизмы',
      description: 'Виды, показания и алгоритм очистительной клизмы',
      duration: 20,
      status: 'needs_review',
      source: 'Клизмы.pdf (OCR)',
      blocks: [
        {
          type: 'lead',
          content: 'Материал распознан со скана и ожидает финальной проверки преподавателем.',
        },
      ],
      cards: [],
    },
    {
      id: 'hypertensive-crisis',
      moduleId: 'emergency',
      title: 'Гипертонический криз',
      description: 'Признаки, риски и первая помощь',
      duration: 14,
      status: 'published',
      source: 'Гипертонический криз.pdf',
      blocks: [
        {
          type: 'lead',
          content:
            'Гипертонический криз — внезапное значительное повышение давления с риском поражения органов-мишеней.',
        },
      ],
      cards: [],
    },
    {
      id: 'resuscitation',
      moduleId: 'emergency',
      title: 'Реанимация и терминальные состояния',
      description: 'Клиническая смерть, СЛР и признаки эффективности',
      duration: 25,
      status: 'needs_review',
      source: 'Дополнительный проверяемый материал',
      blocks: [
        {
          type: 'lead',
          content:
            'Раздел создан для вопросов итогового теста и требует утверждения ответственным преподавателем.',
        },
      ],
      cards: [],
    },
  ],
  questions: [
    {
      id: 'q1',
      quizId: 'final',
      text: 'Антропометрия включает измерение всего, кроме:',
      topic: 'Антропометрия',
      options: [
        { id: 'a', text: 'роста' },
        { id: 'b', text: 'веса' },
        { id: 'c', text: 'окружности запястья' },
        { id: 'd', text: 'окружности грудной клетки' },
      ],
      correctOptionId: 'c',
      explanation: 'К базовым антропометрическим измерениям относятся рост, масса и окружность грудной клетки.',
      source: 'Антропометрия, Анатомия.pdf',
      status: 'published',
    },
    {
      id: 'q2',
      quizId: 'final',
      text: 'Артериальное давление 160/100 мм рт. ст. называется:',
      topic: 'Витальные показатели',
      options: [
        { id: 'a', text: 'гипотонией' },
        { id: 'b', text: 'брадикардией' },
        { id: 'c', text: 'гипертонией' },
        { id: 'd', text: 'тахикардией' },
      ],
      correctOptionId: 'c',
      explanation: 'Стойкое повышение артериального давления выше нормы — гипертензия (в тесте: гипертония).',
      source: 'д.pdf',
      status: 'published',
    },
    {
      id: 'q3',
      quizId: 'final',
      text: 'Нормальная частота пульса взрослого в минуту:',
      topic: 'Витальные показатели',
      options: [
        { id: 'a', text: '60–80' },
        { id: 'b', text: '45–60' },
        { id: 'c', text: '80–100' },
        { id: 'd', text: '50–70' },
      ],
      correctOptionId: 'a',
      explanation: 'В материалах курса нормальным диапазоном указано 60–80 ударов в минуту.',
      source: 'Урок 3-4.pdf',
      status: 'published',
    },
    {
      id: 'q4',
      quizId: 'final',
      text: 'Кратковременная остановка дыхания называется:',
      topic: 'Дыхание',
      options: [
        { id: 'a', text: 'брадипноэ' },
        { id: 'b', text: 'тахипноэ' },
        { id: 'c', text: 'апноэ' },
        { id: 'd', text: 'асфиксия' },
      ],
      correctOptionId: 'c',
      explanation: 'Апноэ — временное прекращение дыхательных движений.',
      source: 'Оксигенотерапия.pdf',
      status: 'published',
    },
    {
      id: 'q5',
      quizId: 'final',
      text: 'Термометрию в стационаре обычно проводят:',
      topic: 'Термометрия',
      options: [
        { id: 'a', text: '1 раз в сутки' },
        { id: 'b', text: '2 раза в сутки' },
        { id: 'c', text: '3 раза в сутки' },
        { id: 'd', text: 'каждые 2 часа' },
      ],
      correctOptionId: 'b',
      explanation: 'Плановая термометрия выполняется утром и вечером.',
      source: 'Оксигенотерапия.pdf',
      status: 'published',
    },
    {
      id: 'q6',
      quizId: 'final',
      text: 'Опрелости — это:',
      topic: 'Уход',
      options: [
        { id: 'a', text: 'воспаление кожи в естественных складках' },
        { id: 'b', text: 'некротическое повреждение тканей' },
        { id: 'c', text: 'воспаление мышечной ткани' },
        { id: 'd', text: 'струпьевидное повреждение' },
      ],
      correctOptionId: 'a',
      explanation: 'Опрелость возникает в кожных складках под действием влаги и трения.',
      source: 'волосами. Кормление. Пролежни)..pdf',
      status: 'published',
    },
    {
      id: 'q7',
      quizId: 'final',
      text: 'Главная мера профилактики пролежней:',
      topic: 'Пролежни',
      options: [
        { id: 'a', text: 'умывание' },
        { id: 'b', text: 'лечебная физкультура' },
        { id: 'c', text: 'смена положения каждые 2 часа' },
        { id: 'd', text: 'смена положения 3 раза в день' },
      ],
      correctOptionId: 'c',
      explanation: 'Регулярная смена положения снимает длительное давление на ткани.',
      source: 'волосами. Кормление. Пролежни)..pdf',
      status: 'published',
    },
    {
      id: 'q8',
      quizId: 'final',
      text: 'Смена белья пациентам проводится:',
      topic: 'Гигиена',
      options: [
        { id: 'a', text: 'не реже 1 раза в 7 дней' },
        { id: 'b', text: 'каждый день во всех отделениях' },
        { id: 'c', text: '1 раз в 2 недели' },
        { id: 'd', text: '1 раз в 10 дней' },
      ],
      correctOptionId: 'a',
      explanation: 'Бельё меняют также сразу по мере загрязнения.',
      source: 'нательного белья)..pdf',
      status: 'published',
    },
    {
      id: 'q9',
      quizId: 'final',
      text: 'Для очистительной клизмы используется:',
      topic: 'Процедуры',
      options: [
        { id: 'a', text: 'зонд с воронкой' },
        { id: 'b', text: 'грушевидный баллон' },
        { id: 'c', text: 'кружка Эсмарха с наконечником' },
        { id: 'd', text: 'шприц Жане' },
      ],
      correctOptionId: 'c',
      explanation: 'Очистительную клизму взрослому ставят с помощью кружки Эсмарха.',
      source: 'Клизмы.pdf',
      status: 'needs_review',
    },
    {
      id: 'q10',
      quizId: 'final',
      text: 'Достоверный признак биологической смерти:',
      topic: 'Неотложная помощь',
      options: [
        { id: 'a', text: 'прекращение дыхания' },
        { id: 'b', text: 'отсутствие сознания' },
        { id: 'c', text: 'расширение зрачков' },
        { id: 'd', text: 'симптом «кошачьего глаза»' },
      ],
      correctOptionId: 'd',
      explanation: 'Феномен Белоглазова относится к ранним достоверным признакам биологической смерти.',
      source: 'Дополнительный материал',
      status: 'needs_review',
    },
  ],
}
