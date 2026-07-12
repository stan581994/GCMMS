import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { UserPlus, Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'
import { sendWelcomeEmail } from '@/lib/emailService'
import type { AppUser, UserRole } from '@/types'

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  account_specialist: 'Account Specialist',
  clerk: 'Clerk',
  ministering: 'Ministering',
  secretary: 'Secretary',
}

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  account_specialist: 'bg-blue-100 text-blue-800 border-blue-200',
  clerk: 'bg-teal-100 text-teal-800 border-teal-200',
  ministering: 'bg-amber-100 text-amber-800 border-amber-200',
  secretary: 'bg-rose-100 text-rose-800 border-rose-200',
}

const addableRoles: { value: UserRole; label: string }[] = [
  { value: 'account_specialist', label: 'Account Specialist' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'ministering', label: 'Ministering' },
  { value: 'secretary', label: 'Secretary' },
]

export function UserManagement() {
  usePageTitle('User Management')
  const { users, loading, addUser, updateUser, deleteUser } = useData()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const [inviteOpen, setInviteOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('GCMembers')
  const [newRole, setNewRole] = useState<UserRole>('clerk')
  const [inviteError, setInviteError] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    setDeleteLoading(true)
    const name = deleteTarget.full_name
    const { error } = await deleteUser(deleteTarget.id)
    setDeleteLoading(false)
    if (error) {
      setDeleteError(error)
      return
    }
    setDeleteTarget(null)
    toast.success(`${name} was deleted`)
  }

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) { setDeleteTarget(null); setDeleteError('') }
  }

  const handleInvite = async () => {
    if (!newName || !newEmail) return
    setInviteError('')
    setInviteLoading(true)
    const { error, userId } = await addUser(newName, newEmail, newPassword, newRole)
    setInviteLoading(false)
    if (error) {
      setInviteError(error)
      return
    }
    if (userId) {
      sendWelcomeEmail({ userId, email: newEmail, fullName: newName, role: newRole })
    }
    setInviteOpen(false)
    setNewName('')
    setNewEmail('')
    setNewPassword('GCMembers')
    setNewRole('clerk')
    toast.success('User added — a welcome email has been sent')
  }

  const handleInviteOpenChange = (open: boolean) => {
    setInviteOpen(open)
    if (!open) { setInviteError(''); setNewPassword('GCMembers') }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="hidden rounded-md border md:block">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserCog className="h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium">No users yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(v) => updateUser(u.id, { role: v as UserRole })}
                  >
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={u.is_active ? 'border-green-200 bg-green-100 text-green-800' : 'border-gray-200 bg-gray-100 text-gray-500'}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <UserCog className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">No users yet</p>
          </div>
        ) : users.map((u) => (
          <div key={u.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{u.full_name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge
                variant="outline"
                className={roleBadgeClass[u.role]}
              >
                {roleLabels[u.role]}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Select
                value={u.role}
                onValueChange={(v) => updateUser(u.id, { role: v as UserRole })}
              >
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30"
                onClick={() => setDeleteTarget(u)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.full_name}</span>?
              This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDeleteOpenChange(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={handleInviteOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                placeholder="Maria Santos"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="maria@gcw.org"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary Password</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {addableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {inviteError && (
              <p className="text-sm text-destructive">{inviteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleInviteOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!newName || !newEmail || !newPassword || inviteLoading}>
              {inviteLoading ? 'Adding…' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
