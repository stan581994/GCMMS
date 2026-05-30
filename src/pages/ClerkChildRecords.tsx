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
import { Check, Baby } from 'lucide-react'
import type { ChildRecordTask, ChildRecord } from '@/types'

const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const yesNo = (v: boolean) => (v ? 'Yes' : 'No')

export function ClerkChildRecords() {
  const { childRecordTasks, childRecords, completeChildRecordTask } = useData()

  const [selected, setSelected] = useState<ChildRecordTask | null>(null)
  const [completing, setCompleting] = useState(false)

  const pending = childRecordTasks.filter((t) => !t.is_complete)
  const completed = childRecordTasks.filter((t) => t.is_complete)

  const getRecord = (task: ChildRecordTask): ChildRecord | undefined =>
    childRecords.find((r) => r.id === task.child_record_id)

  const handleDone = async () => {
    if (!selected) return
    setCompleting(true)
    await completeChildRecordTask(selected.id)
    setCompleting(false)
    setSelected(null)
  }

  const TaskRow = ({ task }: { task: ChildRecordTask }) => {
    const record = getRecord(task)
    const isDone = task.is_complete
    return (
      <button
        onClick={() => setSelected(task)}
        className="w-full text-left flex items-center justify-between border-b px-6 py-4 last:border-0 hover:bg-accent/50 transition-colors"
      >
        <div className="min-w-0 flex-1 pr-4">
          <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>
            {record?.child_name ?? task.description}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {record ? `Born ${formatDate(record.birth_date)}` : '—'} · {formatDate(task.created_at)}
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

  const DetailContent = ({ task }: { task: ChildRecordTask }) => {
    const r = getRecord(task)
    if (!r) return <p className="text-sm text-muted-foreground py-2">Record details not found.</p>
    return (
      <div className="space-y-4 py-2">
        {/* Individual */}
        <Section title="Individual Information">
          <Row label="Child's Name" value={r.child_name} />
          <Row label="Gender" value={r.gender === 'male' ? 'Male' : 'Female'} />
          <Row label="Birth Date" value={formatDate(r.birth_date)} />
          <Row label="Place of Birth" value={r.place_of_birth} />
          <Row label="Born in Covenant" value={yesNo(r.born_in_covenant)} />
          {r.address && <Row label="Address" value={r.address} />}
        </Section>

        {/* Parents */}
        {(r.father_name || r.mother_maiden_name || r.guardian_name) && (
          <Section title="Parents">
            {r.father_name && (
              <>
                <Row label="Father's Name" value={r.father_name} />
                <Row label="Father Member" value={yesNo(r.father_is_member)} />
                {r.father_record_or_birthdate && <Row label="Father Record/Birthdate" value={r.father_record_or_birthdate} />}
              </>
            )}
            {r.mother_maiden_name && (
              <>
                <Row label="Mother's Maiden Name" value={r.mother_maiden_name} />
                <Row label="Mother Member" value={yesNo(r.mother_is_member)} />
                {r.mother_record_or_birthdate && <Row label="Mother Record/Birthdate" value={r.mother_record_or_birthdate} />}
              </>
            )}
            {r.parents_ward_branch && <Row label="Parents' Ward/Branch" value={r.parents_ward_branch} />}
            {r.parents_unit_number && <Row label="Unit Number" value={r.parents_unit_number} />}
            {r.guardian_name && (
              <>
                <Row label="Child Lives With" value={r.guardian_name} />
                <Row label="Guardian Member" value={yesNo(r.guardian_is_member)} />
                {r.guardian_record_or_birthdate && <Row label="Guardian Record/Birthdate" value={r.guardian_record_or_birthdate} />}
              </>
            )}
          </Section>
        )}

        {/* Blessing */}
        {(r.blessing_date || r.blessing_performer_name) && (
          <Section title="Blessing Information">
            {r.blessing_date && <Row label="Blessing Date" value={formatDate(r.blessing_date)} />}
            {r.blessing_performer_name && <Row label="Performed By" value={r.blessing_performer_name} />}
            {r.blessing_priesthood_office && <Row label="Priesthood Office" value={r.blessing_priesthood_office} />}
            {r.blessing_performer_record_or_birthdate && <Row label="Performer Record/Birthdate" value={r.blessing_performer_record_or_birthdate} />}
          </Section>
        )}

        <p className="text-xs text-muted-foreground">Submitted {formatDate(task.created_at)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Child Records</h2>
        <p className="text-sm text-muted-foreground">
          {pending.length} pending task{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      {childRecordTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Baby className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No child record tasks yet</p>
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Child Record Details</DialogTitle>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        {children}
      </div>
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
