'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActionCard } from './action-card'
import { isAfter, isBefore, addDays } from 'date-fns'

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

interface ActionsClientProps {
  actions: Action[]
  engagementId: string
}

type FilterType = 'all' | 'due-soon' | 'overdue' | 'completed'

export function ActionsClient({ actions, engagementId }: ActionsClientProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  // Filter actions based on selected filter
  const filteredActions = actions.filter((action: any) => {
    const now = new Date()
    const dueDate = action.due_date ? new Date(action.due_date) : null

    switch (filter) {
      case 'due-soon':
        return (
          action.status !== 'completed' &&
          dueDate &&
          isAfter(dueDate, now) &&
          isBefore(dueDate, addDays(now, 7))
        )
      case 'overdue':
        return action.status !== 'completed' && dueDate && isBefore(dueDate, now)
      case 'completed':
        return action.status === 'completed'
      case 'all':
      default:
        return true
    }
  })

  // Count for each filter
  const counts = {
    all: actions.length,
    'due-soon': actions.filter((a: any) => {
      const now = new Date()
      const dueDate = a.due_date ? new Date(a.due_date) : null
      return (
        a.status !== 'completed' &&
        dueDate &&
        isAfter(dueDate, now) &&
        isBefore(dueDate, addDays(now, 7))
      )
    }).length,
    overdue: actions.filter((a: any) => {
      const now = new Date()
      const dueDate = a.due_date ? new Date(a.due_date) : null
      return a.status !== 'completed' && dueDate && isBefore(dueDate, now)
    }).length,
    completed: actions.filter((a: any) => a.status === 'completed').length,
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
            <span className="ml-1.5 text-xs opacity-60">({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="due-soon" className="text-xs sm:text-sm">
            Due Soon
            {counts['due-soon'] > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({counts['due-soon']})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs sm:text-sm">
            Overdue
            {counts.overdue > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({counts.overdue})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Done
            {counts.completed > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({counts.completed})</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {filter === 'all' && 'No action items yet.'}
            {filter === 'due-soon' && 'No actions due in the next 7 days.'}
            {filter === 'overdue' && 'No overdue actions. Great job!'}
            {filter === 'completed' && 'No completed actions yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action: any) => (
            <ActionCard key={action.id} action={action} engagementId={engagementId} />
          ))}
        </div>
      )}
    </div>
  )
}
