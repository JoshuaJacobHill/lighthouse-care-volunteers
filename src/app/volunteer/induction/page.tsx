import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import InductionClient from './InductionClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Induction',
}

export default async function InductionPage() {
  const session = await getSession()
  if (!session?.volunteerId) redirect('/login')

  const volunteerId = session.volunteerId

  const [sections, progress, questions, existingAnswers, volunteer] = await Promise.all([
    prisma.inductionSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, content: true, sortOrder: true, isRequired: true },
    }),
    prisma.inductionProgress.findMany({
      where: { volunteerId },
      select: { sectionId: true, completed: true },
    }),
    prisma.inductionQuizQuestion.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.inductionQuizAnswer.findMany({
      where: { volunteerId },
      select: { questionId: true, optionId: true, isCorrect: true },
    }),
    prisma.volunteerProfile.findUnique({
      where: { id: volunteerId },
      select: { status: true, firstName: true },
    }),
  ])

  if (!volunteer) redirect('/login')

  const progressMap = Object.fromEntries(
    progress.map((p) => [p.sectionId, p.completed])
  )
  const answersMap = Object.fromEntries(
    existingAnswers.map((a) => [a.questionId, { optionId: a.optionId, isCorrect: a.isCorrect }])
  )

  return (
    <InductionClient
      sections={sections}
      progressMap={progressMap}
      questions={questions}
      answersMap={answersMap}
      volunteerId={volunteerId}
      volunteerStatus={volunteer.status}
      volunteerFirstName={volunteer.firstName}
    />
  )
}
