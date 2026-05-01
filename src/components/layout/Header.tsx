'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { clsx } from 'clsx'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/signup', label: 'Volunteer Sign Up' },
  { href: '/login', label: 'Sign In' },
]

function LighthouseLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Lighthouse Care — home">
      {/* Lighthouse icon mark */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="6" fill="#F26522" fillOpacity="0.15" />
        {/* Tower */}
        <rect x="13" y="10" width="6" height="14" rx="1" fill="white" />
        {/* Lantern room */}
        <rect x="11" y="8" width="10" height="4" rx="1" fill="#F26522" />
        {/* Light beam */}
        <polygon points="16,6 10,2 22,2" fill="#F26522" opacity="0.7" />
        {/* Base */}
        <rect x="10" y="24" width="12" height="3" rx="1" fill="white" />
        {/* Door */}
        <rect x="14.5" y="19" width="3" height="5" rx="0.5" fill="#F26522" fillOpacity="0.6" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-white font-bold text-base group-hover:text-orange-300 transition-colors">
          Lighthouse Care
        </span>
        <span className="text-orange-400 text-xs font-medium tracking-wide">
          Volunteers
        </span>
      </div>
    </Link>
  )
}

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <LighthouseLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-gray-700 bg-gray-900 pb-3 pt-2"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1 px-4">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
