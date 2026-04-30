'use client'

import * as React from 'react'
import { useTransition } from 'react'
import { submitMessageToAdminAction } from '@/lib/actions/volunteer.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (message.trim().length < 10) {
      setError('Please enter at least 10 characters in your message.')
      return
    }

    const fullMessage = subject.trim()
      ? `Subject: ${subject.trim()}\n\n${message.trim()}`
      : message.trim()

    startTransition(async () => {
      const result = await submitMessageToAdminAction(fullMessage)
      if (result.success) {
        setSent(true)
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Message sent!</h1>
              <p className="mt-2 text-sm text-gray-600">
                Your message has been sent. A staff member will get back to you soon.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSent(false)
                setSubject('')
                setMessage('')
              }}
            >
              Send another message
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Admin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Got a question, a concern, or just want to say hello? Our team is here to help.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-600" aria-hidden="true" />
            Send a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about my next shift"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here…"
                rows={6}
                required
                minLength={10}
                maxLength={2000}
                aria-describedby="message-hint"
              />
              <div className="flex justify-between mt-1">
                <p id="message-hint" className="text-xs text-gray-400">
                  Minimum 10 characters
                </p>
                <p className={`text-xs ${message.length > 1900 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {message.length}/2000
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500">
          You can also reach us by phone during business hours. We aim to respond to all messages within 1–2 business days.
        </p>
      </div>
    </div>
  )
}
