'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, CheckCircle2, Calendar } from 'lucide-react'

interface ProgressStatsProps {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalActions: number
  completedActions: number
  totalSessions: number
  completedSessions: number
}

export function ProgressStats({
  totalGoals,
  completedGoals,
  activeGoals,
  totalActions,
  completedActions,
  totalSessions,
  completedSessions,
}: ProgressStatsProps) {
  const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
  const actionProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Goals */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Goals</p>
                <p className="text-2xl font-bold">{completedGoals}/{totalGoals}</p>
              </div>
            </div>

            {totalGoals > 0 && (
              <>
                <Progress value={goalProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{goalProgress}% complete</span>
                  <span>{activeGoals} active</span>
                </div>
              </>
            )}

            {totalGoals === 0 && (
              <p className="text-xs text-muted-foreground">No goals set yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Actions</p>
                <p className="text-2xl font-bold">{completedActions}/{totalActions}</p>
              </div>
            </div>

            {totalActions > 0 && (
              <>
                <Progress value={actionProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{actionProgress}% complete</span>
                  <span>{totalActions - completedActions} pending</span>
                </div>
              </>
            )}

            {totalActions === 0 && (
              <p className="text-xs text-muted-foreground">No actions yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sessions</p>
                <p className="text-2xl font-bold">{completedSessions}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {totalSessions - completedSessions > 0 ? (
                <>{totalSessions - completedSessions} upcoming</>
              ) : (
                <>All sessions completed</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
