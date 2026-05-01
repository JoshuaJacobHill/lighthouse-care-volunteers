'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { manualSignOutAction, manualGuestSignOutAction } from '@/lib/actions/admin.actions'
import { formatDateTime } from '@/lib/utils'

interface RegisteredRecord {
  id: string
  signInAt: Date
  volunteer: {
    id: string
    firstName: string
    lastName: string
    avatarUrl?: string | null
    emergencyName?: string | null
    emergencyPhone?: string | null
  }
  location: {
    name: string
  } | null
}

interface GuestRecord {
  id: string
  firstName: string
  lastName: string
  mobile?: string | null
  volunteerArea?: string | null
  signInAt: Date
  location: {
    name: string
  } | null
}

interface OnSiteClientProps {
  registered: RegisteredRecord[]
  guests: GuestRecord[]
}

function durationSince(date: Date): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

function RevealCell({ value }: { value?: string | null }) {
  const [revealed, setRevealed] = React.useState(false)
  if (!value) return <span className="text-gray-400">—</span>
  return (
    <div className="flex items-center gap-1.5">
      <span className={revealed ? '' : 'blur-sm select-none'}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label={revealed ? 'Hide' : 'Reveal'}
      >
        {revealed ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export function OnSiteClient({ registered, guests }: OnSiteClientProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState<string | null>(null)

  // Auto-refresh every 60 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 60_000)
    return () => clearInterval(interval)
  }, [router])

  async function handleSignOut(attendanceId: string) {
    setSigningOut(attendanceId)
    const result = await manualSignOutAction(attendanceId)
    setSigningOut(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? 'Failed to sign out volunteer.')
    }
  }

  async function handleGuestSignOut(guestId: string) {
    setSigningOut(guestId)
    const result = await manualGuestSignOutAction(guestId)
    setSigningOut(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? 'Failed to sign out guest.')
    }
  }

  const total = registered.length + guests.length

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">On-Site Now</h1>
          <p className="mt-0.5 text-sm text-gray-500">Updates automatically every minute.</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-orange-600">{total}</p>
          <p className="text-sm text-gray-500">
            volunteer{total !== 1 ? 's' : ''} on site
          </p>
        </div>
      </div>

      {/* Registered volunteers */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Registered Volunteers ({registered.length})
        </h2>
        {registered.length === 0 ? (
          <EmptyState message="No registered volunteers are currently on site." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sign-In Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">Emergency Contact</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registered.map((record) => {
                    const name = `${record.volunteer.firstName} ${record.volunteer.lastName}`
                    const emergency = record.volunteer.emergencyName
                      ? `${record.volunteer.emergencyName} — ${record.volunteer.emergencyPhone ?? 'no number'}`
                      : null
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={name}
                              src={record.volunteer.avatarUrl ?? undefined}
                              size="sm"
                            />
                            <span className="font-medium text-gray-900">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDateTime(record.signInAt)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">
                          {durationSince(record.signInAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          {record.location?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <RevealCell value={emergency} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSignOut(record.id)}
                            disabled={signingOut === record.id}
                          >
                            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                            {signingOut === record.id ? 'Signing out…' : 'Sign Out'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Guest volunteers */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Guest Volunteers ({guests.length})
        </h2>
        {guests.length === 0 ? (
          <EmptyState message="No guest volunteers are currently on site." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sign-In Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {guests.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {g.firstName} {g.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {g.mobile ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                        {g.volunteerArea ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(g.signInAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        {durationSince(g.signInAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleGuestSignOut(g.id)}
                          disabled={signingOut === g.id}
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          {signingOut === g.id ? 'Signing out…' : 'Sign Out'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center bg-white">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
