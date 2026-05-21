import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
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
import { Search, ChevronUp, ChevronDown } from 'lucide-react'
import type { MemberStatus } from '@/types'

type SortKey = 'name' | 'address' | 'status' | 'updated_at'
type SortDir = 'asc' | 'desc'

export function Members() {
  const { members, households } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [householdFilter, setHouseholdFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const addressMap = useMemo(
    () => Object.fromEntries(households.map((h) => [h.id, h.address])),
    [households]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members
      .filter((m) => {
        const matchSearch =
          !q ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
          (m.assigned_to ?? '').toLowerCase().includes(q)
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
          va = addressMap[a.household_id] ?? ''
          vb = addressMap[b.household_id] ?? ''
        } else if (sortKey === 'status') {
          va = a.status
          vb = b.status
        } else {
          va = a.updated_at
          vb = b.updated_at
        }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [members, search, statusFilter, householdFilter, sortKey, sortDir, addressMap])

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Members</h2>
        <p className="text-sm text-muted-foreground">{filtered.length} of {members.length} members</p>
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
            <SelectItem value="all">All Statuses</SelectItem>
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
                    {m.first_name} {m.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{addressMap[m.household_id] ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{m.assigned_to ?? '—'}</TableCell>
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
                  {m.first_name} {m.last_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {addressMap[m.household_id] ?? '—'} · {m.assigned_to ?? 'Unassigned'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(m.updated_at)}</p>
              </div>
              <StatusBadge status={m.status} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
