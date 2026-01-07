'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { FileText, CheckCircle2 } from 'lucide-react'

interface SessionSummary {
  id: string
  content: string
  key_takeaways: string[] | null
  created_at: string
}

interface Session {
  id: string
  title: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
  session_summaries: SessionSummary[]
}

interface UpdatesFeedProps {
  sessions: Session[]
}

export function UpdatesFeed({ sessions }: UpdatesFeedProps) {
  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const summary = session.session_summaries[0]
        if (!summary) return null

        return (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">
                    {session.title || 'Session Summary'}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {format(new Date(session.scheduled_at), 'MMM d')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Summary content preview */}
              <div className="text-sm text-muted-foreground line-clamp-3">
                {summary.content}
              </div>

              {/* Key takeaways */}
              {summary.key_takeaways && summary.key_takeaways.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="space-y-1.5 ml-5">
                    {summary.key_takeaways.slice(0, 3).map((takeaway, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
