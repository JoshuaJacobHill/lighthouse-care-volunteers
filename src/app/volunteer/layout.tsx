import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VolunteerLayout } from '@/components/layout/VolunteerLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return <VolunteerLayout>{children}</VolunteerLayout>
}
