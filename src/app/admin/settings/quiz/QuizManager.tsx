'use client'

import { useState, useTransition } from 'react'
import { updateQuizQuestionAction, deleteQuizQuestionAction } from '@/lib/actions/admin.actions'

interface QuizOption {
  id: string
  optionText: string
  isCorrect: boolean
  sortOrder: number
}

interface QuizQuestion {
  id: string
  question: string
  sortOrder: number
  isActive: boolean
  options: QuizOption[]
}

interface EditOption {
  id?: string
  optionText: string
  isCorrect: boolean
}

interface EditState {
  question: string
  sortOrder: number
  options: EditOption[]
}

function QuestionCard({
  question,
  onSaved,
  onDeleted,
}: {
  question: QuizQuestion
  onSaved: (updated: QuizQuestion) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EditState>({
    question: question.question,
    sortOrder: question.sortOrder,
    options: question.options.map(o => ({
      id: o.id,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
    })),
  })

  function handleSave() {
    if (!form.question.trim()) { setError('Question text is required.'); return }
    if (form.options.length < 2) { setError('At least two options are required.'); return }
    if (!form.options.some(o => o.isCorrect)) { setError('At least one option must be marked as correct.'); return }
    if (form.options.some(o => !o.optionText.trim())) { setError('All option fields must have text.'); return }
    setError(null)

    startTransition(async () => {
      const result = await updateQuizQuestionAction(question.id, {
        question: form.question,
        sortOrder: form.sortOrder,
        options: form.options.map((o, i) => ({
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          sortOrder: i,
        })),
      })
      if (result.success && result.data) {
        onSaved(result.data as QuizQuestion)
        setEditing(false)
      } else {
        setError(result.error ?? 'Failed to save question.')
      }
    })
  }

  function handleDelete() {
    if (!confirm('Delete this question? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteQuizQuestionAction(question.id)
      if (result.success) {
        onDeleted(question.id)
      } else {
        setError(result.error ?? 'Failed to delete question.')
      }
    })
  }

  function addOption() {
    if (form.options.length >= 4) return
    setForm(f => ({
      ...f,
      options: [...f.options, { optionText: '', isCorrect: false }],
    }))
  }

  function removeOption(index: number) {
    setForm(f => ({
      ...f,
      options: f.options.filter((_, i) => i !== index),
    }))
  }

  function setCorrect(index: number) {
    setForm(f => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })),
    }))
  }

  if (editing) {
    return (
      <div className="bg-white border border-teal-300 rounded-lg p-5 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
              <span className="text-gray-400 font-normal ml-2 text-xs">(select the correct answer)</span>
            </label>
            <div className="space-y-2">
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={option.isCorrect}
                    onChange={() => setCorrect(index)}
                    title="Mark as correct answer"
                    className="w-4 h-4 accent-teal-600 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={e => {
                      const text = e.target.value
                      setForm(f => ({
                        ...f,
                        options: f.options.map((o, i) =>
                          i === index ? { ...o, optionText: text } : o
                        ),
                      }))
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={form.options.length <= 2}
                    title="Remove option"
                    className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {form.options.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add option
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setError(null) }}
              disabled={isPending}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-3">{question.question}</p>
          <ul className="space-y-1.5">
            {question.options.map(option => (
              <li key={option.id} className="flex items-center gap-2 text-sm">
                {option.isCorrect ? (
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 flex-shrink-0 rounded-full border border-gray-300 inline-block" />
                )}
                <span className={option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  {option.optionText}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function NewQuestionCard({
  defaultSortOrder,
  onSaved,
  onCancel,
}: {
  defaultSortOrder: number
  onSaved: (question: QuizQuestion) => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EditState>({
    question: '',
    sortOrder: defaultSortOrder,
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  })

  function setCorrect(index: number) {
    setForm(f => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })),
    }))
  }

  function addOption() {
    if (form.options.length >= 4) return
    setForm(f => ({ ...f, options: [...f.options, { optionText: '', isCorrect: false }] }))
  }

  function removeOption(index: number) {
    setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== index) }))
  }

  function handleSave() {
    if (!form.question.trim()) { setError('Question text is required.'); return }
    if (form.options.length < 2) { setError('At least two options are required.'); return }
    if (!form.options.some(o => o.isCorrect)) { setError('Select the correct answer.'); return }
    if (form.options.some(o => !o.optionText.trim())) { setError('All option fields must have text.'); return }
    setError(null)

    startTransition(async () => {
      const result = await updateQuizQuestionAction(null, {
        question: form.question,
        sortOrder: form.sortOrder,
        options: form.options.map((o, i) => ({
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          sortOrder: i,
        })),
      })
      if (result.success && result.data) {
        onSaved(result.data as QuizQuestion)
      } else {
        setError(result.error ?? 'Failed to create question.')
      }
    })
  }

  return (
    <div className="bg-white border-2 border-dashed border-teal-300 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-teal-700 mb-4">New Question</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <textarea
            value={form.question}
            onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            rows={3}
            placeholder="e.g. What should you do if you feel unwell before your shift?"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
            className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options
            <span className="text-gray-400 font-normal ml-2 text-xs">(select the correct answer)</span>
          </label>
          <div className="space-y-2">
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="new-question-correct"
                  checked={option.isCorrect}
                  onChange={() => setCorrect(index)}
                  title="Mark as correct answer"
                  className="w-4 h-4 accent-teal-600 flex-shrink-0"
                />
                <input
                  type="text"
                  value={option.optionText}
                  onChange={e => {
                    const text = e.target.value
                    setForm(f => ({
                      ...f,
                      options: f.options.map((o, i) =>
                        i === index ? { ...o, optionText: text } : o
                      ),
                    }))
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={form.options.length <= 2}
                  title="Remove option"
                  className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {form.options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              + Add option
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Add Question'}
          </button>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuizManager({ questions: initial }: { questions: QuizQuestion[] }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial)
  const [addingNew, setAddingNew] = useState(false)

  function handleSaved(updated: QuizQuestion) {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next.sort((a, b) => a.sortOrder - b.sortOrder)
      }
      return [...prev, updated].sort((a, b) => a.sortOrder - b.sortOrder)
    })
  }

  function handleDeleted(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  function handleNewSaved(question: QuizQuestion) {
    setQuestions(prev => [...prev, question].sort((a, b) => a.sortOrder - b.sortOrder))
    setAddingNew(false)
  }

  return (
    <div className="space-y-3 max-w-3xl">
      {questions.length === 0 && !addingNew && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No quiz questions yet.</p>
          <p className="text-gray-400 text-xs mt-1">Add your first question below.</p>
        </div>
      )}

      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      ))}

      {addingNew && (
        <NewQuestionCard
          defaultSortOrder={questions.length > 0 ? Math.max(...questions.map(q => q.sortOrder)) + 10 : 10}
          onSaved={handleNewSaved}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium"
        >
          + Add Question
        </button>
      )}
    </div>
  )
}
