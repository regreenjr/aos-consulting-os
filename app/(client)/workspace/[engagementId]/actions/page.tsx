import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { ActionsClient } from '@/components/client/actions-client'

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ engagementId: string }>
}) {
  const { engagementId } = await params
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch engagement with actions
  const { data: engagement } = await supabase
    .from('engagements')
    .select(
      `
      *,
      clients!inner(
        id,
        user_id,
        company_name
      ),
      actions(
        id,
        title,
        description,
        status,
        due_date,
        assigned_to,
        created_at,
        completed_at,
        updated_at
      )
    `
    )
    .eq('id', engagementId)
    .single()

  // Verify user owns this engagement
  if (!engagement || engagement.clients.user_id !== user.id) {
    redirect('/login')
  }

  // Sort actions: pending first, then by due date, then completed
  const sortedActions = engagement.actions?.sort((a: any, b: any) => {
    // Completed items last
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1

    // Sort by due date if both have one
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }

    // Items with due dates come first
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1

    // Otherwise sort by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }) || []

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold">Action Items</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and complete tasks
          </p>
        </div>

        <ActionsClient actions={sortedActions} engagementId={engagementId} />
      </div>

      <BottomTabNav engagementId={engagementId} />
    </>
  )
}
