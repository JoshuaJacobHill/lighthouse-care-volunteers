'use client'

import * as React from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }

interface ToastState {
  toasts: Toast[]
}

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] }
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) }
    default:
      return state
  }
}

type Listener = (state: ToastState) => void

let state: ToastState = { toasts: [] }
const listeners: Set<Listener> = new Set()

function dispatch(action: ToastAction) {
  state = toastReducer(state, action)
  listeners.forEach((listener) => listener(state))
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9)
  const duration = toast.duration ?? 4000
  dispatch({ type: 'ADD', toast: { ...toast, id, duration } })
  if (duration > 0) {
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration)
  }
  return id
}

function removeToast(id: string) {
  dispatch({ type: 'REMOVE', id })
}

export function useToastStore(): ToastState {
  const [toastState, setToastState] = React.useState<ToastState>(state)

  React.useEffect(() => {
    const listener: Listener = (newState) => setToastState({ ...newState })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return toastState
}

export function useToast() {
  const toast = (options: Omit<Toast, 'id'>) => addToast(options)

  toast.success = (title: string, description?: string) =>
    addToast({ title, description, variant: 'success' })

  toast.error = (title: string, description?: string) =>
    addToast({ title, description, variant: 'error' })

  toast.warning = (title: string, description?: string) =>
    addToast({ title, description, variant: 'warning' })

  toast.dismiss = removeToast

  return { toast }
}
