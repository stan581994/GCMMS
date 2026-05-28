import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { canEdit } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, ChevronUp, ChevronDown, UserPlus } from 'lucide-react'
import type { MemberStatus } from '@/types'

type SortKey = 'name' | 'address' | 'status' | 'updated_at'
type SortDir = 'asc' | 'desc'

const EMPTY_FORM = { first_name: '', last_name: '', status: 'active' as MemberStatus, address_street1: '', address_city: '', assigned_to: '' }

export function Members() {
  const { members, households, users, loading, addMember } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const userCanEdit = currentUser ? canEdit(currentUser.role) : false
  const isMinistering = currentUser?.role === 'ministering'

  useEffect(() => {
    console.log('[Members] loading:', loading)
    console.log('[Members] members count:', members.length)
    console.log('[Members] members sample (first 3):', members.slice(0, 3))
  }, [members, loading])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [householdFilter, setHouseholdFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAddMember = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('First name and last name are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    const { error } = await addMember({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      status: form.status,
      address_street1: form.address_street1.trim() || undefined,
      address_city: form.address_city.trim() || undefined,
      assigned_to: form.assigned_to.trim() || null,
    })
    setSaving(false)
    if (error) {
      setFormError(error)
    } else {
      setDialogOpen(false)
      setForm(EMPTY_FORM)
    }
  }

  const addressMap = useMemo(
    () => Object.fromEntries(households.map((h) => [h.id, h.address])),
    [households]
  )

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.full_name])),
    [users]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members
      .filter((m) => {
        if (isMinistering && m.assigned_to !== currentUser?.id) return false
        const assignedName = m.assigned_to ? (userMap[m.assigned_to] ?? m.assigned_to) : ''
        const matchSearch =
          !q ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
          assignedName.toLowerCase().includes(q)
        const matchStatus = statusFilter === 'all' || m.status === statusFilter
        const matchHousehold = householdFilter === 'all' || m.household_id === householdFilter
        return matchSearch && matchStatus && matchHousehold
      })
      .sort((a, b) => {
        let va: string, vb: string
        if (sortKey === 'name') {
          va = `${a.last_name} ${a.first_name}`
          vb = `${b.last_name} ${b.first_name}`
        } else if (sortKey === 'address') {
          va = a.address ?? addressMap[a.household_id] ?? ''
          vb = b.address ?? addressMap[b.household_id] ?? ''
        } else if (sortKey === 'status') {
          va = a.status
          vb = b.status
        } else {
          va = a.updated_at
          vb = b.updated_at
        }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [members, search, statusFilter, householdFilter, sortKey, sortDir, addressMap, userMap, isMinistering, currentUser?.id])

  useEffect(() => {
    console.log('[Members] filtered count:', filtered.length)
  }, [filtered])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="ml-1 inline h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? (
      <ChevronUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 inline h-3 w-3" />
    )
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Loading members…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} of {members.length} members</p>
        </div>
        {userCanEdit && (
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setDialogOpen(true) }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or assigned person…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as MemberStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="moved_out">Moved Out</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
        <Select value={householdFilter} onValueChange={setHouseholdFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Household" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Households</SelectItem>
            {households.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('name')}
              >
                Name <SortIcon col="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('address')}
              >
                Address <SortIcon col="address" />
              </TableHead>
              <TableHead>Assigned Person</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('status')}
              >
                Status <SortIcon col="status" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('updated_at')}
              >
                Last Updated <SortIcon col="updated_at" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No members match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/members/${m.id}`)}
                >
                  <TableCell className="font-medium">
                    {m.last_name}, {m.first_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.address ?? addressMap[m.household_id] ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{m.assigned_to ? (userMap[m.assigned_to] ?? m.assigned_to) : '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(m.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No members match your filters.</p>
        ) : (
          filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => navigate(`/members/${m.id}`)}
              className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent/50"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {m.last_name}, {m.first_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.address ?? addressMap[m.household_id] ?? '—'} · {m.assigned_to ? (userMap[m.assigned_to] ?? m.assigned_to) : 'Unassigned'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(m.updated_at)}</p>
              </div>
              <StatusBadge status={m.status} />
            </button>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="First"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Last"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as MemberStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="moved_out">Moved Out</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address_street1">Street Address</Label>
              <Input
                id="address_street1"
                value={form.address_street1}
                onChange={(e) => setForm((f) => ({ ...f, address_street1: e.target.value }))}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address_city">City</Label>
              <Input
                id="address_city"
                value={form.address_city}
                onChange={(e) => setForm((f) => ({ ...f, address_city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="assigned_to">Assigned Person</Label>
              <Input
                id="assigned_to"
                value={form.assigned_to}
                onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                placeholder="Name of assigned person"
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={saving}>
              {saving ? 'Adding…' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
