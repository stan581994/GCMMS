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
import { UserPlus } from 'lucide-react'
import type { AppUser, UserRole } from '@/types'

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

export function UserManagement() {
  const { users, updateUser, addUser } = useData()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('ministering')

  const handleInvite = () => {
    if (!newName || !newEmail) return
    const user: AppUser = {
      id: `user-${Date.now()}`,
      full_name: newName,
      email: newEmail,
      role: newRole,
      created_at: new Date().toISOString(),
      is_active: true,
    }
    addUser(user)
    setInviteOpen(false)
    setNewName('')
    setNewEmail('')
    setNewRole('ministering')
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
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
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
                placeholder="maria@ward.org"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!newName || !newEmail}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
