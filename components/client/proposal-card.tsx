'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Proposal {
  id: string
  status: string
  sent_at: string | null
  client_responded_at: string | null
}

interface ProposalCardProps {
  proposal: Proposal
  engagementId: string
}

export function ProposalCard({ proposal, engagementId }: ProposalCardProps) {
  const needsResponse = proposal.status === 'sent' || proposal.status === 'approved'
  const isAccepted = proposal.status === 'accepted'
  const isRejected = proposal.status === 'rejected'

  return (
    <Card className={cn(
      'border-primary/20',
      needsResponse && 'bg-primary/5',
      isAccepted && 'border-primary/30 bg-primary/5'
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Engagement Proposal</h3>
                {proposal.sent_at && (
                  <p className="text-sm text-muted-foreground">
                    Sent {format(new Date(proposal.sent_at), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {needsResponse && (
                <Badge variant="default" className="animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Response
                </Badge>
              )}
              {isAccepted && (
                <Badge variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Accepted
                </Badge>
              )}
              {isRejected && (
                <Badge variant="secondary">
                  Changes Requested
                </Badge>
              )}
            </div>

            {needsResponse && (
              <p className="text-sm text-muted-foreground">
                Please review the proposal and let your consultant know if you'd like to proceed.
              </p>
            )}

            <Link href={`/client/workspace/${engagementId}/proposal`}>
              <Button variant={needsResponse ? 'default' : 'outline'} className="w-full sm:w-auto">
                {needsResponse ? 'Review Proposal' : 'View Proposal'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
