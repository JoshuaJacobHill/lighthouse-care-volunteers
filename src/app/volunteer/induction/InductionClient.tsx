'use client'

import * as React from 'react'
import { useTransition } from 'react'
import {
  completeInductionSectionAction,
  submitQuizAnswersAction,
} from '@/lib/actions/volunteer.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PartyPopper,
  XCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Section {
  id: string
  title: string
  content: string
  sortOrder: number
  isRequired: boolean
}

interface QuizOption {
  id: string
  optionText: string
  sortOrder: number
}

interface QuizQuestion {
  id: string
  question: string
  sortOrder: number
  options: QuizOption[]
}

interface InductionClientProps {
  sections: Section[]
  progressMap: Record<string, boolean>
  questions: QuizQuestion[]
  answersMap: Record<string, { optionId: string; isCorrect: boolean }>
  volunteerId: string
  volunteerStatus: string
  volunteerFirstName: string
}

type InductionStage = 'sections' | 'quiz' | 'complete'

export default function InductionClient({
  sections,
  progressMap: initialProgressMap,
  questions,
  answersMap: initialAnswersMap,
  volunteerStatus,
  volunteerFirstName,
}: InductionClientProps) {
  const [progressMap, setProgressMap] = React.useState<Record<string, boolean>>(initialProgressMap)
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState<number>(() => {
    // Start at first incomplete section
    const firstIncomplete = sections.findIndex((s) => !initialProgressMap[s.id])
    return firstIncomplete === -1 ? 0 : firstIncomplete
  })
  const [readAcknowledged, setReadAcknowledged] = React.useState(false)
  const [forceShowQuiz, setForceShowQuiz] = React.useState(false)
  const [isPending, startTransition] = useTransition()

  // Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = React.useState(0)
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initialAnswersMap).map(([qId, a]) => [qId, a.optionId]))
  )
  const [quizResult, setQuizResult] = React.useState<{
    passed: boolean
    score: number
    total: number
  } | null>(() => {
    // If all questions answered and all correct, already passed
    if (questions.length === 0) return null
    const allAnswered = questions.every((q) => initialAnswersMap[q.id])
    if (!allAnswered) return null
    const allCorrect = questions.every((q) => initialAnswersMap[q.id]?.isCorrect)
    return allCorrect
      ? { passed: true, score: questions.length, total: questions.length }
      : null
  })
  const [quizSubmitted, setQuizSubmitted] = React.useState(false)
  const [quizError, setQuizError] = React.useState<string | null>(null)

  const allSectionsComplete = sections.length > 0 && sections.every((s) => progressMap[s.id])
  const quizPassed = quizResult?.passed === true

  // Determine stage
  const stage: InductionStage = (() => {
    if (volunteerStatus === 'INDUCTED' || volunteerStatus === 'ACTIVE' || quizPassed) return 'complete'
    if ((allSectionsComplete || forceShowQuiz) && questions.length > 0) return 'quiz'
    return 'sections'
  })()

  // ── Section flow ─────────────────────────────────────────────────────────────

  const currentSection = sections[currentSectionIndex]

  function handleMarkComplete() {
    if (!currentSection) return
    setReadAcknowledged(false)

    startTransition(async () => {
      const result = await completeInductionSectionAction(currentSection.id)
      if (result.success) {
        setProgressMap((prev) => ({ ...prev, [currentSection.id]: true }))
        // Move to next section if available
        if (currentSectionIndex < sections.length - 1) {
          setCurrentSectionIndex((i) => i + 1)
        }
      }
    })
  }

  // ── Quiz flow ────────────────────────────────────────────────────────────────

  const currentQuestion = questions[quizQuestionIndex]
  const isLastQuestion = quizQuestionIndex === questions.length - 1

  async function handleQuizSubmit() {
    setQuizError(null)
    startTransition(async () => {
      const result = await submitQuizAnswersAction(selectedAnswers)
      if (result.success) {
        setQuizResult({ passed: result.passed!, score: result.score!, total: result.total! })
        setQuizSubmitted(true)
      } else {
        setQuizError(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  // ── Already inducted ────────────────────────────────────────────────────────

  if (stage === 'complete') {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <PartyPopper className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                You&apos;ve already completed your induction!
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome to the Lighthouse Care volunteer family, {volunteerFirstName}. We&apos;re so glad you&apos;re here.
              </p>
            </div>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Quiz result ──────────────────────────────────────────────────────────────

  if (quizSubmitted && quizResult) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Result</h1>
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            {quizResult.passed ? (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-700">Congratulations, you passed!</p>
                  <p className="mt-1 text-sm text-gray-600">
                    You answered {quizResult.score} of {quizResult.total} questions correctly.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Welcome to the Lighthouse Care volunteer family, {volunteerFirstName}! Our team will be in touch about upcoming shifts.
                  </p>
                </div>
                <Link
                  href="/volunteer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-700">Not quite — please have another look</p>
                  <p className="mt-1 text-sm text-gray-600">
                    You answered {quizResult.score} of {quizResult.total} questions correctly.
                    Review the induction sections and try again.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuizSubmitted(false)
                      setQuizResult(null)
                      setQuizQuestionIndex(0)
                      setSelectedAnswers({})
                    }}
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizSubmitted(false)
                      setQuizResult(null)
                    }}
                  >
                    Review Sections
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Quiz flow ────────────────────────────────────────────────────────────────

  if (stage === 'quiz' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Induction Quiz</h1>
          <p className="mt-1 text-sm text-gray-500">
            Almost there! Answer these questions to complete your induction.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Question {quizQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${((quizQuestionIndex + 1) / questions.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={quizQuestionIndex + 1}
              aria-valuemin={1}
              aria-valuemax={questions.length}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <fieldset aria-label={`Options for question ${quizQuestionIndex + 1}`}>
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={clsx(
                      'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                      selectedAnswers[currentQuestion.id] === option.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                    )}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={selectedAnswers[currentQuestion.id] === option.id}
                      onChange={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))
                      }
                      className="mt-0.5 h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="text-sm text-gray-800">{option.optionText}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {quizError && (
              <p className="text-sm text-red-600 mt-2">{quizError}</p>
            )}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuizQuestionIndex((i) => Math.max(0, i - 1))}
                disabled={quizQuestionIndex === 0 || isPending}
              >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  type="button"
                  onClick={handleQuizSubmit}
                  disabled={isPending || !selectedAnswers[currentQuestion.id]}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setQuizQuestionIndex((i) => i + 1)}
                  disabled={!selectedAnswers[currentQuestion.id]}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Section flow ─────────────────────────────────────────────────────────────

  if (sections.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No induction content available yet. Please check back soon.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Induction</h1>
        <p className="mt-1 text-sm text-gray-500">
          Work through each section at your own pace. You can return here any time to continue.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar stepper */}
        <aside className="lg:w-56 shrink-0">
          <nav aria-label="Induction sections">
            <ol className="space-y-1">
              {sections.map((section, index) => {
                const completed = progressMap[section.id]
                const isCurrent = index === currentSectionIndex
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSectionIndex(index)
                        setReadAcknowledged(false)
                      }}
                      className={clsx(
                        'w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isCurrent
                          ? 'bg-orange-500 text-white'
                          : completed
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-500 hover:bg-gray-50'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span
                        className={clsx(
                          'flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full text-xs font-bold',
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                        aria-hidden="true"
                      >
                        {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className="leading-tight">{section.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="mt-4 px-3">
            <div className="text-xs text-gray-500 mb-1">
              {Object.values(progressMap).filter(Boolean).length} of {sections.length} completed
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{
                  width: `${(Object.values(progressMap).filter(Boolean).length / sections.length) * 100}%`,
                }}
                role="progressbar"
                aria-valuenow={Object.values(progressMap).filter(Boolean).length}
                aria-valuemin={0}
                aria-valuemax={sections.length}
                aria-label="Induction progress"
              />
            </div>
          </div>
        </aside>

        {/* Main section content */}
        {currentSection && (
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{currentSection.title}</CardTitle>
                  {progressMap[currentSection.id] && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Complete
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {/* Section content rendered as HTML */}
                <div
                  className="max-w-none text-sm text-gray-700 leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:text-orange-500 [&_a]:underline [&_strong]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
                  dangerouslySetInnerHTML={{ __html: currentSection.content }}
                />

                {/* Acknowledgement */}
                {!progressMap[currentSection.id] && (
                  <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        id="read-acknowledged"
                        checked={readAcknowledged}
                        onCheckedChange={(checked) => setReadAcknowledged(!!checked)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-sm text-gray-700">
                        I have read and understood this section
                      </span>
                    </label>
                    <Button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={!readAcknowledged || isPending}
                      className="w-full sm:w-auto"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Saving…
                        </>
                      ) : (
                        'Mark as Complete'
                      )}
                    </Button>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentSectionIndex((i) => Math.max(0, i - 1))
                      setReadAcknowledged(false)
                    }}
                    disabled={currentSectionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentSectionIndex((i) => Math.min(sections.length - 1, i + 1))
                      setReadAcknowledged(false)
                    }}
                    disabled={currentSectionIndex === sections.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>

                {/* Prompt to start quiz once all sections done */}
                {allSectionsComplete && questions.length > 0 && (
                  <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                    <p className="text-sm font-semibold text-orange-700 mb-2">
                      Great work — all sections complete!
                    </p>
                    <Button
                      type="button"
                      onClick={() => setForceShowQuiz(true)}
                    >
                      Start Quiz
                      <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
