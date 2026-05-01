import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VolunteerLayout } from '@/components/layout/VolunteerLayout'
import prisma from '@/lib/prisma'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  })

  const userName = user?.name ?? 'Volunteer'

  return (
    <VolunteerLayout userName={userName} userId={session.userId}>
      {children}
    </VolunteerLayout>
  )
}
