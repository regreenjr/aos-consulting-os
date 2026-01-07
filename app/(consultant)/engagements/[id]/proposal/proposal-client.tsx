'use client'

import { useState } from 'react'
import { ProposalEditor } from '@/components/consultant/proposal-editor'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProposalApprovalClientProps {
  engagementId: string
  intakeFormId?: string
  intakeResponses: Array<{ question: string; answer: string }>
  existingProposal?: {
    id: string
    content: string
    status: string
  }
  clientInfo: {
    full_name: string
    company_name?: string | null
    industry?: string | null
  }
  engagementInfo: {
    title: string
    description?: string | null
  }
}

export function ProposalApprovalClient({
  engagementId,
  intakeFormId,
  intakeResponses,
  existingProposal,
  clientInfo,
  engagementInfo,
}: ProposalApprovalClientProps) {
  const [proposalContent, setProposalContent] = useState(existingProposal?.content || '')
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    try {
      // Call API route to generate proposal with Claude
      const response = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeFormId,
          intakeResponses,
          clientInfo,
          engagementInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate proposal')
      }

      const data = await response.json()
      setProposalContent(data.content)

      // Save draft to database
      if (existingProposal) {
        await supabase
          .from('proposals')
          .update({
            content: data.content,
            ai_generated_at: new Date().toISOString(),
            status: 'draft',
          })
          .eq('id', existingProposal.id)
      } else {
        await supabase.from('proposals').insert({
          engagement_id: engagementId,
          intake_form_id: intakeFormId,
          content: data.content,
          status: 'draft',
          ai_generated_at: new Date().toISOString(),
        })
      }

      toast.success('Proposal generated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error generating proposal:', error)
      toast.error('Failed to generate proposal')
    }
  }

  const handleSave = async (content: string) => {
    try {
      if (existingProposal) {
        await supabase
          .from('proposals')
          .update({ content, status: 'draft' })
          .eq('id', existingProposal.id)
      } else {
        await supabase.from('proposals').insert({
          engagement_id: engagementId,
          intake_form_id: intakeFormId,
          content,
          status: 'draft',
        })
      }

      toast.success('Proposal saved as draft')
      router.refresh()
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error('Failed to save proposal')
    }
  }

  const handleApprove = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (existingProposal) {
        await supabase
          .from('proposals')
          .update({
            content,
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            sent_at: new Date().toISOString(),
          })
          .eq('id', existingProposal.id)
      } else {
        await supabase.from('proposals').insert({
          engagement_id: engagementId,
          intake_form_id: intakeFormId,
          content,
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
        })
      }

      // TODO: Send email notification to client
      toast.success('Proposal approved and sent to client!')
      router.push('/consultant/dashboard')
    } catch (error) {
      console.error('Error approving proposal:', error)
      toast.error('Failed to approve proposal')
    }
  }

  return (
    <ProposalEditor
      intakeResponses={intakeResponses}
      existingProposal={existingProposal}
      onSave={handleSave}
      onApprove={handleApprove}
      onRegenerate={handleGenerate}
    />
  )
}
