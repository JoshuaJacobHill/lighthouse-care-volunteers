'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Avatar } from '@/components/ui/avatar'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/volunteer/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/volunteer/profile', label: 'My Profile', icon: User },
  { href: '/volunteer/availability', label: 'My Availability', icon: Clock },
  { href: '/volunteer/shifts', label: 'My Shifts', icon: Calendar },
]

interface VolunteerLayoutProps {
  children: React.ReactNode
}

export function VolunteerLayout({ children }: VolunteerLayoutProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { data: session } = useSession()

  const userName = session?.user?.name ?? 'Volunteer'

  const isActive = (href: string) => pathname.startsWith(href)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  // Close mobile nav on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navContent = (
    <nav aria-label="Volunteer navigation">
      <ul className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* User info */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={userName} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500">Volunteer</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {navContent}
        </div>

        {/* Sign out */}
        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name={userName} size="sm" />
            <span className="text-sm font-semibold text-gray-900">{userName}</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3 shadow-sm space-y-1">
            {navContent}
            <div className="pt-1 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
