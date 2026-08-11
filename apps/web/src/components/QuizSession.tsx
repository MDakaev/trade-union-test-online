import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Question } from '../lib/types'

export function MistakeReviewCard({
  question,
  selectedId,
  footerHint,
  footerAction,
  topicLabel,
}: {
  question: Question
  selectedId?: string
  footerHint: string
  footerAction: ReactNode
  topicLabel?: string
}) {
  return (
    <article className="question-card">
      <p className="eyebrow">{topicLabel ?? 'Ваш ответ и правильный вариант'}</p>
      <h1>{question.text}</h1>
      <div className="answer-options">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedId === option.id
          const isCorrect = option.id === question.correctOptionId
          const isWrong = isSelected && !isCorrect
          return (
            <div
              key={option.id}
              className={`answer-option answer-option--static ${isCorrect ? 'answer-option--correct' : ''} ${isWrong ? 'answer-option--wrong' : ''}`}
            >
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              <strong>{option.text}</strong>
              {isCorrect && <Check size={19} />}
              {isWrong && <X size={19} />}
            </div>
          )
        })}
      </div>
      <div className="answer-explanation answer-explanation--wrong">
        <span><Brain size={22} /></span>
        <div>
          <strong>Разберём ответ</strong>
          <p>{question.explanation}</p>
          <small>Источник: {question.source}</small>
        </div>
      </div>
      <footer className="question-card__footer">
        <span>{footerHint}</span>
        {footerAction}
      </footer>
    </article>
  )
}

export function QuestionSession({
  current,
  index,
  total,
  selected,
  checked,
  counterLabel,
  topicLabel,
  onExit,
  onSelect,
  onNext,
  footerHint,
  finishLabel,
}: {
  current: Question
  index: number
  total: number
  selected?: string
  checked: boolean
  counterLabel: string
  topicLabel: string
  onExit: () => void
  onSelect: (optionId: string) => void
  onNext: () => void
  footerHint: string
  finishLabel: string
}) {
  return (
    <div className="quiz-active">
      <header className="quiz-active__header">
        <button className="text-button" type="button" onClick={onExit}><ArrowLeft size={17} /> Выйти</button>
        <div className="quiz-counter"><span>{counterLabel} {index + 1}</span><strong>из {total}</strong></div>
        <span className="quiz-topic">{topicLabel}</span>
      </header>
      <div className="quiz-progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>

      <article className="question-card">
        <p className="eyebrow">Выберите один ответ</p>
        <h1>{current.text}</h1>
        <div className="answer-options">
          {current.options.map((option, optionIndex) => {
            const isSelected = selected === option.id
            const isCorrect = checked && option.id === current.correctOptionId
            const isWrong = checked && isSelected && option.id !== current.correctOptionId
            return (
              <button
                key={option.id}
                type="button"
                disabled={checked}
                onClick={() => onSelect(option.id)}
                className={`answer-option ${isSelected ? 'answer-option--selected' : ''} ${isCorrect ? 'answer-option--correct' : ''} ${isWrong ? 'answer-option--wrong' : ''}`}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                <strong>{option.text}</strong>
                {isCorrect && <Check size={19} />}
                {isWrong && <X size={19} />}
              </button>
            )
          })}
        </div>
        {checked && (
          <div className={`answer-explanation ${selected === current.correctOptionId ? 'answer-explanation--correct' : 'answer-explanation--wrong'}`}>
            <span>{selected === current.correctOptionId ? <CheckCircle2 size={22} /> : <Brain size={22} />}</span>
            <div>
              <strong>{selected === current.correctOptionId ? 'Верно!' : 'Разберём ответ'}</strong>
              <p>{current.explanation}</p>
              <small>Источник: {current.source}</small>
            </div>
          </div>
        )}
        <footer className="question-card__footer">
          <span>{footerHint}</span>
          <button className="primary-button" type="button" disabled={!selected} onClick={onNext}>
            {!checked ? 'Проверить' : index === total - 1 ? finishLabel : 'Следующий вопрос'} <ArrowRight size={18} />
          </button>
        </footer>
      </article>
    </div>
  )
}
