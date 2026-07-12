import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Menu, LogOut, KeyRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  account_specialist: 'Specialist',
  clerk: 'Clerk',
  ministering: 'Ministering',
  secretary: 'Secretary',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Layout() {
  const { currentUser, logout, changePassword } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePwOpenChange = (open: boolean) => {
    setPwOpen(open)
    if (!open) { setNewPw(''); setConfirmPw(''); setPwError('') }
  }

  const handleChangePassword = async () => {
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwError('')
    setPwLoading(true)
    const ok = await changePassword(newPw)
    setPwLoading(false)
    if (!ok) { setPwError('Failed to update password. Please try again.'); return }
    handlePwOpenChange(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <span className="text-sm font-semibold lg:hidden">Member Records</span>

          <div className="ml-auto flex items-center gap-3">
            {currentUser && (
              <>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {currentUser.full_name}
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {roleLabels[currentUser.role]}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => setPwOpen(true)} title="Change password">
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {initials(currentUser.full_name)}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" />

      {/* Change Password dialog */}
      <Dialog open={pwOpen} onOpenChange={handlePwOpenChange}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePwOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={!newPw || !confirmPw || pwLoading}>
              {pwLoading ? 'Saving…' : 'Save Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
