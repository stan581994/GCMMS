import { useState } from 'react'
import { useData } from '@/context/DataContext'
import type { SubmitChildRecordInput } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Baby } from 'lucide-react'
import type { ChildRecord } from '@/types'

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const today = new Date().toISOString().split('T')[0]

const BLANK: SubmitChildRecordInput = {
  child_name: '',
  gender: 'male',
  birth_date: '',
  place_of_birth: '',
  born_in_covenant: false,
  address: null,
  father_name: null,
  father_is_member: false,
  father_record_or_birthdate: null,
  mother_maiden_name: null,
  mother_is_member: false,
  mother_record_or_birthdate: null,
  parents_ward_branch: null,
  parents_unit_number: null,
  guardian_name: null,
  guardian_is_member: false,
  guardian_record_or_birthdate: null,
  blessing_date: null,
  blessing_performer_name: null,
  blessing_priesthood_office: null,
  blessing_performer_record_or_birthdate: null,
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b pb-1 mb-3 mt-5 first:mt-0">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
    </div>
  )
}

export function ChildRecordManagement() {
  const { childRecords, submitChildRecord } = useData()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SubmitChildRecordInput>(BLANK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof SubmitChildRecordInput>(
    key: K,
    value: SubmitChildRecordInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) { setForm(BLANK); setError('') }
  }

  const handleSubmit = async () => {
    if (!form.child_name || !form.birth_date || !form.place_of_birth) return
    setError('')
    setLoading(true)
    const { error: err } = await submitChildRecord(form)
    setLoading(false)
    if (err) { setError(err); return }
    handleOpenChange(false)
  }

  const ChildRow = ({ r }: { r: ChildRecord }) => (
    <TableRow className="hidden md:table-row">
      <TableCell className="font-medium">{r.child_name}</TableCell>
      <TableCell className="capitalize">{r.gender}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(r.birth_date)}</TableCell>
      <TableCell>{r.place_of_birth}</TableCell>
      <TableCell>{r.born_in_covenant ? 'Yes' : 'No'}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(r.blessing_date)}</TableCell>
      <TableCell>{r.blessing_performer_name ?? '—'}</TableCell>
    </TableRow>
  )

  const ChildCard = ({ r }: { r: ChildRecord }) => (
    <div className="rounded-lg border bg-card p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{r.child_name}</p>
          <p className="text-sm text-muted-foreground capitalize">{r.gender} · Born {formatDate(r.birth_date)}</p>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
        <p>Place of birth: {r.place_of_birth}</p>
        <p>Born in covenant: {r.born_in_covenant ? 'Yes' : 'No'}</p>
        {r.blessing_date && <p>Blessed: {formatDate(r.blessing_date)}</p>}
        {r.blessing_performer_name && <p>By: {r.blessing_performer_name}</p>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Child Records</h2>
          <p className="text-sm text-muted-foreground">{childRecords.length} record{childRecords.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Child Record
        </Button>
      </div>

      {childRecords.length > 0 ? (
        <>
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child's Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Place of Birth</TableHead>
                  <TableHead>Born in Covenant</TableHead>
                  <TableHead>Blessing Date</TableHead>
                  <TableHead>Blessed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childRecords.map((r) => <ChildRow key={r.id} r={r} />)}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {childRecords.map((r) => <ChildCard key={r.id} r={r} />)}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Baby className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No child records yet</p>
          <p className="text-xs text-muted-foreground">Click "New Child Record" to get started</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Child Record Form</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-1">
            {/* Individual Information */}
            <SectionHeader title="Individual Information" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Child's Name (Surname, Given name, Suffix) <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Santos, Juan Jr."
                  value={form.child_name}
                  onChange={(e) => set('child_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Gender <span className="text-destructive">*</span></Label>
                  <div className="flex gap-6 pt-1">
                    {(['male', 'female'] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={() => set('gender', g)}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="capitalize">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Born in Covenant</Label>
                  <div className="flex gap-6 pt-1">
                    {([['Yes', true], ['No', false]] as const).map(([label, val]) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="born-in-covenant"
                          checked={form.born_in_covenant === val}
                          onChange={() => set('born_in_covenant', val)}
                          className="accent-primary h-4 w-4"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Birth Date <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={form.birth_date}
                    max={today}
                    onChange={(e) => set('birth_date', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Place of Birth <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="City, Province"
                    value={form.place_of_birth}
                    onChange={(e) => set('place_of_birth', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  placeholder="Street, City"
                  value={form.address ?? ''}
                  onChange={(e) => set('address', e.target.value || null)}
                />
              </div>
            </div>

            {/* Parents */}
            <SectionHeader title="Parents" />
            <div className="space-y-4">
              {/* Father */}
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label>Father's Name</Label>
                  <Input
                    placeholder="Surname, Given name"
                    value={form.father_name ?? ''}
                    onChange={(e) => set('father_name', e.target.value || null)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Member</Label>
                    <div className="flex gap-6">
                      {(['yes', 'no'] as const).map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="father-member"
                            checked={v === 'yes' ? form.father_is_member : !form.father_is_member}
                            onChange={() => set('father_is_member', v === 'yes')}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="capitalize">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Record No. or Birth Date</Label>
                    <Input
                      placeholder="Number or date"
                      value={form.father_record_or_birthdate ?? ''}
                      onChange={(e) => set('father_record_or_birthdate', e.target.value || null)}
                    />
                  </div>
                </div>
              </div>

              {/* Mother */}
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label>Mother's Maiden Name</Label>
                  <Input
                    placeholder="Surname, Given name"
                    value={form.mother_maiden_name ?? ''}
                    onChange={(e) => set('mother_maiden_name', e.target.value || null)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Member</Label>
                    <div className="flex gap-6">
                      {(['yes', 'no'] as const).map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="mother-member"
                            checked={v === 'yes' ? form.mother_is_member : !form.mother_is_member}
                            onChange={() => set('mother_is_member', v === 'yes')}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="capitalize">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Record No. or Birth Date</Label>
                    <Input
                      placeholder="Number or date"
                      value={form.mother_record_or_birthdate ?? ''}
                      onChange={(e) => set('mother_record_or_birthdate', e.target.value || null)}
                    />
                  </div>
                </div>
              </div>

              {/* Parents' ward */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ward/Branch where parents live</Label>
                  <Input
                    placeholder="If different from this unit"
                    value={form.parents_ward_branch ?? ''}
                    onChange={(e) => set('parents_ward_branch', e.target.value || null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Number</Label>
                  <Input
                    placeholder="If known"
                    value={form.parents_unit_number ?? ''}
                    onChange={(e) => set('parents_unit_number', e.target.value || null)}
                  />
                </div>
              </div>

              {/* Guardian */}
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label>Person child lives with <span className="text-muted-foreground font-normal text-xs">(if other than parents)</span></Label>
                  <Input
                    placeholder="Full name"
                    value={form.guardian_name ?? ''}
                    onChange={(e) => set('guardian_name', e.target.value || null)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Member</Label>
                    <div className="flex gap-6">
                      {(['yes', 'no'] as const).map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="guardian-member"
                            checked={v === 'yes' ? form.guardian_is_member : !form.guardian_is_member}
                            onChange={() => set('guardian_is_member', v === 'yes')}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="capitalize">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Record No. or Birth Date</Label>
                    <Input
                      placeholder="Number or date"
                      value={form.guardian_record_or_birthdate ?? ''}
                      onChange={(e) => set('guardian_record_or_birthdate', e.target.value || null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blessing Information */}
            <SectionHeader title="Blessing Information" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Blessing Date</Label>
                <Input
                  type="date"
                  value={form.blessing_date ?? ''}
                  max={today}
                  onChange={(e) => set('blessing_date', e.target.value || null)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Name of Person Who Performed the Blessing</Label>
                <Input
                  placeholder="Full name"
                  value={form.blessing_performer_name ?? ''}
                  onChange={(e) => set('blessing_performer_name', e.target.value || null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Priesthood Office</Label>
                  <Input
                    placeholder="e.g. Elder"
                    value={form.blessing_priesthood_office ?? ''}
                    onChange={(e) => set('blessing_priesthood_office', e.target.value || null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Record No. or Birth Date</Label>
                  <Input
                    placeholder="Number or date"
                    value={form.blessing_performer_record_or_birthdate ?? ''}
                    onChange={(e) => set('blessing_performer_record_or_birthdate', e.target.value || null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.child_name || !form.birth_date || !form.place_of_birth || loading}
            >
              {loading ? 'Saving…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
