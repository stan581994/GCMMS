import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, UserPlus, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'

export function PendingAccounts() {
  usePageTitle('Pending Accounts')
  const { members, loading, setPendingAccount } = useData()
  const { currentUser } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')

  const role = currentUser?.role
  const allowed = role && (isAdmin(role) || role === 'account_specialist')

  const pendingMembers = useMemo(
    () => (allowed ? members.filter((m) => m.pending_account === true) : []),
    [allowed, members]
  )

  const availableMembers = useMemo(() => {
    if (!allowed) return []
    const q = search.toLowerCase()
    return members
      .filter((m) => !m.pending_account)
      .filter(
        (m) =>
          !q ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
          `${m.last_name} ${m.first_name}`.toLowerCase().includes(q)
      )
      .sort((a, b) => a.last_name.localeCompare(b.last_name))
  }, [allowed, members, search])

  if (!currentUser) return null
  if (!allowed) return <Navigate to={role === 'clerk' ? '/dashboard' : '/members'} replace />

  const handleAddMember = (memberId: string) => {
    setPendingAccount(memberId, true)
    setDialogOpen(false)
    setSearch('')
  }

  const handleAccountCreated = (memberId: string, memberName: string) => {
    setPendingAccount(memberId, false)
    toast.success(`Account marked as created for ${memberName}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="hidden rounded-md border md:block">
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Pending Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Members flagged as needing a LDS Account.
          </p>
        </div>
        {isAdmin(role) && (
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Address</TableHead>
              {!isAdmin(role) && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin(role) ? 3 : 4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Clock className="h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium">No pending accounts</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pendingMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.last_name}, {m.first_name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.address ?? '—'}</TableCell>
                  {!isAdmin(role) && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccountCreated(m.id, `${m.last_name}, ${m.first_name}`)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Account Created
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {pendingMembers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Clock className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">No pending accounts</p>
          </div>
        ) : (
          pendingMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {m.last_name}, {m.first_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.address ?? '—'}</p>
                <div className="mt-1">
                  <StatusBadge status={m.status} />
                </div>
              </div>
              {!isAdmin(role) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-3 shrink-0"
                  onClick={() => handleAccountCreated(m.id, `${m.last_name}, ${m.first_name}`)}
                >
                  <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                  Done
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Member Dialog (admin only) */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSearch('') }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to Pending</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-md border">
              {availableMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No members found.</p>
              ) : (
                availableMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleAddMember(m.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent/50 border-b last:border-b-0"
                  >
                    <span className="font-medium">
                      {m.last_name}, {m.first_name}
                    </span>
                    <StatusBadge status={m.status} />
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
