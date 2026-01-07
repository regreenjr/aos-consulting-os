'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, CheckCircle2, Calendar, Circle } from 'lucide-react'
import { format, isFuture, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  type: 'goal' | 'session' | 'action'
  title: string
  description: string | null
  date: string
  status: string
  progress?: number
}

interface ProgressTimelineProps {
  events: TimelineEvent[]
}

export function ProgressTimeline({ events }: ProgressTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return Target
      case 'session':
        return Calendar
      case 'action':
        return CheckCircle2
      default:
        return Circle
    }
  }

  const getStatusColor = (event: TimelineEvent) => {
    if (event.status === 'completed') return 'text-primary'
    if (event.type === 'goal' && event.status === 'in_progress') return 'text-primary/60'
    if (isFuture(new Date(event.date))) return 'text-muted-foreground'
    return 'text-muted-foreground'
  }

  const getStatusBadge = (event: TimelineEvent) => {
    if (event.status === 'completed') {
      return <Badge variant="default">Completed</Badge>
    }
    if (event.type === 'goal' && event.status === 'in_progress') {
      return <Badge variant="secondary">In Progress</Badge>
    }
    if (event.type === 'session' && event.status === 'scheduled') {
      return <Badge variant="outline">Scheduled</Badge>
    }
    if (isFuture(new Date(event.date))) {
      return <Badge variant="outline">Upcoming</Badge>
    }
    return null
  }

  return (
    <div className="relative space-y-4">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

      {events.map((event, index) => {
        const Icon = getIcon(event.type)
        const statusColor = getStatusColor(event)
        const isCompleted = event.status === 'completed'
        const eventDate = new Date(event.date)

        return (
          <div key={event.id} className="relative pl-12">
            {/* Timeline dot */}
            <div
              className={cn(
                'absolute left-0 p-2 rounded-full bg-background border-2',
                isCompleted ? 'border-primary' : 'border-border'
              )}
            >
              <Icon className={cn('h-4 w-4', statusColor)} />
            </div>

            {/* Event card */}
            <Card
              className={cn(
                'transition-all',
                isCompleted && 'border-primary/20',
                !isCompleted && isFuture(eventDate) && 'border-dashed'
              )}
            >
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold leading-tight">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(event)}
                  </div>

                  {/* Progress bar for goals */}
                  {event.type === 'goal' && event.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium">{event.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isFuture(eventDate) && 'Target: '}
                      {format(eventDate, 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
