import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AvailabilityEditorClient from './AvailabilityEditorClient'
import type { Metadata } from 'next'
import type { AvailabilityMap } from '@/components/volunteer/AvailabilityGrid'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Availability',
}

export default async function AvailabilityPage() {
  const session = await getSession()
  if (!session?.volunteerId) redirect('/login')

  const records = await prisma.volunteerAvailability.findMany({
    where: { volunteerId: session.volunteerId },
  })

  // Convert DB records to the AvailabilityMap format the grid expects
  const initialAvailability: AvailabilityMap = {}
  for (const record of records) {
    const day = record.dayOfWeek as keyof AvailabilityMap
    if (!initialAvailability[day]) {
      initialAvailability[day] = {}
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(initialAvailability[day] as any)[record.timePeriod] = true
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
        <p className="mt-1 text-sm text-gray-500">
          Let us know which days and times generally work for you. We&apos;ll use this to find shifts that suit you best.
        </p>
      </div>
      <AvailabilityEditorClient initialAvailability={initialAvailability} />
    </div>
  )
}
