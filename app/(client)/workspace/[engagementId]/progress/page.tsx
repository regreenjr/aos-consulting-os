import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { ProgressTimeline } from '@/components/client/progress-timeline'
import { ProgressStats } from '@/components/client/progress-stats'

export default async function ProgressPage({
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

  // Fetch engagement with goals, actions, and sessions
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
      goals(
        id,
        title,
        description,
        target_value,
        current_value,
        unit,
        status,
        target_date,
        created_at,
        updated_at
      ),
      actions(
        id,
        title,
        status,
        due_date,
        completed_at,
        created_at
      ),
      sessions(
        id,
        title,
        scheduled_at,
        status,
        created_at
      )
    `
    )
    .eq('id', engagementId)
    .single()

  // Verify user owns this engagement
  if (!engagement || engagement.clients.user_id !== user.id) {
    redirect('/login')
  }

  // Calculate stats
  const totalGoals = engagement.goals?.length || 0
  const completedGoals = engagement.goals?.filter((g: any) => g.status === 'completed').length || 0
  const activeGoals = engagement.goals?.filter((g: any) => g.status === 'active' || g.status === 'in_progress').length || 0

  const totalActions = engagement.actions?.length || 0
  const completedActions = engagement.actions?.filter((a: any) => a.status === 'completed').length || 0

  const totalSessions = engagement.sessions?.length || 0
  const completedSessions = engagement.sessions?.filter((s: any) => s.status === 'completed').length || 0

  // Create timeline events from goals, actions, and sessions
  const timelineEvents = [
    ...(engagement.goals || []).map((goal: any) => ({
      id: goal.id,
      type: 'goal' as const,
      title: goal.title,
      description: goal.description,
      date: goal.target_date || goal.created_at,
      status: goal.status,
      progress: goal.target_value && goal.current_value
        ? Math.round((goal.current_value / goal.target_value) * 100)
        : undefined,
    })),
    ...(engagement.sessions || []).map((session: any) => ({
      id: session.id,
      type: 'session' as const,
      title: session.title || 'Coaching Session',
      description: null,
      date: session.scheduled_at,
      status: session.status,
    })),
    ...(engagement.actions || [])
      .filter((action: any) => action.status === 'completed')
      .map((action: any) => ({
        id: action.id,
        type: 'action' as const,
        title: action.title,
        description: null,
        date: action.completed_at || action.created_at,
        status: action.status,
      })),
  ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Your Progress</h1>
          <p className="text-sm text-muted-foreground">
            Track your journey and celebrate milestones
          </p>
        </div>

        {/* Stats Overview */}
        <ProgressStats
          totalGoals={totalGoals}
          completedGoals={completedGoals}
          activeGoals={activeGoals}
          totalActions={totalActions}
          completedActions={completedActions}
          totalSessions={totalSessions}
          completedSessions={completedSessions}
        />

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Timeline</h2>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Your progress timeline will appear here as you work through your engagement.
              </p>
            </div>
          ) : (
            <ProgressTimeline events={timelineEvents} />
          )}
        </div>
      </div>

      <BottomTabNav engagementId={engagementId} />
    </>
  )
}
