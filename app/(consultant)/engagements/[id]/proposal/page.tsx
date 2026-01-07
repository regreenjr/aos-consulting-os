import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProposalApprovalClient } from './proposal-client'

export default async function ProposalApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch engagement with related data
  const { data: engagement, error } = await supabase
    .from('engagements')
    .select(`
      *,
      clients!inner(
        id,
        consultant_id,
        company_name,
        industry,
        users!inner(
          id,
          full_name,
          email
        )
      ),
      intake_forms(
        id,
        questions,
        responses,
        submitted_at
      ),
      proposals(
        id,
        content,
        status,
        ai_generated_at,
        approved_at,
        sent_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !engagement) {
    notFound()
  }

  // Check if consultant owns this engagement
  if (engagement.clients.consultant_id !== user.id) {
    redirect('/consultant/dashboard')
  }

  // Get the latest intake form
  const intakeForm = engagement.intake_forms?.[0]

  // Get the latest proposal or create placeholder
  const proposal = engagement.proposals?.[0]

  // Transform intake responses for the editor
  const intakeResponses = intakeForm
    ? (intakeForm.questions as any[]).map((q: any) => ({
        question: q.question,
        answer: (intakeForm.responses as any)[q.id] || 'No response',
      }))
    : []

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{engagement.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Client: {engagement.clients.users.full_name}
              {engagement.clients.company_name && ` • ${engagement.clients.company_name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Proposal Editor */}
      <div className="flex-1 overflow-hidden p-6">
        <ProposalApprovalClient
          engagementId={engagement.id}
          intakeFormId={intakeForm?.id}
          intakeResponses={intakeResponses}
          existingProposal={proposal}
          clientInfo={{
            full_name: engagement.clients.users.full_name,
            company_name: engagement.clients.company_name,
            industry: engagement.clients.industry,
          }}
          engagementInfo={{
            title: engagement.title,
            description: engagement.description,
          }}
        />
      </div>
    </div>
  )
}
