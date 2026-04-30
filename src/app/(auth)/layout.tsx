import * as React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-teal-900 px-4 py-12">
      {/* Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2 group">
          {/* Lighthouse SVG mark */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="drop-shadow-md"
          >
            <rect width="32" height="32" rx="6" fill="white" fillOpacity="0.15" />
            <rect x="13" y="10" width="6" height="14" rx="1" fill="white" />
            <rect x="11" y="8" width="10" height="4" rx="1" fill="#fbbf24" />
            <polygon points="16,6 10,2 22,2" fill="#fbbf24" opacity="0.7" />
            <rect x="10" y="24" width="12" height="3" rx="1" fill="white" />
            <rect x="14.5" y="19" width="3" height="5" rx="0.5" fill="#0f766e" />
          </svg>
          <div>
            <p className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
              Lighthouse Care
            </p>
            <p className="text-sm text-teal-200 font-medium tracking-wide">
              Volunteer Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {children}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-teal-200">
        Lighthouse Care &mdash; ABN 87 637 110 948 &mdash; ACNC Registered Charity
      </p>
    </div>
  )
}
