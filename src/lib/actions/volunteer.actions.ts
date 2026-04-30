'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { profileUpdateSchema } from '@/lib/validations'

interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

interface AvailabilityItem {
  dayOfWeek: string
  timePeriod: string
}

interface AvailabilityData {
  availability: AvailabilityItem[]
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireVolunteerSession(): Promise<{
  userId: string
  volunteerId: string
}> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  if (!session.volunteerId) {
    throw new Error('No volunteer profile found for this account')
  }
  return { userId: session.userId, volunteerId: session.volunteerId }
}

// ─── Map availability string to enum values ───────────────────────────────────

function toDayEnum(day: string): string {
  return day.toUpperCase()
}

function toPeriodEnum(period: string): string {
  if (period.toLowerCase().includes('morning')) return 'MORNING'
  if (period.toLowerCase().includes('afternoon')) return 'AFTERNOON'
  return 'EVENING'
}

// ─── Profile update ───────────────────────────────────────────────────────────

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    mobile: formData.get('mobile') as string,
    dateOfBirth: (formData.get('dateOfBirth') as string) || undefined,
    addressLine1: (formData.get('addressLine1') as string) || undefined,
    addressLine2: (formData.get('addressLine2') as string) || undefined,
    suburb: (formData.get('suburb') as string) || undefined,
    state: (formData.get('state') as string) || undefined,
    postcode: (formData.get('postcode') as string) || undefined,
    emergencyName: (formData.get('emergencyName') as string) || undefined,
    emergencyPhone: (formData.get('emergencyPhone') as string) || undefined,
    emergencyRelation: (formData.get('emergencyRelation') as string) || undefined,
    medicalNotes: (formData.get('medicalNotes') as string) || undefined,
    accessibilityNeeds: (formData.get('accessibilityNeeds') as string) || undefined,
    consentEmailUpdates:
      formData.get('consentEmailUpdates') === 'true' ||
      formData.get('consentEmailUpdates') === 'on',
    consentSmsUpdates:
      formData.get('consentSmsUpdates') === 'true' ||
      formData.get('consentSmsUpdates') === 'on',
  }

  const parsed = profileUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString()
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return { success: false, error: 'Please fix the errors below', fieldErrors }
  }

  const data = parsed.data

  try {
    await prisma.volunteerProfile.update({
      where: { id: volunteerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        suburb: data.suburb ?? null,
        state: data.state ?? null,
        postcode: data.postcode ?? null,
        emergencyName: data.emergencyName ?? null,
        emergencyPhone: data.emergencyPhone ?? null,
        emergencyRelation: data.emergencyRelation ?? null,
        medicalNotes: data.medicalNotes ?? null,
        accessibilityNeeds: data.accessibilityNeeds ?? null,
        consentEmailUpdates: data.consentEmailUpdates ?? false,
        consentSmsUpdates: data.consentSmsUpdates ?? false,
      },
    })

    return { success: true }
  } catch (err) {
    console.error('[updateProfileAction]', err)
    return { success: false, error: 'Failed to update profile. Please try again.' }
  }
}

// ─── Availability update ──────────────────────────────────────────────────────

export async function updateAvailabilityAction(data: AvailabilityData): Promise<ActionResult> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  try {
    // Delete all existing availability and replace
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      await tx.volunteerAvailability.deleteMany({ where: { volunteerId } })

      if (data.availability.length > 0) {
        await tx.volunteerAvailability.createMany({
          data: data.availability.map((a) => ({
            volunteerId,
            dayOfWeek: toDayEnum(a.dayOfWeek) as never,
            timePeriod: toPeriodEnum(a.timePeriod) as never,
          })),
          skipDuplicates: true,
        })
      }
    })

    return { success: true }
  } catch (err) {
    console.error('[updateAvailabilityAction]', err)
    return { success: false, error: 'Failed to update availability. Please try again.' }
  }
}

// ─── Induction section completion ─────────────────────────────────────────────

export async function completeInductionSectionAction(sectionId: string): Promise<ActionResult> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  try {
    await prisma.inductionProgress.upsert({
      where: { volunteerId_sectionId: { volunteerId, sectionId } },
      create: {
        volunteerId,
        sectionId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    })

    return { success: true }
  } catch (err) {
    console.error('[completeInductionSectionAction]', err)
    return { success: false, error: 'Failed to record section completion.' }
  }
}

// ─── Quiz submission ──────────────────────────────────────────────────────────

export async function submitQuizAnswersAction(
  answers: Record<string, string>
): Promise<ActionResult & { passed?: boolean; score?: number; total?: number }> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  try {
    // Load all active questions and their options
    const questions = await prisma.inductionQuizQuestion.findMany({
      where: { isActive: true },
      include: { options: true },
    })

    if (questions.length === 0) {
      return { success: false, error: 'No quiz questions found.' }
    }

    let correctCount = 0
    const answerRecords: Array<{
      volunteerId: string
      questionId: string
      optionId: string
      isCorrect: boolean
    }> = []

    for (const question of questions) {
      const selectedOptionId = answers[question.id]
      if (!selectedOptionId) continue

      const selectedOption = question.options.find((o) => o.id === selectedOptionId)
      const isCorrect = selectedOption?.isCorrect ?? false
      if (isCorrect) correctCount++

      answerRecords.push({
        volunteerId,
        questionId: question.id,
        optionId: selectedOptionId,
        isCorrect,
      })
    }

    // Upsert all answers
    for (const record of answerRecords) {
      await prisma.inductionQuizAnswer.upsert({
        where: {
          volunteerId_questionId: {
            volunteerId: record.volunteerId,
            questionId: record.questionId,
          },
        },
        create: record,
        update: { optionId: record.optionId, isCorrect: record.isCorrect },
      })
    }

    const passed = correctCount === questions.length

    if (passed) {
      // Update volunteer status to INDUCTED
      await prisma.volunteerProfile.update({
        where: { id: volunteerId },
        data: { status: 'INDUCTED' },
      })
    }

    return {
      success: true,
      passed,
      score: correctCount,
      total: questions.length,
    }
  } catch (err) {
    console.error('[submitQuizAnswersAction]', err)
    return { success: false, error: 'Failed to submit quiz answers. Please try again.' }
  }
}

// ─── Cannot attend notification ───────────────────────────────────────────────

export async function notifyCannotAttendAction(
  shiftAssignmentId: string,
  reason: string
): Promise<ActionResult> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  try {
    // Verify this assignment belongs to the current volunteer
    const assignment = await prisma.shiftAssignment.findFirst({
      where: { id: shiftAssignmentId, volunteerId },
    })

    if (!assignment) {
      return { success: false, error: 'Shift assignment not found.' }
    }

    if (assignment.status === 'CANCELLED_BY_VOLUNTEER' || assignment.status === 'ADMIN_CANCELLED') {
      return { success: false, error: 'This shift has already been cancelled.' }
    }

    await prisma.shiftAssignment.update({
      where: { id: shiftAssignmentId },
      data: {
        status: 'CANCELLED_BY_VOLUNTEER',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
    })

    return { success: true }
  } catch (err) {
    console.error('[notifyCannotAttendAction]', err)
    return { success: false, error: 'Failed to update shift status. Please try again.' }
  }
}

// ─── Message to admin ─────────────────────────────────────────────────────────

export async function submitMessageToAdminAction(message: string): Promise<ActionResult> {
  let volunteerId: string
  try {
    ;({ volunteerId } = await requireVolunteerSession())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  if (!message || message.trim().length === 0) {
    return { success: false, error: 'Message cannot be empty.' }
  }

  if (message.trim().length > 2000) {
    return { success: false, error: 'Message is too long (max 2000 characters).' }
  }

  try {
    const volunteer = await prisma.volunteerProfile.findUnique({
      where: { id: volunteerId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!volunteer) {
      return { success: false, error: 'Volunteer profile not found.' }
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (!adminEmail) {
      console.warn('[submitMessageToAdminAction] ADMIN_NOTIFICATION_EMAIL not set')
      return { success: false, error: 'Could not send message. Please contact us directly.' }
    }

    await sendEmail({
      to: adminEmail,
      subject: `Message from volunteer: ${volunteer.firstName} ${volunteer.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Message from Volunteer</h2>
          <p><strong>From:</strong> ${volunteer.firstName} ${volunteer.lastName} (${volunteer.email})</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; color: #374151;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/volunteers/${volunteerId}">View volunteer profile</a></p>
        </div>
      `,
      text: `Message from volunteer: ${volunteer.firstName} ${volunteer.lastName}\n\n${message}`,
      volunteerId,
    })

    return { success: true }
  } catch (err) {
    console.error('[submitMessageToAdminAction]', err)
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
