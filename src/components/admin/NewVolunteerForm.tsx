'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { LOCATIONS, AREAS_OF_INTEREST, VOLUNTEER_STATUSES, AUSTRALIAN_STATES } from '@/lib/constants'
import { createVolunteerAction } from '@/lib/actions/admin.actions'

export function NewVolunteerForm() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])

  function toggleMulti(
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const data = {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      email: fd.get('email') as string,
      mobile: fd.get('mobile') as string,
      dateOfBirth: fd.get('dateOfBirth') as string,
      addressLine1: fd.get('addressLine1') as string,
      addressLine2: fd.get('addressLine2') as string,
      suburb: fd.get('suburb') as string,
      state: fd.get('state') as string,
      postcode: fd.get('postcode') as string,
      emergencyName: fd.get('emergencyName') as string,
      emergencyPhone: fd.get('emergencyPhone') as string,
      emergencyRelation: fd.get('emergencyRelation') as string,
      status: fd.get('status') as string,
      notes: fd.get('notes') as string,
      preferredLocations: selectedLocations,
      areasOfInterest: selectedAreas,
    }

    const result = await createVolunteerAction(data)
    setLoading(false)

    if (result.success && result.volunteerId) {
      router.push(`/admin/volunteers/${result.volunteerId}`)
    } else {
      setError(result.error ?? 'Failed to create volunteer. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Personal details */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Personal Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" name="firstName" required autoComplete="given-name" />
          <Input label="Last Name" name="lastName" required autoComplete="family-name" />
          <Input label="Email Address" name="email" type="email" required autoComplete="email" />
          <Input label="Mobile Number" name="mobile" type="tel" required autoComplete="tel" hint="e.g. 0412 345 678" />
          <Input label="Date of Birth" name="dateOfBirth" type="date" />
        </div>
      </section>

      {/* Address */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Address Line 1" name="addressLine1" className="sm:col-span-2" autoComplete="address-line1" />
          <Input label="Address Line 2" name="addressLine2" className="sm:col-span-2" autoComplete="address-line2" />
          <Input label="Suburb" name="suburb" autoComplete="address-level2" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
            <select
              name="state"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select state…</option>
              {AUSTRALIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Input label="Postcode" name="postcode" autoComplete="postal-code" />
        </div>
      </section>

      {/* Emergency contact */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Emergency Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Contact Name" name="emergencyName" autoComplete="off" />
          <Input label="Contact Phone" name="emergencyPhone" type="tel" autoComplete="off" />
          <Input label="Relationship" name="emergencyRelation" placeholder="e.g. Spouse, Parent" />
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Preferences</h2>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Preferred Locations</p>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => toggleMulti(loc, selectedLocations, setSelectedLocations)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedLocations.includes(loc)
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Areas of Interest</p>
          <div className="flex flex-wrap gap-2">
            {AREAS_OF_INTEREST.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleMulti(area, selectedAreas, setSelectedAreas)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedAreas.includes(area)
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Admin settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Admin Settings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Initial Status
            </label>
            <select
              name="status"
              defaultValue="PENDING_INDUCTION"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {(Object.entries(VOLUNTEER_STATUSES) as [string, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <Textarea
          label="Notes"
          name="notes"
          placeholder="Any internal notes about this volunteer…"
          rows={3}
        />
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Volunteer'}
        </Button>
      </div>
    </form>
  )
}
