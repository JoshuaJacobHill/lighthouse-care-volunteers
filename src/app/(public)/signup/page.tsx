'use client'

import * as React from 'react'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { registerVolunteerAction } from '@/lib/actions/auth.actions'
import {
  LOCATIONS,
  AREAS_OF_INTEREST,
  DAYS_OF_WEEK,
  TIME_PERIODS,
  AUSTRALIAN_STATES,
} from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1
  firstName: string
  lastName: string
  email: string
  mobile: string
  dateOfBirth: string
  addressLine1: string
  addressLine2: string
  suburb: string
  state: string
  postcode: string
  // Step 2
  emergencyName: string
  emergencyPhone: string
  emergencyRelation: string
  medicalNotes: string
  accessibilityNeeds: string
  blueCardStatus: string
  blueCardNumber: string
  blueCardExpiry: string
  // Step 3
  preferredLocations: string[]
  areasOfInterest: string[]
  availability: { day: string; period: string }[]
  notes: string
  // Account
  password: string
  confirmPassword: string
  // Step 4
  agreedToTerms: boolean
  agreedToPrivacy: boolean
  consentEmailUpdates: boolean
  consentSmsUpdates: boolean
  agreedToInduction: boolean
}

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  dateOfBirth: '',
  addressLine1: '',
  addressLine2: '',
  suburb: '',
  state: 'QLD',
  postcode: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  medicalNotes: '',
  accessibilityNeeds: '',
  blueCardStatus: 'Not Applicable',
  blueCardNumber: '',
  blueCardExpiry: '',
  preferredLocations: [],
  areasOfInterest: [],
  availability: [],
  notes: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
  agreedToPrivacy: false,
  consentEmailUpdates: false,
  consentSmsUpdates: false,
  agreedToInduction: false,
}

const STEP_TITLES = [
  'Personal Details',
  'Emergency & Health',
  'Volunteering Preferences',
  'Agreements & Account',
]

const BLUE_CARD_OPTIONS = ['Not Applicable', 'Pending', 'Current', 'Expired']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]
}

function toggleAvailability(
  current: { day: string; period: string }[],
  day: string,
  period: string
): { day: string; period: string }[] {
  const exists = current.some((a) => a.day === day && a.period === period)
  return exists
    ? current.filter((a) => !(a.day === day && a.period === period))
    : [...current, { day, period }]
}

// ─── Subform components ───────────────────────────────────────────────────────

function Step1({
  data,
  onChange,
  errors,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name *"
          value={data.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="Jane"
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Input
          label="Last name *"
          value={data.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          placeholder="Smith"
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>
      <Input
        label="Email address *"
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="jane@example.com"
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Mobile number *"
        type="tel"
        value={data.mobile}
        onChange={(e) => onChange({ mobile: e.target.value })}
        placeholder="04XX XXX XXX"
        hint="Australian mobile number (e.g. 0412 345 678)"
        error={errors.mobile}
        autoComplete="tel"
      />
      <Input
        label="Date of birth"
        type="date"
        value={data.dateOfBirth}
        onChange={(e) => onChange({ dateOfBirth: e.target.value })}
        error={errors.dateOfBirth}
        autoComplete="bday"
      />
      <hr className="border-gray-200" />
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Home address (optional)</h3>
      <Input
        label="Address line 1"
        value={data.addressLine1}
        onChange={(e) => onChange({ addressLine1: e.target.value })}
        placeholder="123 Example Street"
        autoComplete="address-line1"
      />
      <Input
        label="Address line 2"
        value={data.addressLine2}
        onChange={(e) => onChange({ addressLine2: e.target.value })}
        placeholder="Unit 4"
        autoComplete="address-line2"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Input
            label="Suburb"
            value={data.suburb}
            onChange={(e) => onChange({ suburb: e.target.value })}
            placeholder="Loganholme"
            autoComplete="address-level2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
            autoComplete="address-level1"
          >
            {AUSTRALIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Input
            label="Postcode"
            value={data.postcode}
            onChange={(e) => onChange({ postcode: e.target.value })}
            placeholder="4129"
            maxLength={4}
            error={errors.postcode}
            autoComplete="postal-code"
          />
        </div>
      </div>
    </div>
  )
}

function Step2({
  data,
  onChange,
  errors,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  errors: Record<string, string>
}) {
  const showBlueCardFields = data.blueCardStatus === 'Current'

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Emergency contact</h3>
      <Input
        label="Contact name *"
        value={data.emergencyName}
        onChange={(e) => onChange({ emergencyName: e.target.value })}
        placeholder="John Smith"
        error={errors.emergencyName}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Contact phone *"
          type="tel"
          value={data.emergencyPhone}
          onChange={(e) => onChange({ emergencyPhone: e.target.value })}
          placeholder="04XX XXX XXX"
          error={errors.emergencyPhone}
        />
        <Input
          label="Relationship to you"
          value={data.emergencyRelation}
          onChange={(e) => onChange({ emergencyRelation: e.target.value })}
          placeholder="e.g. Spouse, Parent, Friend"
        />
      </div>

      <hr className="border-gray-200" />
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Health & accessibility</h3>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Medical notes (optional)</label>
        <textarea
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none"
          rows={3}
          placeholder="Any medical conditions or medications we should be aware of in an emergency..."
          value={data.medicalNotes}
          onChange={(e) => onChange({ medicalNotes: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Accessibility needs (optional)</label>
        <textarea
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none"
          rows={3}
          placeholder="Any accessibility requirements or accommodations we can help with..."
          value={data.accessibilityNeeds}
          onChange={(e) => onChange({ accessibilityNeeds: e.target.value })}
        />
      </div>

      <hr className="border-gray-200" />
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Blue Card (Working with Children)</h3>
      <p className="text-sm text-gray-600">
        Some volunteer roles require a current Blue Card. Please let us know your status.
      </p>
      <div className="flex flex-col gap-2">
        {BLUE_CARD_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="blueCardStatus"
              value={option}
              checked={data.blueCardStatus === option}
              onChange={() => onChange({ blueCardStatus: option })}
              className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-600"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {showBlueCardFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2 pl-4 border-l-2 border-teal-200">
          <Input
            label="Blue Card number"
            value={data.blueCardNumber}
            onChange={(e) => onChange({ blueCardNumber: e.target.value })}
            placeholder="e.g. 1234567/1"
          />
          <Input
            label="Expiry date"
            type="date"
            value={data.blueCardExpiry}
            onChange={(e) => onChange({ blueCardExpiry: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}

function Step3({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="space-y-6">
      {/* Preferred locations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Preferred locations
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <Checkbox
              key={loc}
              label={loc}
              checked={data.preferredLocations.includes(loc)}
              onCheckedChange={() =>
                onChange({ preferredLocations: toggleArrayItem(data.preferredLocations, loc) })
              }
            />
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Areas of interest */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Areas of interest
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AREAS_OF_INTEREST.map((area) => (
            <Checkbox
              key={area}
              label={area}
              checked={data.areasOfInterest.includes(area)}
              onCheckedChange={() =>
                onChange({ areasOfInterest: toggleArrayItem(data.areasOfInterest, area) })
              }
            />
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Availability grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          General availability
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tick the times you&apos;re generally available. This helps us match you with the right shifts.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 font-medium text-gray-600 w-36"></th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} className="text-center py-2 px-1 font-medium text-gray-600 text-xs">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_PERIODS.map((period) => (
                <tr key={period} className="border-t border-gray-100">
                  <td className="py-3 pr-4 text-xs text-gray-600 font-medium leading-snug">
                    {period}
                  </td>
                  {DAYS_OF_WEEK.map((day) => {
                    const checked = data.availability.some(
                      (a) => a.day === day && a.period === period
                    )
                    return (
                      <td key={day} className="text-center py-3 px-1">
                        <input
                          type="checkbox"
                          aria-label={`${day} ${period}`}
                          checked={checked}
                          onChange={() =>
                            onChange({
                              availability: toggleAvailability(data.availability, day, period),
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Other notes (optional)</label>
        <textarea
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none"
          rows={3}
          placeholder="Anything else you'd like us to know about your volunteering preferences..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </div>
    </div>
  )
}

function Step4({
  data,
  onChange,
  errors,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Create your account password
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password *"
            type="password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            hint="Minimum 8 characters"
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password *"
            type="password"
            value={data.confirmPassword}
            onChange={(e) => onChange({ confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Communications (optional)
        </h3>
        <div className="space-y-3">
          <Checkbox
            label="I'm happy to receive volunteer updates and news by email"
            checked={data.consentEmailUpdates}
            onCheckedChange={(checked) => onChange({ consentEmailUpdates: !!checked })}
          />
          <Checkbox
            label="I'm happy to receive shift reminders and urgent updates by SMS"
            checked={data.consentSmsUpdates}
            onCheckedChange={(checked) => onChange({ consentSmsUpdates: !!checked })}
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Required agreements
        </h3>
        <div className="space-y-4">
          {/* Terms agreement — uses plain checkbox + label to support JSX link */}
          <div className="flex items-start gap-3">
            <input
              id="agreedToTerms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
              checked={data.agreedToTerms}
              onChange={(e) => onChange({ agreedToTerms: e.target.checked })}
            />
            <div className="flex flex-col gap-0.5">
              <label htmlFor="agreedToTerms" className="text-sm font-medium text-gray-700 cursor-pointer">
                I have read and agree to the{' '}
                <Link href="/terms" target="_blank" className="text-teal-600 underline hover:text-teal-700">
                  Volunteer Terms &amp; Conditions
                </Link>{' '}
                *
              </label>
              {errors.agreedToTerms && (
                <p className="text-xs text-red-600" role="alert">{errors.agreedToTerms}</p>
              )}
            </div>
          </div>

          {/* Privacy agreement */}
          <div className="flex items-start gap-3">
            <input
              id="agreedToPrivacy"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
              checked={data.agreedToPrivacy}
              onChange={(e) => onChange({ agreedToPrivacy: e.target.checked })}
            />
            <div className="flex flex-col gap-0.5">
              <label htmlFor="agreedToPrivacy" className="text-sm font-medium text-gray-700 cursor-pointer">
                I have read and agree to the{' '}
                <Link href="/privacy" target="_blank" className="text-teal-600 underline hover:text-teal-700">
                  Privacy Policy
                </Link>{' '}
                *
              </label>
              {errors.agreedToPrivacy && (
                <p className="text-xs text-red-600" role="alert">{errors.agreedToPrivacy}</p>
              )}
            </div>
          </div>

          <Checkbox
            label="I understand that I will need to complete an online induction before my first shift *"
            checked={data.agreedToInduction}
            onCheckedChange={(checked) => onChange({ agreedToInduction: !!checked })}
            error={errors.agreedToInduction}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState(false)

  const totalSteps = 4

  function patch(update: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...update }))
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {}

    if (s === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required'
      if (!formData.lastName.trim()) errs.lastName = 'Last name is required'
      if (!formData.email.trim()) errs.email = 'Email address is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address'
      if (!formData.mobile.trim()) errs.mobile = 'Mobile number is required'
      else if (!/^(\+61|0)[4-5]\d{8}$/.test(formData.mobile.replace(/\s/g, '')))
        errs.mobile = 'Please enter a valid Australian mobile number'
      if (formData.postcode && !/^\d{4}$/.test(formData.postcode))
        errs.postcode = 'Postcode must be 4 digits'
    }

    if (s === 2) {
      if (!formData.emergencyName.trim()) errs.emergencyName = 'Emergency contact name is required'
      if (!formData.emergencyPhone.trim()) errs.emergencyPhone = 'Emergency contact phone is required'
    }

    if (s === 4) {
      if (!formData.password) errs.password = 'Password is required'
      else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
      if (formData.confirmPassword !== formData.password) errs.confirmPassword = 'Passwords do not match'
      if (!formData.agreedToTerms) errs.agreedToTerms = 'You must agree to the terms and conditions'
      if (!formData.agreedToPrivacy) errs.agreedToPrivacy = 'You must agree to the privacy policy'
      if (!formData.agreedToInduction) errs.agreedToInduction = 'Please acknowledge the induction requirement'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1))
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validateStep(4)) return

    setSubmitting(true)
    setGlobalError('')

    try {
      const fd = new FormData()
      fd.append('firstName', formData.firstName)
      fd.append('lastName', formData.lastName)
      fd.append('email', formData.email)
      fd.append('mobile', formData.mobile.replace(/\s/g, ''))
      if (formData.dateOfBirth) fd.append('dateOfBirth', formData.dateOfBirth)
      if (formData.addressLine1) fd.append('addressLine1', formData.addressLine1)
      if (formData.addressLine2) fd.append('addressLine2', formData.addressLine2)
      if (formData.suburb) fd.append('suburb', formData.suburb)
      if (formData.state) fd.append('state', formData.state)
      if (formData.postcode) fd.append('postcode', formData.postcode)
      fd.append('emergencyName', formData.emergencyName)
      fd.append('emergencyPhone', formData.emergencyPhone)
      if (formData.emergencyRelation) fd.append('emergencyRelation', formData.emergencyRelation)
      if (formData.medicalNotes) fd.append('medicalNotes', formData.medicalNotes)
      if (formData.accessibilityNeeds) fd.append('accessibilityNeeds', formData.accessibilityNeeds)
      fd.append('preferredLocations', JSON.stringify(formData.preferredLocations))
      fd.append('areasOfInterest', JSON.stringify(formData.areasOfInterest))
      // Map availability to what the server action expects: dayOfWeek + timePeriod
      const mappedAvailability = formData.availability.map((a) => ({
        dayOfWeek: a.day,
        timePeriod: a.period,
      }))
      fd.append('availability', JSON.stringify(mappedAvailability))
      fd.append('password', formData.password)
      fd.append('confirmPassword', formData.confirmPassword)
      fd.append('agreedToTerms', String(formData.agreedToTerms))
      fd.append('agreedToPrivacy', String(formData.agreedToPrivacy))
      fd.append('consentEmailUpdates', String(formData.consentEmailUpdates))
      fd.append('consentSmsUpdates', String(formData.consentSmsUpdates))

      const result = await registerVolunteerAction(fd)

      if (result.success) {
        setSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        }
        setGlobalError(result.error ?? 'Registration failed. Please try again.')
      }
    } catch {
      setGlobalError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <Card className="max-w-lg w-full text-center">
          <div className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <CheckCircle className="h-8 w-8 text-teal-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thank you for signing up, {formData.firstName}!
            </h1>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Please check your email for next steps. You&apos;ll need to log in and complete your
              induction before you can start volunteering.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Welcome to the Lighthouse Care volunteer family. We&apos;re so glad you&apos;re here.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const progressPct = ((step - 1) / (totalSteps - 1)) * 100

  return (
    <div className="py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Become a Volunteer</h1>
          <p className="mt-2 text-gray-600">
            Join the Lighthouse Care volunteer family — it only takes a few minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-teal-700">
              Step {step} of {totalSteps}: {STEP_TITLES[step - 1]}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progressPct)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPct === 0 ? 5 : progressPct}%` }}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEP_TITLES.map((title, i) => (
              <span
                key={title}
                className={`text-xs font-medium ${i + 1 <= step ? 'text-teal-600' : 'text-gray-400'}`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle>{STEP_TITLES[step - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              {step === 1 && <Step1 data={formData} onChange={patch} errors={errors} />}
              {step === 2 && <Step2 data={formData} onChange={patch} errors={errors} />}
              {step === 3 && <Step3 data={formData} onChange={patch} />}
              {step === 4 && <Step4 data={formData} onChange={patch} errors={errors} />}

              {globalError && (
                <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
                  {globalError}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <div>
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Back
                    </Button>
                  )}
                </div>
                <div>
                  {step < totalSteps ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Submitting...
                        </>
                      ) : (
                        'Complete Sign Up'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link href="/login" className="text-teal-600 font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
