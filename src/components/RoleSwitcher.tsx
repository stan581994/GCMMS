import { useAuth } from '@/context/AuthContext'
import { mockUsers } from '@/data/mock'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  account_specialist: 'Account Specialist',
  clerk: 'Clerk',
  ministering: 'Ministering',
}

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuth()

  return (
    <div className="px-3 py-2">
      <p className="mb-1 text-xs font-medium text-muted-foreground">Dev: Switch Role</p>
      <Select value={currentUser?.id ?? ''} onValueChange={switchRole}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {mockUsers.map((u) => (
            <SelectItem key={u.id} value={u.id} className="text-xs">
              {roleLabels[u.role]} — {u.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
