import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Clock, BookOpen, Baby, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { isAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onClose?: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  )

function PendingBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      {count}
    </span>
  )
}

export function Sidebar({ onClose }: SidebarProps) {
  const { currentUser } = useAuth()
  const { clerkTasks, childRecordTasks, members } = useData()
  const isClerk = currentUser?.role === 'clerk'
  const isAccountSpecialist = currentUser?.role === 'account_specialist'
  const admin = currentUser && isAdmin(currentUser.role)

  const pendingCallings = clerkTasks.filter((t) => !t.is_complete).length
  const pendingChildRecords = childRecordTasks.filter((t) => !t.is_complete).length
  const pendingAccounts = members.filter((m) => m.pending_account).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ward
            </p>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Member Records</h1>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-2 py-4">
        {(admin || isClerk) && (
          <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </NavLink>
        )}

        {!isClerk && !isAccountSpecialist && (
          <NavLink to="/members" onClick={onClose} className={navLinkClass}>
            <Users className="h-4 w-4 shrink-0" />
            Members
          </NavLink>
        )}

        {currentUser && (isAdmin(currentUser.role) || isAccountSpecialist) && (
          <NavLink to="/pending-accounts" onClick={onClose} className={navLinkClass}>
            <Clock className="h-4 w-4 shrink-0" />
            Pending Accounts
            {isAccountSpecialist && <PendingBadge count={pendingAccounts} />}
          </NavLink>
        )}

        {/* Admin nav */}
        {admin && (
          <NavLink to="/callings" onClick={onClose} className={navLinkClass}>
            <BookOpen className="h-4 w-4 shrink-0" />
            Callings
          </NavLink>
        )}

        {admin && (
          <NavLink to="/child-records" onClick={onClose} className={navLinkClass}>
            <Baby className="h-4 w-4 shrink-0" />
            Child Records
          </NavLink>
        )}

        {admin && (
          <NavLink to="/users" onClick={onClose} className={navLinkClass}>
            <UserCog className="h-4 w-4 shrink-0" />
            User Management
          </NavLink>
        )}

        {/* Clerk nav */}
        {isClerk && (
          <NavLink to="/clerk/callings" onClick={onClose} className={navLinkClass}>
            <BookOpen className="h-4 w-4 shrink-0" />
            Callings
            <PendingBadge count={pendingCallings} />
          </NavLink>
        )}

        {isClerk && (
          <NavLink to="/clerk/child-records" onClick={onClose} className={navLinkClass}>
            <Baby className="h-4 w-4 shrink-0" />
            Child Records
            <PendingBadge count={pendingChildRecords} />
          </NavLink>
        )}
      </nav>
    </div>
  )
}
