import { SidebarNav } from '@/components/consultant/sidebar-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConsultantLayout({
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

  // Check if user is a consultant
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'consultant') {
    redirect('/client/workspace')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
