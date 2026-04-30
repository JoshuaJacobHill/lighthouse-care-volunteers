import * as React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addDays, startOfWeek, format, parseISO, isSameDay } from 'date-fns'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AddShiftModal } from './AddShiftModal'
import { RosterActions } from './RosterActions'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Roster | Lighthouse Care Admin' }

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getWeekStart(weekParam?: string): Date {
  if (weekParam) {
    try {
      const parsed = parseISO(weekParam)
      if (!isNaN(parsed.getTime())) {
        return startOfWeek(parsed, { weekStartsOn: 1 })
      }
    } catch {
      // fall through
    }
  }
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED_BY_VOLUNTEER: 'bg-red-100 text-red-700',
  ATTENDED: 'bg-teal-100 text-teal-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  ADMIN_CANCELLED: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  CANCELLED_BY_VOLUNTEER: 'Cancelled',
  ATTENDED: 'Attended',
  NO_SHOW: 'No Show',
  ADMIN_CANCELLED: 'Admin Cancelled',
}

export default async function RosterPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login')
  }

  const params = await searchParams
  const weekStart = getWeekStart(params.week)
  const weekEnd = addDays(weekStart, 7)

  const [shifts, locations, departments] = await Promise.all([
    prisma.shift.findMany({
      where: {
        date: { gte: weekStart, lt: weekEnd },
        isActive: true,
      },
      include: {
        location: true,
        department: true,
        assignments: {
          include: {
            volunteer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.location.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  const prevWeek = format(addDays(weekStart, -7), 'yyyy-MM-dd')
  const nextWeek = format(addDays(weekStart, 7), 'yyyy-MM-dd')
  const thisWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  // Group shifts by day
  const shiftsByDay = DAYS.map((_, idx) => {
    const day = addDays(weekStart, idx)
    return {
      day,
      shifts: shifts.filter((s) => isSameDay(new Date(s.date), day)),
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Week of {format(weekStart, 'd MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddShiftModal
            locations={locations.map((l) => ({ id: l.id, name: l.name }))}
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            weekStart={weekStart.toISOString()}
          />
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/roster?week=${prevWeek}`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          ← Previous Week
        </Link>
        <Link
          href={`/admin/roster?week=${thisWeek}`}
          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
        >
          This Week
        </Link>
        <Link
          href={`/admin/roster?week=${nextWeek}`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Next Week →
        </Link>
      </div>

      {/* Roster grid */}
      <div className="space-y-4">
        {shiftsByDay.map(({ day, shifts: dayShifts }) => (
          <div key={day.toISOString()} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Day header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900">
                  {format(day, 'EEEE')}
                </span>
                <span className="text-gray-500 ml-2 text-sm">
                  {format(day, 'd MMMM')}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {dayShifts.length === 0
                  ? 'No shifts'
                  : `${dayShifts.length} shift${dayShifts.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {/* Shifts */}
            {dayShifts.length === 0 ? (
              <div className="px-5 py-6 text-sm text-gray-400 text-center">
                No shifts rostered for this day.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dayShifts.map((shift) => {
                  const assignedCount = shift.assignments.filter(
                    (a) => a.status !== 'ADMIN_CANCELLED' && a.status !== 'CANCELLED_BY_VOLUNTEER'
                  ).length
                  const isFull = assignedCount >= shift.capacity

                  return (
                    <div key={shift.id} className="px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Shift info */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {format(new Date(shift.startTime), 'h:mm a')} —{' '}
                              {format(new Date(shift.endTime), 'h:mm a')}
                            </span>
                            {shift.title && (
                              <span className="text-gray-600 text-sm">· {shift.title}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                            <span className="font-medium text-gray-700">
                              {shift.location.name}
                            </span>
                            {shift.department && (
                              <>
                                <span>·</span>
                                <span>{shift.department.name}</span>
                              </>
                            )}
                            <span>·</span>
                            <span
                              className={`font-medium ${
                                isFull ? 'text-green-600' : 'text-amber-600'
                              }`}
                            >
                              {assignedCount}/{shift.capacity} filled
                            </span>
                          </div>

                          {/* Assigned volunteers */}
                          {shift.assignments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {shift.assignments.map((assignment) => (
                                <span
                                  key={assignment.id}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                    STATUS_STYLES[assignment.status] ??
                                    'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {assignment.volunteer.firstName}{' '}
                                  {assignment.volunteer.lastName}
                                  <span className="opacity-60">
                                    · {STATUS_LABELS[assignment.status] ?? assignment.status}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}

                          {shift.notes && (
                            <p className="mt-2 text-xs text-gray-400 italic">{shift.notes}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <RosterActions
                            shiftId={shift.id}
                            locationId={shift.locationId}
                            shiftDate={shift.date.toISOString()}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
