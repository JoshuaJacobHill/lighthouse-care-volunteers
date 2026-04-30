import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import InductionSectionsManager from './InductionSectionsManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) redirect('/login')

  const sections = await prisma.inductionSection.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Induction Sections</h1>
        <p className="text-gray-600 mt-1">Manage the content volunteers read during their induction.</p>
      </div>
      <InductionSectionsManager sections={sections} />
    </div>
  )
}
