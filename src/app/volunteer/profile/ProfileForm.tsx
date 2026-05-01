'use client'

import * as React from 'react'
import { useTransition } from 'react'
import { updateProfileAction } from '@/lib/actions/volunteer.actions'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LOCATIONS, AREAS_OF_INTEREST, AUSTRALIAN_STATES } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

interface VolunteerProfileData {
  firstName: string
  lastName: string
  email: string
  mobile: string
  dateOfBirth: Date | null
  addressLine1: string | null
  addressLine2: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
  medicalNotes: string | null
  accessibilityNeeds: string | null
  blueCardStatus: string
  blueCardNumber: string | null
  blueCardExpiry: Date | null
  preferredLocations: string[]
  areasOfInterest: string[]
  consentEmailUpdates: boolean
  consentSmsUpdates: boolean
}

interface ProfileFormProps {
  volunteer: VolunteerProfileData
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export default function ProfileForm({ volunteer }: ProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [firstName, setFirstName] = React.useState(volunteer.firstName)
  const [lastName, setLastName] = React.useState(volunteer.lastName)
  const [email] = React.useState(volunteer.email) // email is not editable (account-level)
  const [mobile, setMobile] = React.useState(volunteer.mobile)
  const [dateOfBirth, setDateOfBirth] = React.useState(toDateInputValue(volunteer.dateOfBirth))
  const [addressLine1, setAddressLine1] = React.useState(volunteer.addressLine1 ?? '')
  const [addressLine2, setAddressLine2] = React.useState(volunteer.addressLine2 ?? '')
  const [suburb, setSuburb] = React.useState(volunteer.suburb ?? '')
  const [state, setState] = React.useState(volunteer.state ?? 'QLD')
  const [postcode, setPostcode] = React.useState(volunteer.postcode ?? '')

  const [emergencyName, setEmergencyName] = React.useState(volunteer.emergencyName ?? '')
  const [emergencyPhone, setEmergencyPhone] = React.useState(volunteer.emergencyPhone ?? '')
  const [emergencyRelation, setEmergencyRelation] = React.useState(volunteer.emergencyRelation ?? '')

  const [medicalNotes, setMedicalNotes] = React.useState(volunteer.medicalNotes ?? '')
  const [accessibilityNeeds, setAccessibilityNeeds] = React.useState(volunteer.accessibilityNeeds ?? '')

  const [blueCardStatus, setBlueCardStatus] = React.useState(volunteer.blueCardStatus)
  const [blueCardNumber, setBlueCardNumber] = React.useState(volunteer.blueCardNumber ?? '')
  const [blueCardExpiry, setBlueCardExpiry] = React.useState(toDateInputValue(volunteer.blueCardExpiry))

  const [preferredLocations, setPreferredLocations] = React.useState<string[]>(volunteer.preferredLocations)
  const [areasOfInterest, setAreasOfInterest] = React.useState<string[]>(volunteer.areasOfInterest)

  const [consentEmailUpdates, setConsentEmailUpdates] = React.useState(volunteer.consentEmailUpdates)
  const [consentSmsUpdates, setConsentSmsUpdates] = React.useState(volunteer.consentSmsUpdates)

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  function toggleStringArray(arr: string[], value: string): string[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const formData = new FormData()
    formData.set('firstName', firstName)
    formData.set('lastName', lastName)
    formData.set('mobile', mobile)
    formData.set('dateOfBirth', dateOfBirth)
    formData.set('addressLine1', addressLine1)
    formData.set('addressLine2', addressLine2)
    formData.set('suburb', suburb)
    formData.set('state', state)
    formData.set('postcode', postcode)
    formData.set('emergencyName', emergencyName)
    formData.set('emergencyPhone', emergencyPhone)
    formData.set('emergencyRelation', emergencyRelation)
    formData.set('medicalNotes', medicalNotes)
    formData.set('accessibilityNeeds', accessibilityNeeds)
    formData.set('consentEmailUpdates', consentEmailUpdates ? 'true' : 'false')
    formData.set('consentSmsUpdates', consentSmsUpdates ? 'true' : 'false')

    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.success) {
        toast.success('Profile updated', 'Your details have been saved.')
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        toast.error('Could not save profile', result.error ?? 'Please check the form and try again.')
      }
    })
  }

  const showBlueCardDetails = blueCardStatus === 'CURRENT' || blueCardStatus === 'PENDING' || blueCardStatus === 'EXPIRED'

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Personal details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="mt-1 text-xs text-gray-400">
              To change your email address, please contact our team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                autoComplete="tel"
                placeholder="04xx xxx xxx"
              />
              {fieldErrors.mobile && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.mobile}</p>
              )}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of birth
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                autoComplete="bday"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Address</legend>
            <div className="space-y-3">
              <Input
                placeholder="Street address"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                autoComplete="address-line1"
                aria-label="Street address line 1"
              />
              <Input
                placeholder="Apartment, unit, suite, etc. (optional)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                autoComplete="address-line2"
                aria-label="Street address line 2"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    placeholder="Suburb"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    autoComplete="address-level2"
                    aria-label="Suburb"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="sr-only">State</label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    aria-label="State"
                  >
                    {AUSTRALIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    placeholder="Postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    autoComplete="postal-code"
                    maxLength={4}
                    aria-label="Postcode"
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>

      {/* Emergency contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <Input
                id="emergencyName"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                autoComplete="off"
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="04xx xxx xxx"
              />
            </div>
          </div>
          <div>
            <label htmlFor="emergencyRelation" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <Input
              id="emergencyRelation"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              placeholder="e.g. Partner, Parent, Sibling"
            />
          </div>
        </CardContent>
      </Card>

      {/* Health & accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health & Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Medical notes
            </label>
            <Textarea
              id="medicalNotes"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              rows={3}
              placeholder="Any medical conditions, allergies, or medications our team should be aware of (optional)"
            />
            <p className="mt-1 text-xs text-gray-400">This information is kept private and only shared with relevant staff.</p>
          </div>
          <div>
            <label htmlFor="accessibilityNeeds" className="block text-sm font-medium text-gray-700 mb-1">
              Accessibility needs
            </label>
            <Textarea
              id="accessibilityNeeds"
              value={accessibilityNeeds}
              onChange={(e) => setAccessibilityNeeds(e.target.value)}
              rows={3}
              placeholder="Let us know if you need any adjustments or support to volunteer comfortably (optional)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blue Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blue Card (Working with Children)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Blue card status</legend>
            <div className="space-y-2">
              {(['NOT_APPLICABLE', 'PENDING', 'CURRENT', 'EXPIRED'] as const).map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="blueCardStatus"
                    value={status}
                    checked={blueCardStatus === status}
                    onChange={() => setBlueCardStatus(status)}
                    className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    {status === 'NOT_APPLICABLE' ? 'Not applicable' :
                     status === 'PENDING' ? 'Pending' :
                     status === 'CURRENT' ? 'Current' : 'Expired'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {showBlueCardDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label htmlFor="blueCardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Blue card number
                </label>
                <Input
                  id="blueCardNumber"
                  value={blueCardNumber}
                  onChange={(e) => setBlueCardNumber(e.target.value)}
                  placeholder="e.g. 1234567/1"
                />
              </div>
              <div>
                <label htmlFor="blueCardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry date
                </label>
                <Input
                  id="blueCardExpiry"
                  type="date"
                  value={blueCardExpiry}
                  onChange={(e) => setBlueCardExpiry(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volunteering Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Preferred locations</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id={`loc-${loc}`}
                    checked={preferredLocations.includes(loc)}
                    onCheckedChange={() =>
                      setPreferredLocations((prev) => toggleStringArray(prev, loc))
                    }
                  />
                  <span className="text-sm text-gray-700">{loc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Areas of interest</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AREAS_OF_INTEREST.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id={`area-${area}`}
                    checked={areasOfInterest.includes(area)}
                    onCheckedChange={() =>
                      setAreasOfInterest((prev) => toggleStringArray(prev, area))
                    }
                  />
                  <span className="text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="consentEmail"
              checked={consentEmailUpdates}
              onCheckedChange={(checked) => setConsentEmailUpdates(!!checked)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Email updates</p>
              <p className="text-xs text-gray-500">Receive shift reminders, newsletters, and updates via email</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="consentSms"
              checked={consentSmsUpdates}
              onCheckedChange={(checked) => setConsentSmsUpdates(!!checked)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">SMS updates</p>
              <p className="text-xs text-gray-500">Receive shift reminders and urgent notifications by text</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </form>
  )
}
