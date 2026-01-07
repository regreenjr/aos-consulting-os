'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Calendar, TrendingUp } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  status: string
  target_date: string | null
  created_at: string
  updated_at: string
}

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  // Calculate progress percentage
  const progress =
    goal.target_value && goal.current_value
      ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
      : 0

  const hasMetrics = goal.target_value !== null && goal.current_value !== null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {goal.title}
          </CardTitle>
          <Badge
            variant={goal.status === 'completed' ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {goal.status === 'in_progress' ? 'In Progress' : goal.status}
          </Badge>
        </div>
        {goal.description && (
          <p className="text-sm text-muted-foreground pt-1">{goal.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {hasMetrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </div>
              <span className="font-medium">
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-right">
              <span className="text-xs font-medium text-muted-foreground">
                {progress}% complete
              </span>
            </div>
          </div>
        )}

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
            <Calendar className="h-4 w-4" />
            <span>Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
