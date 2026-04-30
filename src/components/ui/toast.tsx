'use client'

import * as React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { clsx } from 'clsx'
import { useToastStore, useToast, type ToastVariant } from './use-toast'

// Re-export hook so consumers can import from either file
export { useToast } from './use-toast'

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-white border-green-200 text-gray-900',
  error: 'bg-white border-red-200 text-gray-900',
  warning: 'bg-white border-amber-200 text-gray-900',
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5 text-teal-600 shrink-0" />,
  success: <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
}

function ToastItem({
  id,
  title,
  description,
  variant = 'default',
  onDismiss,
}: {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  onDismiss: (id: string) => void
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
        variantStyles[variant]
      )}
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToastStore()
  const { toast } = useToast()

  if (!toasts.length) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          {...t}
          onDismiss={toast.dismiss}
        />
      ))}
    </div>
  )
}
