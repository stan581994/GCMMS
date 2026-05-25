import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Clock, BookOpen, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
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

export function Sidebar({ onClose }: SidebarProps) {
  const { currentUser } = useAuth()
  const isClerk = currentUser?.role === 'clerk'
  const admin = currentUser && isAdmin(currentUser.role)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ward
          </p>
          <h1 className="text-lg font-bold leading-tight">Member Records</h1>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-2 py-4">
        <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        {!isClerk && (
          <NavLink to="/members" onClick={onClose} className={navLinkClass}>
            <Users className="h-4 w-4 shrink-0" />
            Members
          </NavLink>
        )}

        {currentUser && (isAdmin(currentUser.role) || currentUser.role === 'clerk') && (
          <NavLink to="/pending-accounts" onClick={onClose} className={navLinkClass}>
            <Clock className="h-4 w-4 shrink-0" />
            Pending Accounts
          </NavLink>
        )}

        {admin && (
          <NavLink to="/callings" onClick={onClose} className={navLinkClass}>
            <BookOpen className="h-4 w-4 shrink-0" />
            Callings
          </NavLink>
        )}

        {admin && (
          <NavLink to="/users" onClick={onClose} className={navLinkClass}>
            <UserCog className="h-4 w-4 shrink-0" />
            User Management
          </NavLink>
        )}
      </nav>

    </div>
  )
}
