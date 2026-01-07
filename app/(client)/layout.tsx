import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a client
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'client') {
    redirect('/consultant/dashboard')
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {children}
    </div>
  )
}
