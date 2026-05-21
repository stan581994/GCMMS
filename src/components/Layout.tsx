import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  account_specialist: 'Specialist',
  clerk: 'Clerk',
  ministering: 'Ministering',
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
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col">
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
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
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
    </div>
  )
}
