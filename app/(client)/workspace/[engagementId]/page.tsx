import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { GoalCard } from '@/components/client/goal-card'
import { NextSessionCard } from '@/components/client/next-session-card'
import { UpdatesFeed } from '@/components/client/updates-feed'
import { ProposalCard } from '@/components/client/proposal-card'

export default async function ClientWorkspacePage({
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

  // Fetch engagement with related data
  const { data: engagement } = await supabase
    .from('engagements')
    .select(
      `
      *,
      clients!inner(
        id,
        user_id,
        company_name,
        industry,
        users!inner(id, full_name, email)
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
      sessions(
        id,
        title,
        scheduled_at,
        duration_minutes,
        status,
        session_summaries(id, content, key_takeaways, created_at)
      ),
      proposals(
        id,
        status,
        sent_at,
        client_responded_at
      )
    `
    )
    .eq('id', engagementId)
    .single()

  // Verify user owns this engagement
  if (!engagement || engagement.clients.user_id !== user.id) {
    redirect('/login')
  }

  // Get active goals
  const activeGoals = engagement.goals?.filter(
    (g) => g.status === 'active' || g.status === 'in_progress'
  ) || []

  // Get next scheduled session
  const upcomingSessions = engagement.sessions
    ?.filter((s) => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const nextSession = upcomingSessions?.[0]

  // Get recent session summaries for updates feed
  const recentSessions = engagement.sessions
    ?.filter((s) => s.session_summaries && s.session_summaries.length > 0)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5)

  // Get the latest approved proposal
  const approvedProposal = engagement.proposals
    ?.filter((p) => p.status === 'approved' || p.status === 'sent' || p.status === 'accepted' || p.status === 'rejected')
    .sort((a, b) => new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime())[0]

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{engagement.title}</h1>
          <p className="text-sm text-muted-foreground">
            {engagement.clients.company_name && `${engagement.clients.company_name} • `}
            {engagement.status.charAt(0).toUpperCase() + engagement.status.slice(1)}
          </p>
        </div>

        {/* Proposal Card */}
        {approvedProposal && (
          <ProposalCard proposal={approvedProposal} engagementId={engagementId} />
        )}

        {/* Next Session */}
        {nextSession && <NextSessionCard session={nextSession} />}

        {/* Goals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Goals</h2>
            {activeGoals.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {activeGoals.length} active
              </span>
            )}
          </div>

          {activeGoals.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No active goals yet. Your consultant will help you set goals in your first session.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Updates</h2>
          {recentSessions && recentSessions.length > 0 ? (
            <UpdatesFeed sessions={recentSessions} />
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No updates yet. Updates will appear here after your sessions.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomTabNav engagementId={engagementId} />
    </>
  )
}
