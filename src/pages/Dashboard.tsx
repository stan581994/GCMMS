import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClerkTaskList } from '@/components/ClerkTaskList'
import { Users, UserCheck, LogOut, ArrowRightLeft, HelpCircle } from 'lucide-react'
import type { MemberStatus } from '@/types'

const STATUS_ICONS: Record<MemberStatus, React.ReactNode> = {
  active: <UserCheck className="h-5 w-5 text-green-600" />,
  moved_out: <LogOut className="h-5 w-5 text-amber-500" />,
  transferred: <ArrowRightLeft className="h-5 w-5 text-blue-600" />,
  unknown: <HelpCircle className="h-5 w-5 text-gray-500" />,
}

const STATUS_BORDER: Record<MemberStatus, string> = {
  active: 'border-t-2 border-t-green-500',
  moved_out: 'border-t-2 border-t-amber-400',
  transferred: 'border-t-2 border-t-blue-400',
  unknown: 'border-t-2 border-t-slate-400',
}

export function Dashboard() {
  const { members, clerkTasks, activityLog, completeTask } = useData()
  const { currentUser } = useAuth()

  const counts = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    moved_out: members.filter((m) => m.status === 'moved_out').length,
    transferred: members.filter((m) => m.status === 'transferred').length,
    unknown: members.filter((m) => m.status === 'unknown').length,
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (currentUser?.role === 'clerk') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser.full_name}
          </p>
        </div>
        <ClerkTaskList
          tasks={clerkTasks}
          onComplete={async (taskId) => { await completeTask(taskId) }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, {currentUser?.full_name ?? 'User'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-t-2 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{counts.total}</p>
            <p className="text-xs text-muted-foreground">members</p>
          </CardContent>
        </Card>

        {(['active', 'moved_out', 'transferred', 'unknown'] as MemberStatus[]).map((s) => (
          <Card key={s} className={STATUS_BORDER[s]}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium capitalize text-muted-foreground">
                {s.replace('_', ' ')}
              </CardTitle>
              {STATUS_ICONS[s]}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts[s]}</p>
              <p className="text-xs text-muted-foreground">members</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Updates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activityLog.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            activityLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between border-b px-6 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.performed_by_name} · {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                  </p>
                </div>
                <span className="ml-3 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {entry.action}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
