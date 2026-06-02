import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Check, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ClerkTask } from '@/types'

const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

export function ClerkCallings() {
  usePageTitle('Callings')
  const { clerkTasks, callings, members, completeTask } = useData()

  const [selected, setSelected] = useState<ClerkTask | null>(null)
  const [completing, setCompleting] = useState(false)

  const pending = clerkTasks.filter((t) => !t.is_complete)
  const completed = clerkTasks.filter((t) => t.is_complete)

  const getCallingDetail = (task: ClerkTask) => {
    const calling = callings.find((c) => c.id === task.calling_id)
    const member = calling ? members.find((m) => m.id === calling.member_id) : null
    return { calling, member }
  }

  const handleDone = async () => {
    if (!selected) return
    setCompleting(true)
    await completeTask(selected.id)
    setCompleting(false)
    setSelected(null)
    toast.success('Task marked as done')
  }

  const TaskRow = ({ task }: { task: ClerkTask }) => {
    const { calling, member } = getCallingDetail(task)
    const isDone = task.is_complete
    return (
      <button
        onClick={() => setSelected(task)}
        className="w-full text-left flex items-center justify-between border-b px-6 py-4 last:border-0 hover:bg-accent/50 transition-colors"
      >
        <div className="min-w-0 flex-1 pr-4">
          <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>
            {member ? `${member.last_name}, ${member.first_name}` : task.description}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {calling?.position ?? '—'} · {formatDate(task.created_at)}
          </p>
        </div>
        {isDone ? (
          <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800 shrink-0">Done</Badge>
        ) : (
          <Badge variant="outline" className="border-amber-200 bg-amber-100 text-amber-800 shrink-0">Pending</Badge>
        )}
      </button>
    )
  }

  const DetailContent = ({ task }: { task: ClerkTask }) => {
    const { calling, member } = getCallingDetail(task)
    return (
      <div className="space-y-4 py-2">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <Row label="Task" value={task.task_type === 'calling_assigned' ? 'Record new calling' : 'Record release of calling'} />
          {member && <Row label="Member" value={`${member.last_name}, ${member.first_name}`} />}
          {calling && <Row label="Position" value={calling.position} />}
          {calling?.sustained_date && <Row label="Sustained Date" value={formatDate(calling.sustained_date)} />}
          {calling && (
            <Row label="Set Apart" value={calling.is_set_apart ? 'Yes' : 'No'} />
          )}
          {task.task_type === 'calling_released' && calling?.released_date && (
            <Row label="Released Date" value={formatDate(calling.released_date)} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">Submitted {formatDate(task.created_at)}</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <div>
        <h2 className="text-xl font-bold">Callings</h2>
        <p className="text-sm text-muted-foreground">
          {pending.length} pending task{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      {clerkTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No calling tasks yet</p>
          <p className="text-xs text-muted-foreground">Tasks from the admin will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <Card>
              <CardContent className="p-0">
                {pending.map((t) => <TaskRow key={t.id} task={t} />)}
              </CardContent>
            </Card>
          )}

          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">Completed</p>
              <Card>
                <CardContent className="p-0">
                  {completed.map((t) => <TaskRow key={t.id} task={t} />)}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null) }}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {selected?.task_type === 'calling_assigned' ? 'Calling Assignment' : 'Calling Release'}
            </DialogTitle>
          </DialogHeader>
          {selected && <DetailContent task={selected} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={completing}>
              Close
            </Button>
            {selected && !selected.is_complete && (
              <Button onClick={handleDone} disabled={completing}>
                <Check className="mr-1.5 h-4 w-4" />
                {completing ? 'Saving…' : 'Mark as Done'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
