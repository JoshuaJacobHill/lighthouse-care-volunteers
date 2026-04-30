'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

interface RosterActionsProps {
  shiftId: string
  locationId: string
  shiftDate: string
}

export function RosterActions({ shiftId }: RosterActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this shift? This cannot be undone.')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error ?? 'Failed to delete shift.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => alert('Edit shift — coming soon.')}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="Edit shift"
        title="Edit shift"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
        aria-label="Delete shift"
        title="Delete shift"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
