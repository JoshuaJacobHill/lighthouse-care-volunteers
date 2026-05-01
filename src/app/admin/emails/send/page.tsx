'use client'

import * as React from 'react'
import { redirect } from 'next/navigation'
import { Send, Search, Users, MapPin, Tag, User, Loader2, CheckCircle2, X } from 'lucide-react'
import { sendEmailToVolunteerAction } from '@/lib/actions/admin.actions'

type RecipientMode = 'individual' | 'all' | 'by-location' | 'by-interest'

interface VolunteerOption {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface LocationOption {
  id: string
  name: string
}

export default function SendEmailPage() {
  const [recipientMode, setRecipientMode] = React.useState<RecipientMode>('individual')

  // Individual
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<VolunteerOption[]>([])
  const [searchLoading, setSearchLoading] = React.useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = React.useState<VolunteerOption | null>(null)

  // Bulk
  const [locations, setLocations] = React.useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = React.useState('')
  const [selectedInterest, setSelectedInterest] = React.useState('')
  const [recipientCount, setRecipientCount] = React.useState<number | null>(null)

  // Message
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')

  // State
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [confirmStep, setConfirmStep] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  // Load locations on mount
  React.useEffect(() => {
    fetch('/api/admin/locations')
      .then((r) => r.json())
      .then((data) => {
        if (data.locations) setLocations(data.locations)
      })
      .catch(() => {})
  }, [])

  // Load recipient count when mode/selection changes
  React.useEffect(() => {
    if (recipientMode === 'individual') {
      setRecipientCount(selectedVolunteer ? 1 : null)
      return
    }

    const params = new URLSearchParams({ mode: recipientMode })
    if (recipientMode === 'by-location' && selectedLocation) {
      params.set('locationId', selectedLocation)
    }
    if (recipientMode === 'by-interest' && selectedInterest) {
      params.set('interest', selectedInterest)
    }

    fetch(`/api/admin/volunteers/count?${params}`)
      .then((r) => r.json())
      .then((data) => setRecipientCount(data.count ?? null))
      .catch(() => setRecipientCount(null))
  }, [recipientMode, selectedVolunteer, selectedLocation, selectedInterest])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const response = await fetch(
        `/api/admin/volunteers/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setSearchResults(data.volunteers ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleSend() {
    setError(null)
    setSending(true)

    try {
      if (recipientMode === 'individual') {
        if (!selectedVolunteer) {
          setError('Please select a volunteer.')
          setSending(false)
          return
        }

        const result = await sendEmailToVolunteerAction(
          selectedVolunteer.id,
          subject,
          `<p>${body.replace(/\n/g, '<br/>')}</p>`
        )

        if (!result.success) {
          setError(result.error ?? 'Failed to send email.')
          setSending(false)
          return
        }
      } else {
        // Bulk send
        const response = await fetch('/api/admin/emails/bulk-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: recipientMode,
            locationId: selectedLocation || undefined,
            interest: selectedInterest || undefined,
            subject,
            body,
          }),
        })
        const result = await response.json()
        if (!result.success) {
          setError(result.error ?? 'Failed to send emails.')
          setSending(false)
          return
        }
      }

      setSent(true)
      setConfirmStep(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <CheckCircle2 className="h-16 w-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email sent!</h2>
        <p className="text-gray-500 mb-8">
          Your message has been queued for delivery.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSent(false)
              setSubject('')
              setBody('')
              setSelectedVolunteer(null)
              setSearchQuery('')
              setSearchResults([])
              setConfirmStep(false)
            }}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Send another
          </button>
          <a
            href="/admin/emails"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back to Templates
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <a href="/admin/emails" className="hover:text-orange-500 transition-colors">
            Email Templates
          </a>
          <span>/</span>
          <span className="text-gray-700">Send Email</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Send a message to an individual volunteer or a group.
        </p>
      </div>

      {/* Recipient mode selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Send to
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { mode: 'individual', label: 'Individual', icon: User },
              { mode: 'all', label: 'All Active', icon: Users },
              { mode: 'by-location', label: 'By Location', icon: MapPin },
              { mode: 'by-interest', label: 'By Interest', icon: Tag },
            ] as const
          ).map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setRecipientMode(mode)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
                recipientMode === mode
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Individual volunteer search */}
      {recipientMode === 'individual' && (
        <div>
          {selectedVolunteer ? (
            <div className="flex items-center justify-between rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
              <div>
                <div className="font-medium text-orange-800">
                  {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                </div>
                <div className="text-sm text-orange-500">{selectedVolunteer.email}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedVolunteer(null)
                  setSearchResults([])
                  setSearchQuery('')
                }}
                className="rounded-lg p-1.5 text-orange-400 hover:bg-orange-100 hover:text-orange-500 transition-colors"
                aria-label="Remove selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search for volunteer
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Name or email…"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searchLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
                  {searchResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVolunteer(v)
                        setSearchResults([])
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {v.firstName} {v.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{v.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* By location */}
      {recipientMode === 'by-location' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white"
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* By interest */}
      {recipientMode === 'by-interest' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Area of Interest</label>
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white"
          >
            <option value="">All interests</option>
            {[
              'Packing Orders',
              'Warehouse',
              'Grocery Store',
              'Deliveries',
              'Events',
              'Admin',
              'Cleaning',
              'Other',
            ].map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recipient count */}
      {recipientCount !== null && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          <strong>{recipientCount}</strong> recipient{recipientCount === 1 ? '' : 's'} will receive
          this email.
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. A message from Lighthouse Care"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
        <textarea
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message here…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-y"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Confirm step */}
      {confirmStep && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900 mb-2">Confirm Send</h3>
          <p className="text-sm text-amber-700 mb-4">
            You are about to send this email to{' '}
            <strong>{recipientCount ?? 'selected'}</strong> recipient
            {(recipientCount ?? 0) === 1 ? '' : 's'}. This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Yes, send now
            </button>
            <button
              onClick={() => setConfirmStep(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!confirmStep && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setError(null)
              if (!subject.trim() || !body.trim()) {
                setError('Please enter a subject and message body.')
                return
              }
              if (recipientMode === 'individual' && !selectedVolunteer) {
                setError('Please select a volunteer to send to.')
                return
              }
              setConfirmStep(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Send className="h-4 w-4" />
            Review &amp; Send
          </button>
          <a
            href="/admin/emails"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      )}
    </div>
  )
}
