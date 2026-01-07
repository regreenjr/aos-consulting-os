import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { ProposalView } from '@/components/client/proposal-view'

export default async function ClientProposalPage({
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

  // Fetch engagement with proposal
  const { data: engagement } = await supabase
    .from('engagements')
    .select(
      `
      *,
      clients!inner(
        id,
        user_id,
        consultant_id,
        company_name,
        industry,
        users!inner(id, full_name, email)
      ),
      proposals(
        id,
        content,
        status,
        ai_generated_at,
        approved_at,
        sent_at,
        client_response,
        client_responded_at,
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

  // Get the most recent approved/sent proposal
  const approvedProposal = engagement.proposals
    ?.filter((p: any) => p.status === 'approved' || p.status === 'sent' || p.status === 'accepted' || p.status === 'rejected')
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {!approvedProposal ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Your consultant is working on your proposal. You'll be notified when it's ready!
            </p>
          </div>
        ) : (
          <ProposalView
            proposal={approvedProposal}
            engagementTitle={engagement.title}
            engagementId={engagementId}
          />
        )}
      </div>

      <BottomTabNav engagementId={engagementId} />
    </>
  )
}
