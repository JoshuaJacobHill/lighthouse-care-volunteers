'use client'

import { useState, useTransition } from 'react'
import { updateInductionSectionAction, deleteInductionSectionAction } from '@/lib/actions/admin.actions'

interface Section {
  id: string
  title: string
  content: string
  sortOrder: number
  isRequired: boolean
  isActive: boolean
}

interface EditState {
  title: string
  content: string
  sortOrder: number
  isRequired: boolean
  isActive: boolean
}

function SectionCard({
  section,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDeleted,
  onSaved,
}: {
  section: Section
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDeleted: (id: string) => void
  onSaved: (updated: Section) => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EditState>({
    title: section.title,
    content: section.content,
    sortOrder: section.sortOrder,
    isRequired: section.isRequired,
    isActive: section.isActive,
  })

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateInductionSectionAction(section.id, form)
      if (result.success && result.data) {
        onSaved(result.data as Section)
        setEditing(false)
      } else {
        setError(result.error ?? 'Failed to save section.')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Delete section "${section.title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteInductionSectionAction(section.id)
      if (result.success) {
        onDeleted(section.id)
      } else {
        setError(result.error ?? 'Failed to delete section.')
      }
    })
  }

  if (editing) {
    return (
      <div className="bg-white border border-orange-300 rounded-lg p-5 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                Required
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                Active
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
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
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex-shrink-0 mt-0.5">
            {section.sortOrder}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  section.isRequired
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {section.isRequired ? 'Required' : 'Optional'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  section.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {section.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {section.content.slice(0, 100)}{section.content.length > 100 ? '…' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors font-medium"
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

interface NewSectionForm {
  title: string
  content: string
  sortOrder: number
  isRequired: boolean
  isActive: boolean
}

function NewSectionCard({
  defaultSortOrder,
  onSaved,
  onCancel,
}: {
  defaultSortOrder: number
  onSaved: (section: Section) => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<NewSectionForm>({
    title: '',
    content: '',
    sortOrder: defaultSortOrder,
    isRequired: true,
    isActive: true,
  })

  function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.content.trim()) { setError('Content is required.'); return }
    setError(null)
    startTransition(async () => {
      const result = await updateInductionSectionAction(null, form)
      if (result.success && result.data) {
        onSaved(result.data as Section)
      } else {
        setError(result.error ?? 'Failed to create section.')
      }
    })
  }

  return (
    <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-orange-600 mb-4">New Section</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Welcome to Lighthouse Care"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={8}
            placeholder="Write the induction content here…"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                className="w-4 h-4 accent-orange-500"
              />
              Required
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-orange-500"
              />
              Active
            </label>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Add Section'}
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

export default function InductionSectionsManager({ sections: initial }: { sections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initial)
  const [addingNew, setAddingNew] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSaved(updated: Section) {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next.sort((a, b) => a.sortOrder - b.sortOrder)
      }
      return [...prev, updated].sort((a, b) => a.sortOrder - b.sortOrder)
    })
  }

  function handleDeleted(id: string) {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  function handleNewSaved(section: Section) {
    setSections(prev => [...prev, section].sort((a, b) => a.sortOrder - b.sortOrder))
    setAddingNew(false)
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const reordered = [...sections]
    const temp = reordered[index - 1].sortOrder
    reordered[index - 1] = { ...reordered[index - 1], sortOrder: reordered[index].sortOrder }
    reordered[index] = { ...reordered[index], sortOrder: temp }
    reordered.sort((a, b) => a.sortOrder - b.sortOrder)
    setSections(reordered)

    // Persist both swapped sections
    startTransition(async () => {
      await updateInductionSectionAction(reordered[index - 1].id, {
        title: reordered[index - 1].title,
        content: reordered[index - 1].content,
        sortOrder: reordered[index - 1].sortOrder,
        isRequired: reordered[index - 1].isRequired,
        isActive: reordered[index - 1].isActive,
      })
      await updateInductionSectionAction(reordered[index].id, {
        title: reordered[index].title,
        content: reordered[index].content,
        sortOrder: reordered[index].sortOrder,
        isRequired: reordered[index].isRequired,
        isActive: reordered[index].isActive,
      })
    })
  }

  function handleMoveDown(index: number) {
    if (index === sections.length - 1) return
    handleMoveUp(index + 1)
  }

  return (
    <div className="space-y-3 max-w-3xl">
      {sections.length === 0 && !addingNew && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No induction sections yet.</p>
          <p className="text-gray-400 text-xs mt-1">Add your first section below.</p>
        </div>
      )}

      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          index={index}
          total={sections.length}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          onDeleted={handleDeleted}
          onSaved={handleSaved}
        />
      ))}

      {addingNew && (
        <NewSectionCard
          defaultSortOrder={sections.length > 0 ? Math.max(...sections.map(s => s.sortOrder)) + 10 : 10}
          onSaved={handleNewSaved}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          disabled={isPending}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors font-medium"
        >
          + Add Section
        </button>
      )}
    </div>
  )
}
