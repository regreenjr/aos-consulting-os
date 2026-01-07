'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle2, XCircle, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Proposal {
  id: string
  content: string
  status: string
  ai_generated_at: string | null
  approved_at: string | null
  sent_at: string | null
  client_response: string | null
  client_responded_at: string | null
  created_at: string
}

interface ProposalViewProps {
  proposal: Proposal
  engagementTitle: string
  engagementId: string
}

export function ProposalView({ proposal, engagementTitle, engagementId }: ProposalViewProps) {
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasResponded = proposal.status === 'accepted' || proposal.status === 'rejected'

  const handleAccept = async () => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          client_responded_at: new Date().toISOString(),
        })
        .eq('id', proposal.id)

      if (error) throw error

      toast.success('Proposal accepted! Your consultant will be notified.')
      setIsAcceptDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error accepting proposal:', error)
      toast.error('Failed to accept proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          client_response: rejectReason.trim(),
          client_responded_at: new Date().toISOString(),
        })
        .eq('id', proposal.id)

      if (error) throw error

      toast.success('Response sent. Your consultant will follow up with you.')
      setIsRejectDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      toast.error('Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{engagementTitle}</h1>
            <p className="text-sm text-muted-foreground">Engagement Proposal</p>
          </div>
          <Badge
            variant={
              proposal.status === 'accepted'
                ? 'default'
                : proposal.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
          >
            {proposal.status === 'accepted' && '✓ Accepted'}
            {proposal.status === 'rejected' && '✗ Declined'}
            {proposal.status === 'sent' && 'Awaiting Response'}
            {proposal.status === 'approved' && 'Ready for Review'}
          </Badge>
        </div>

        {proposal.sent_at && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Sent {format(new Date(proposal.sent_at), 'MMMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Proposal Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{proposal.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Response Section */}
      {!hasResponded && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please review the proposal and let your consultant know if you'd like to proceed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1" size="lg">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Accept Proposal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Accept Proposal</DialogTitle>
                      <DialogDescription>
                        Are you ready to move forward with this engagement? Your consultant will be
                        notified and will reach out to schedule your first session.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAccept} disabled={isSubmitting}>
                        {isSubmitting ? 'Accepting...' : 'Confirm'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" size="lg">
                      <XCircle className="h-5 w-5 mr-2" />
                      Request Changes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Changes</DialogTitle>
                      <DialogDescription>
                        Let your consultant know what you'd like to see changed or clarified.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please explain what changes you'd like..."
                      className="min-h-[120px]"
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReject} disabled={isSubmitting || !rejectReason.trim()}>
                        {isSubmitting ? 'Sending...' : 'Send Feedback'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display (if already responded) */}
      {hasResponded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={proposal.status === 'accepted' ? 'default' : 'destructive'}>
                {proposal.status === 'accepted' ? 'Accepted' : 'Changes Requested'}
              </Badge>
              {proposal.client_responded_at && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(proposal.client_responded_at), 'MMMM d, yyyy')}
                </span>
              )}
            </div>
            {proposal.client_response && (
              <p className="text-sm text-muted-foreground mt-2">{proposal.client_response}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
