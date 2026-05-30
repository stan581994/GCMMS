import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, BookOpen } from 'lucide-react'
import { MemberSearchInput } from '@/components/MemberSearchInput'
import { CALLING_POSITIONS } from '@/lib/callings'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { Calling } from '@/types'

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const today = new Date().toISOString().split('T')[0]

export function CallingManagement() {
  usePageTitle('Callings')
  const { members, callings, assignCalling, releaseCalling } = useData()

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignMemberId, setAssignMemberId] = useState<string | null>(null)
  const [organization, setOrganization] = useState('')
  const [position, setPosition] = useState('')
  const [customPosition, setCustomPosition] = useState('')
  const [sustainedDate, setSustainedDate] = useState('')
  const [isSetApart, setIsSetApart] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState('')

  const organizationPositions = CALLING_POSITIONS.find((g) => g.group === organization)?.positions ?? []

  // Release dialog state
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseMemberId, setReleaseMemberId] = useState<string | null>(null)
  const [releaseCallingId, setReleaseCallingId] = useState<string | null>(null)
  const [releasedDate, setReleasedDate] = useState('')
  const [releaseLoading, setReleaseLoading] = useState(false)
  const [releaseError, setReleaseError] = useState('')

  const memberName = (memberId: string) => {
    const m = members.find((m) => m.id === memberId)
    return m ? `${m.last_name}, ${m.first_name}` : `#${memberId}`
  }

  const activeCallings = callings.filter((c) => c.status === 'active')
  const releasedCallings = callings.filter((c) => c.status === 'released')

  // Active callings for the selected member in the release dialog
  const memberActiveCallings = releaseMemberId
    ? callings.filter((c) => c.member_id === releaseMemberId && c.status === 'active')
    : []

  const handleAssignOpenChange = (open: boolean) => {
    setAssignOpen(open)
    if (!open) {
      setAssignMemberId(null)
      setOrganization('')
      setPosition('')
      setCustomPosition('')
      setSustainedDate('')
      setIsSetApart(false)
      setAssignError('')
    }
  }

  const resolvedPosition = position === '__custom__' ? customPosition.trim() : position

  const handleAssign = async () => {
    if (!assignMemberId || !resolvedPosition) return
    setAssignError('')
    setAssignLoading(true)
    const { error } = await assignCalling({
      member_id: assignMemberId,
      position: resolvedPosition,
      sustained_date: sustainedDate || null,
      is_set_apart: isSetApart,
    })
    setAssignLoading(false)
    if (error) { setAssignError(error); return }
    handleAssignOpenChange(false)
  }

  const handleReleaseOpen = (calling: Calling) => {
    setReleaseMemberId(calling.member_id)
    setReleaseCallingId(calling.id)
    setReleasedDate('')
    setReleaseError('')
    setReleaseOpen(true)
  }

  const handleReleaseOpenChange = (open: boolean) => {
    setReleaseOpen(open)
    if (!open) {
      setReleaseMemberId(null)
      setReleaseCallingId(null)
      setReleasedDate('')
      setReleaseError('')
    }
  }

  const handleRelease = async () => {
    if (!releaseCallingId || !releasedDate) return
    setReleaseError('')
    setReleaseLoading(true)
    const { error } = await releaseCalling({ calling_id: releaseCallingId, released_date: releasedDate })
    setReleaseLoading(false)
    if (error) { setReleaseError(error); return }
    handleReleaseOpenChange(false)
  }

  const CallingRow = ({ c }: { c: Calling }) => (
    <>
      {/* Desktop row */}
      <TableRow className="hidden md:table-row">
        <TableCell className="font-medium">{memberName(c.member_id)}</TableCell>
        <TableCell>{c.position}</TableCell>
        <TableCell className="text-muted-foreground">{formatDate(c.sustained_date)}</TableCell>
        <TableCell>
          {c.is_set_apart ? (
            <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">Yes</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">No</span>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={
              c.status === 'active'
                ? 'border-teal-200 bg-teal-100 text-teal-800'
                : 'border-gray-200 bg-gray-100 text-gray-500'
            }
          >
            {c.status === 'active' ? 'Active' : 'Released'}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">{formatDate(c.released_date)}</TableCell>
        <TableCell>
          {c.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleReleaseOpen(c)}
            >
              Release
            </Button>
          )}
        </TableCell>
      </TableRow>
    </>
  )

  const CallingCard = ({ c }: { c: Calling }) => (
    <div className="rounded-lg border bg-card p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{memberName(c.member_id)}</p>
          <p className="text-sm text-muted-foreground truncate">{c.position}</p>
        </div>
        <Badge
          variant="outline"
          className={
            c.status === 'active'
              ? 'border-teal-200 bg-teal-100 text-teal-800 shrink-0'
              : 'border-gray-200 bg-gray-100 text-gray-500 shrink-0'
          }
        >
          {c.status === 'active' ? 'Active' : 'Released'}
        </Badge>
      </div>
      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
        <p>Sustained: {formatDate(c.sustained_date)}</p>
        <p>Set Apart: {c.is_set_apart ? 'Yes' : 'No'}</p>
        {c.released_date && <p>Released: {formatDate(c.released_date)}</p>}
      </div>
      {c.status === 'active' && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleReleaseOpen(c)}
          >
            Release Calling
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Callings</h2>
          <p className="text-sm text-muted-foreground">{activeCallings.length} active callings</p>
        </div>
        <Button onClick={() => setAssignOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Calling
        </Button>
      </div>

      {/* Active callings */}
      {activeCallings.length > 0 && (
        <>
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Sustained</TableHead>
                  <TableHead>Set Apart</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCallings.map((c) => <CallingRow key={c.id} c={c} />)}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {activeCallings.map((c) => <CallingCard key={c.id} c={c} />)}
          </div>
        </>
      )}

      {/* Released callings */}
      {releasedCallings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Released</h3>
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Sustained</TableHead>
                  <TableHead>Set Apart</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {releasedCallings.map((c) => <CallingRow key={c.id} c={c} />)}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {releasedCallings.map((c) => <CallingCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {callings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No callings recorded yet</p>
          <p className="text-xs text-muted-foreground">Click "Assign Calling" to get started</p>
        </div>
      )}

      {/* Assign Calling Dialog */}
      <Dialog open={assignOpen} onOpenChange={handleAssignOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Assign Calling</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Member</Label>
              <MemberSearchInput
                members={members}
                value={assignMemberId}
                onChange={setAssignMemberId}
                placeholder="Search member…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Select
                value={organization}
                onValueChange={(v) => { setOrganization(v); setPosition(''); setCustomPosition('') }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization…" />
                </SelectTrigger>
                <SelectContent>
                  {CALLING_POSITIONS.map((g) => (
                    <SelectItem key={g.group} value={g.group}>
                      {g.group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Calling Position</Label>
              <Select
                value={position}
                onValueChange={(v) => { setPosition(v); setCustomPosition('') }}
                disabled={!organization}
              >
                <SelectTrigger>
                  <SelectValue placeholder={organization ? 'Select a position…' : 'Choose an organization first'} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {organizationPositions.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__" className="text-xs italic text-muted-foreground">
                    Custom calling…
                  </SelectItem>
                </SelectContent>
              </Select>
              {position === '__custom__' && (
                <Input
                  placeholder="Type the calling name…"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  autoFocus
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Sustained Date</Label>
              <Input
                type="date"
                value={sustainedDate}
                max={today}
                onChange={(e) => setSustainedDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="set-apart"
                type="checkbox"
                checked={isSetApart}
                onChange={(e) => setIsSetApart(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
              />
              <Label htmlFor="set-apart" className="cursor-pointer font-normal">
                Set apart?
              </Label>
            </div>
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleAssignOpenChange(false)} disabled={assignLoading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!assignMemberId || !resolvedPosition || assignLoading}>
              {assignLoading ? 'Saving…' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Calling Dialog */}
      <Dialog open={releaseOpen} onOpenChange={handleReleaseOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Release Calling</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Member</Label>
              <MemberSearchInput
                members={members}
                value={releaseMemberId}
                onChange={(id) => {
                  setReleaseMemberId(id)
                  setReleaseCallingId(null)
                }}
                placeholder="Search member…"
              />
            </div>
            {releaseMemberId && memberActiveCallings.length > 0 && (
              <div className="space-y-1.5">
                <Label>Active Calling to Release</Label>
                <Select
                  value={releaseCallingId ?? ''}
                  onValueChange={setReleaseCallingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calling…" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberActiveCallings.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {releaseMemberId && memberActiveCallings.length === 0 && (
              <p className="text-sm text-muted-foreground">This member has no active callings.</p>
            )}
            <div className="space-y-1.5">
              <Label>Released Date</Label>
              <Input
                type="date"
                value={releasedDate}
                max={today}
                onChange={(e) => setReleasedDate(e.target.value)}
              />
            </div>
            {releaseError && <p className="text-sm text-destructive">{releaseError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleReleaseOpenChange(false)} disabled={releaseLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleRelease}
              disabled={!releaseCallingId || !releasedDate || releaseLoading}
            >
              {releaseLoading ? 'Saving…' : 'Release'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
