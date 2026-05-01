'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

interface EmailTemplateToggleProps {
  templateId: string
  isActive: boolean
}

export function EmailTemplateToggle({ templateId, isActive }: EmailTemplateToggleProps) {
  const router = useRouter()
  const [active, setActive] = React.useState(isActive)
  const [loading, setLoading] = React.useState(false)

  async function toggle() {
    setLoading(true)
    const newValue = !active
    setActive(newValue)

    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newValue }),
      })
      const result = await response.json()
      if (!result.success) {
        setActive(!newValue) // revert
      } else {
        router.refresh()
      }
    } catch {
      setActive(!newValue) // revert
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 ${
        active ? 'bg-orange-500' : 'bg-gray-200'
      }`}
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Disable template' : 'Enable template'}
      title={active ? 'Active — click to disable' : 'Inactive — click to enable'}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          active ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
