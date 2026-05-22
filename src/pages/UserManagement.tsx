import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
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
import { UserPlus } from 'lucide-react'
import type { UserRole } from '@/types'

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  account_specialist: 'Account Specialist',
  clerk: 'Clerk',
  ministering: 'Ministering',
}

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  account_specialist: 'bg-blue-100 text-blue-800 border-blue-200',
  clerk: 'bg-teal-100 text-teal-800 border-teal-200',
  ministering: 'bg-amber-100 text-amber-800 border-amber-200',
}

const addableRoles: { value: UserRole; label: string }[] = [
  { value: 'clerk', label: 'Clerk' },
  { value: 'ministering', label: 'Ministering' },
]

export function UserManagement() {
  const { users, addUser, updateUser } = useData()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const [inviteOpen, setInviteOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('GCMembers')
  const [newRole, setNewRole] = useState<UserRole>('clerk')
  const [inviteError, setInviteError] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const handleInvite = async () => {
    if (!newName || !newEmail) return
    setInviteError('')
    setInviteLoading(true)
    const { error } = await addUser(newName, newEmail, newPassword, newRole)
    setInviteLoading(false)
    if (error) {
      setInviteError(error)
      return
    }
    setInviteOpen(false)
    setNewName('')
    setNewEmail('')
    setNewPassword('GCMembers')
    setNewRole('clerk')
  }

  const handleInviteOpenChange = (open: boolean) => {
    setInviteOpen(open)
    if (!open) { setInviteError(''); setNewPassword('GCMembers') }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-4">
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
            {users.map((u) => (
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
                    className={u.is_active ? 'text-destructive hover:text-destructive' : ''}
                    onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                  >
                    {u.is_active ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
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
                variant={u.is_active ? 'outline' : 'secondary'}
                size="sm"
                className={u.is_active ? 'text-destructive border-destructive/30' : ''}
                onClick={() => updateUser(u.id, { is_active: !u.is_active })}
              >
                {u.is_active ? 'Deactivate' : 'Reactivate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

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
