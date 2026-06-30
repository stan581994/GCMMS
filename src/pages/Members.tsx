import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { canEdit } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Search, ChevronUp, ChevronDown, UserPlus, Users, CheckSquare, X } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { MemberStatus } from '@/types'

type SortKey = 'name' | 'address' | 'status' | 'updated_at'
type SortDir = 'asc' | 'desc'

const EMPTY_FORM = { first_name: '', last_name: '', status: 'active' as MemberStatus, address_street1: '', address_city: '', assigned_to: '' }

export function Members() {
  usePageTitle('Members')
  const { members, households, users, loading, addMember, updateMember } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const userCanEdit = currentUser ? canEdit(currentUser.role) : false
  const isMinistering = currentUser?.role === 'ministering'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [householdFilter, setHouseholdFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAssignTo, setBulkAssignTo] = useState<string>('none')

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
      toast.success('Member added successfully')
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
        const address = (m.address ?? addressMap[m.household_id] ?? '').toLowerCase()
        const matchSearch =
          !q ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
          assignedName.toLowerCase().includes(q) ||
          address.includes(q)
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

  const exitBulkMode = () => {
    setBulkMode(false)
    setSelectedIds(new Set())
    setBulkAssignTo('none')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)))
    }
  }

  const handleBulkAssign = () => {
    if (selectedIds.size === 0) return
    const assignTo = bulkAssignTo === 'none' ? null : bulkAssignTo
    selectedIds.forEach((id) => updateMember(id, { assigned_to: assignTo }))
    const name = assignTo ? (userMap[assignTo] ?? assignTo) : 'Unassigned'
    toast.success(`${selectedIds.size} member(s) assigned to ${name}`)
    exitBulkMode()
  }

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
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
        <div className="hidden rounded-md border md:block">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} of {members.length} members</p>
        </div>
        {userCanEdit && (
          <div className="flex gap-2">
            {!bulkMode && (
              <Button size="sm" variant="outline" onClick={() => setBulkMode(true)}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Bulk Assign
              </Button>
            )}
            <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setDialogOpen(true) }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Bulk assign toolbar */}
      {bulkMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Select value={bulkAssignTo} onValueChange={setBulkAssignTo}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Assign to…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {users
                  .filter((u) => u.role === 'ministering' && u.is_active)
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleBulkAssign}
              disabled={selectedIds.size === 0}
            >
              Assign
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={exitBulkMode}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, address, or assigned person…"
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
              {bulkMode && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
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
                <TableCell colSpan={bulkMode ? 6 : 5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium">No members match your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className={bulkMode ? 'cursor-default' : 'cursor-pointer'}
                  onClick={() => { if (!bulkMode) navigate(`/members/${m.id}`) }}
                  data-selected={bulkMode && selectedIds.has(m.id) ? 'true' : undefined}
                >
                  {bulkMode && (
                    <TableCell onClick={(e) => { e.stopPropagation(); toggleSelect(m.id) }}>
                      <Checkbox
                        checked={selectedIds.has(m.id)}
                        onCheckedChange={() => toggleSelect(m.id)}
                        aria-label={`Select ${m.first_name} ${m.last_name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell
                    className="font-medium"
                    onClick={() => { if (bulkMode) toggleSelect(m.id) }}
                  >
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
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Users className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">No members match your filters</p>
          </div>
        ) : (
          filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => bulkMode ? toggleSelect(m.id) : navigate(`/members/${m.id}`)}
              className={`flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent/50 ${bulkMode && selectedIds.has(m.id) ? 'ring-2 ring-primary' : ''}`}
            >
              {bulkMode && (
                <Checkbox
                  checked={selectedIds.has(m.id)}
                  onCheckedChange={() => toggleSelect(m.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${m.first_name} ${m.last_name}`}
                />
              )}
              <div className="min-w-0 flex-1">
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
              <Select
                value={form.assigned_to || 'none'}
                onValueChange={(v) => setForm((f) => ({ ...f, assigned_to: v === 'none' ? '' : v }))}
              >
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Select a ministering worker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Unassigned —</SelectItem>
                  {users
                    .filter((u) => u.role === 'ministering' && u.is_active)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
