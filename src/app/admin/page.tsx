import Link from 'next/link'
import {
  Users,
  Clock,
  Calendar,
  MapPin,
  AlertTriangle,
  UserX,
} from 'lucide-react'
import {
  startOfDay,
  addDays,
  subDays,
  startOfWeek,
} from 'date-fns'
import prisma from '@/lib/prisma'
import { StatusBadge } from '@/components/volunteer/StatusBadge'
import { formatDate, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function DashboardCard({
  icon: Icon,
  value,
  label,
  colour,
}: {
  icon: React.ElementType
  value: number
  label: string
  colour: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${colour}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

function durationSince(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

export default async function AdminDashboardPage() {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = addDays(todayStart, 1)
  const twoWeeksAgo = subDays(now, 14)
  const fourWeeksAgo = subDays(now, 28)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })

  const [
    activeCount,
    pendingCount,
    rosteredToday,
    onSiteNow,
    noShowsThisWeek,
    inactiveTwoWeeks,
    inactiveFourWeeks,
    recentSignups,
    currentlyOnSite,
  ] = await Promise.all([
    prisma.volunteerProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.volunteerProfile.count({ where: { status: 'PENDING_INDUCTION' } }),
    prisma.shiftAssignment.count({
      where: {
        shift: { date: { gte: todayStart, lt: todayEnd } },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    }),
    prisma.attendanceRecord.count({ where: { signOutAt: null } }),
    prisma.shiftAssignment.count({
      where: {
        status: 'NO_SHOW',
        shift: { date: { gte: weekStart } },
      },
    }),
    prisma.volunteerProfile.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastAttendedAt: null },
          { lastAttendedAt: { lt: twoWeeksAgo } },
        ],
      },
    }),
    prisma.volunteerProfile.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastAttendedAt: null },
          { lastAttendedAt: { lt: fourWeeksAgo } },
        ],
      },
    }),
    prisma.volunteerProfile.findMany({
      orderBy: { joinedAt: 'desc' },
      take: 5,
      include: { user: true },
    }),
    prisma.attendanceRecord.findMany({
      where: { signOutAt: null },
      include: {
        volunteer: true,
        location: true,
      },
      orderBy: { signInAt: 'desc' },
    }),
  ])

  const cards = [
    {
      icon: Users,
      value: activeCount,
      label: 'Active Volunteers',
      colour: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Clock,
      value: pendingCount,
      label: 'Pending Inductions',
      colour: 'bg-amber-100 text-amber-700',
    },
    {
      icon: Calendar,
      value: rosteredToday,
      label: 'Rostered Today',
      colour: 'bg-blue-100 text-blue-700',
    },
    {
      icon: MapPin,
      value: onSiteNow,
      label: 'On Site Now',
      colour: 'bg-green-100 text-green-700',
    },
    {
      icon: AlertTriangle,
      value: noShowsThisWeek,
      label: 'No-Shows This Week',
      colour: 'bg-red-100 text-red-700',
    },
    {
      icon: UserX,
      value: inactiveTwoWeeks,
      label: 'Inactive 2+ Weeks',
      colour: 'bg-orange-100 text-orange-700',
    },
    {
      icon: UserX,
      value: inactiveFourWeeks,
      label: 'Inactive 4+ Weeks',
      colour: 'bg-red-200 text-red-800',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of volunteer activity across Lighthouse Care.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent sign-ups */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Sign-ups</h2>
            <Link
              href="/admin/volunteers"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              View all
            </Link>
          </div>
          {recentSignups.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">
              No volunteers have signed up yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSignups.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {v.firstName} {v.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {formatDate(v.joinedAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3 shrink-0">
                    <StatusBadge status={v.status} />
                    <Link
                      href={`/admin/volunteers/${v.id}`}
                      className="text-xs font-medium text-orange-500 hover:text-orange-600"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently on site */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Currently On Site</h2>
            <Link
              href="/admin/on-site"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Manage
            </Link>
          </div>
          {currentlyOnSite.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">
              No volunteers are currently signed in.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {currentlyOnSite.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {record.volunteer.firstName} {record.volunteer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Signed in {formatDateTime(record.signInAt)}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className="text-xs font-semibold text-green-700">
                      {durationSince(record.signInAt)}
                    </p>
                    {record.location && (
                      <p className="text-xs text-gray-500">{record.location.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
