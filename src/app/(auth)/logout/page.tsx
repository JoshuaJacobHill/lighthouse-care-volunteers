import { logoutAction } from '@/lib/actions/auth.actions'

export const metadata = {
  title: 'Signing out...',
}

export default async function LogoutPage() {
  await logoutAction()
  // logoutAction calls redirect() internally, so this is never reached.
  return (
    <div className="p-8 text-center text-gray-600">
      <p>Signing you out&hellip;</p>
    </div>
  )
}
