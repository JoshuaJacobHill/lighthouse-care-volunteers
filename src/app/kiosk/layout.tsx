import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Volunteer Kiosk | Lighthouse Care',
}

export default async function KioskLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/kiosk/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
