import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { SessionSummaryCard } from '@/components/client/session-summary-card'

export default async function SessionsPage({
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

  // Fetch engagement with sessions
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
      sessions(
        id,
        title,
        scheduled_at,
        duration_minutes,
        status,
        notes,
        session_summaries(
          id,
          content,
          key_takeaways,
          next_steps,
          created_at
        )
      )
    `
    )
    .eq('id', engagementId)
    .single()

  // Verify user owns this engagement
  if (!engagement || engagement.clients.user_id !== user.id) {
    redirect('/login')
  }

  // Filter sessions that have summaries and are completed
  const sessionsWithSummaries = engagement.sessions
    ?.filter(
      (s: any) =>
        s.session_summaries &&
        s.session_summaries.length > 0 &&
        (s.status === 'completed' || new Date(s.scheduled_at) < new Date())
    )
    .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()) || []

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold">Session History</h1>
          <p className="text-sm text-muted-foreground">
            Review summaries and notes from past sessions
          </p>
        </div>

        {sessionsWithSummaries.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No session summaries yet. Summaries will appear here after your sessions with your
              consultant.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessionsWithSummaries.map((session) => (
              <SessionSummaryCard
                key={session.id}
                session={session}
                summary={session.session_summaries[0]}
              />
            ))}
          </div>
        )}
      </div>

      <BottomTabNav engagementId={engagementId} />
    </>
  )
}
