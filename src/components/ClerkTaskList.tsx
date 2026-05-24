import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ClerkTask } from '@/types'

interface ClerkTaskListProps {
  tasks: ClerkTask[]
  onComplete: (taskId: string) => Promise<void>
}

export function ClerkTaskList({ tasks, onComplete }: ClerkTaskListProps) {
  const pending = tasks.filter((t) => !t.is_complete)
  const completed = tasks.filter((t) => t.is_complete)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Pending tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Pending Tasks</CardTitle>
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
              {pending.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">No pending tasks.</p>
          ) : (
            pending.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b px-6 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm">{task.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.created_at)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onComplete(task.id)}>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Done
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {completed.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b px-6 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm line-through text-muted-foreground">{task.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.completed_at ? formatDate(task.completed_at) : formatDate(task.created_at)}
                  </p>
                </div>
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800 shrink-0">
                  Done
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
