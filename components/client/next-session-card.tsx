'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

interface Session {
  id: string
  title: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
}

interface NextSessionCardProps {
  session: Session
}

export function NextSessionCard({ session }: NextSessionCardProps) {
  const sessionDate = new Date(session.scheduled_at)
  const now = new Date()
  const isToday = sessionDate.toDateString() === now.toDateString()
  const timeUntil = formatDistanceToNow(sessionDate, { addSuffix: true })

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-semibold">
                Next Session
              </Badge>
              {isToday && (
                <Badge variant="secondary" className="animate-pulse">
                  Today
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg">
                {session.title || 'Coaching Session'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isToday ? 'Today' : timeUntil}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(sessionDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(sessionDate, 'h:mm a')} • {session.duration_minutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Calendar icon decoration */}
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
