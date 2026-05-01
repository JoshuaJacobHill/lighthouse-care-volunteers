'use client'

import * as React from 'react'
import { useTransition } from 'react'
import { saveInductionAnswersAction } from '@/lib/actions/volunteer.actions'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

const ONBOARDING_QUESTIONS = [
  'Tell me a bit about yourself',
  'What made you want to volunteer with us?',
  'Have you volunteered anywhere before? What did you enjoy (or not enjoy)?',
  'What do you want to gain from your time with us?',
  'How can we best support you on this journey?',
  'Are there any skills you\'d love to learn or improve?',
  'Is there anything you\'re hoping to step into or try while you\'re here?',
  'Is there anything you\'d prefer to avoid if possible?',
  'How often would you ideally like to volunteer?',
  'Is there anything going on in your life we should be mindful of while you\'re volunteering?',
  'How do you like to be supported or communicated with?',
  'Do you have any questions for us?',
]

interface OnboardingFormProps {
  volunteerId: string
  initialAnswers: Record<string, string>
}

export function OnboardingForm({ volunteerId, initialAnswers }: OnboardingFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [answers, setAnswers] = React.useState<Record<string, string>>(initialAnswers)

  function handleChange(index: number, value: string) {
    setAnswers((prev) => ({ ...prev, [`q${index + 1}`]: value }))
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveInductionAnswersAction(volunteerId, answers)
      if (result.success) {
        toast.success('Answers saved', 'Onboarding answers have been saved successfully.')
      } else {
        toast.error('Could not save', result.error ?? 'Please try again.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Use these questions during your onboarding conversation with the volunteer. Answers are visible to admin only.
      </p>
      {ONBOARDING_QUESTIONS.map((question, index) => (
        <div key={index} className="space-y-1.5">
          <label
            htmlFor={`q${index + 1}`}
            className="block text-sm font-medium text-gray-700"
          >
            {index + 1}. {question}
          </label>
          <textarea
            id={`q${index + 1}`}
            rows={3}
            value={answers[`q${index + 1}`] ?? ''}
            onChange={(e) => handleChange(index, e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            placeholder="Enter answer…"
          />
        </div>
      ))}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            'Save Answers'
          )}
        </button>
      </div>
    </div>
  )
}
