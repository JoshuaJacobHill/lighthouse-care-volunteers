import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ShiftsClient from './ShiftsClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Shifts',
}

export default async function ShiftsPage() {
  const session = await getSession()
  if (!session?.volunteerId) redirect('/login')

  const now = new Date()

  const [upcomingAssignments, pastAssignments] = await Promise.all([
    prisma.shiftAssignment.findMany({
      where: {
        volunteerId: session.volunteerId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        shift: { date: { gte: now } },
      },
      include: {
        shift: { include: { location: true, department: true } },
      },
      orderBy: { shift: { date: 'asc' } },
    }),
    prisma.shiftAssignment.findMany({
      where: {
        volunteerId: session.volunteerId,
        OR: [
          { shift: { date: { lt: now } } },
          { status: { in: ['ATTENDED', 'NO_SHOW', 'CANCELLED_BY_VOLUNTEER', 'ADMIN_CANCELLED'] } },
        ],
      },
      include: {
        shift: { include: { location: true, department: true } },
      },
      orderBy: { shift: { date: 'desc' } },
      take: 20,
    }),
  ])

  // Serialise dates to strings for the client component
  const serialise = (assignments: typeof upcomingAssignments) =>
    assignments.map((a) => ({
      id: a.id,
      status: a.status,
      cancelReason: a.cancelReason,
      shift: {
        date: a.shift.date.toISOString(),
        startTime: a.shift.startTime.toISOString(),
        endTime: a.shift.endTime.toISOString(),
        title: a.shift.title,
        location: { name: a.shift.location.name },
        department: a.shift.department ? { name: a.shift.department.name } : null,
      },
    }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Shifts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your upcoming and past volunteering shifts with Lighthouse Care.
        </p>
      </div>
      <ShiftsClient
        upcoming={serialise(upcomingAssignments)}
        past={serialise(pastAssignments)}
      />
    </div>
  )
}
