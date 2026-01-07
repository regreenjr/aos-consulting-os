'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { format, isBefore } from 'date-fns'
import { Calendar, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Action {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  assigned_to: string
  created_at: string
  completed_at: string | null
  updated_at: string
}

interface ActionCardProps {
  action: Action
  engagementId: string
}

export function ActionCard({ action, engagementId }: ActionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isCompleted = action.status === 'completed'
  const isOverdue = action.due_date && !isCompleted && isBefore(new Date(action.due_date), new Date())

  const handleToggleComplete = async () => {
    setIsCompleting(true)

    try {
      const newStatus = isCompleted ? 'pending' : 'completed'
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString()
      } else {
        updates.completed_at = null
      }

      const { error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', action.id)

      if (error) throw error

      toast.success(
        isCompleted ? 'Action marked as pending' : 'Great job! Action completed 🎉'
      )
      router.refresh()
    } catch (error) {
      console.error('Error updating action:', error)
      toast.error('Failed to update action')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Card
      className={cn(
        'transition-all',
        isCompleted && 'opacity-60',
        isOverdue && !isCompleted && 'border-destructive/50'
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isCompleting}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <h3
                className={cn(
                  'font-medium leading-tight',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {action.title}
              </h3>
              {action.description && (
                <p className="text-sm text-muted-foreground">{action.description}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Due Date */}
              {action.due_date && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    isOverdue && !isCompleted
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>
                    {isOverdue && !isCompleted && 'Overdue: '}
                    {format(new Date(action.due_date), 'MMM d')}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              {!isCompleted && action.status === 'in_progress' && (
                <Badge variant="secondary" className="text-xs">
                  In Progress
                </Badge>
              )}

              {isCompleted && action.completed_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    Completed {format(new Date(action.completed_at), 'MMM d')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Icon */}
          <div className="shrink-0 pt-1">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
