'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar, Clock, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionSummary {
  id: string
  content: string
  key_takeaways: string[] | null
  next_steps: string[] | null
  created_at: string
}

interface Session {
  id: string
  title: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
  notes: string | null
}

interface SessionSummaryCardProps {
  session: Session
  summary: SessionSummary
}

export function SessionSummaryCard({ session, summary }: SessionSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg">
              {session.title || 'Coaching Session'}
            </CardTitle>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(session.scheduled_at), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{session.duration_minutes} min</span>
              </div>
            </div>
          </div>
          <Badge variant="outline">
            {format(new Date(session.scheduled_at), 'MMM d')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Preview */}
        <div className={cn('space-y-3', !isExpanded && 'line-clamp-3')}>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {summary.content}
          </div>
        </div>

        {/* Key Takeaways - Always visible */}
        {summary.key_takeaways && summary.key_takeaways.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Key Takeaways</span>
            </div>
            <ul className="space-y-1.5 ml-5 list-disc list-outside">
              {summary.key_takeaways.map((takeaway, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps - Show when expanded */}
        {isExpanded && summary.next_steps && summary.next_steps.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Next Steps</span>
            </div>
            <ul className="space-y-1.5 ml-5 list-disc list-outside">
              {summary.next_steps.map((step, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Read More
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
