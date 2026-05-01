import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-800 px-4 py-12">
      {/* Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block group" aria-label="Lighthouse Care — home">
          <Image
            src="/logo-inline-black.png"
            alt="Lighthouse Care"
            width={240}
            height={64}
            className="h-12 w-auto brightness-0 invert drop-shadow-md mx-auto"
            priority
          />
          <p className="mt-2 text-sm text-orange-200 font-medium tracking-wide">
            Volunteer Portal
          </p>
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {children}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-orange-200">
        Lighthouse Care &mdash; ABN 87 637 110 948 &mdash; ACNC Registered Charity
      </p>
    </div>
  )
}
