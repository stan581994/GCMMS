import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, LogOut, ArrowRightLeft, HelpCircle, CheckCircle2, BookOpen, Baby, Activity } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { MemberStatus, ChildRecordTask } from '@/types'

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
  usePageTitle('Dashboard')
  const { members, clerkTasks, activityLog, childRecordTasks, completeTask } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const counts = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    moved_out: members.filter((m) => m.status === 'moved_out').length,
    transferred: members.filter((m) => m.status === 'transferred').length,
    unknown: members.filter((m) => m.status === 'unknown').length,
  }

  const recentCompletions = [
    ...[...clerkTasks].filter((t) => t.is_complete && t.completed_at),
    ...[...childRecordTasks].filter((t): t is ChildRecordTask & { completed_at: string } => t.is_complete && !!t.completed_at),
  ]
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (currentUser?.role === 'clerk') {
    const pendingCallings = clerkTasks.filter((t) => !t.is_complete).length
    const pendingChildRecords = childRecordTasks.filter((t) => !t.is_complete).length

    return (
      <div className="animate-in fade-in-0 duration-300 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome back, {currentUser.full_name}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button onClick={() => navigate('/clerk/callings')} className="text-left">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Callings</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingCallings}</p>
                <p className="text-xs text-muted-foreground">pending task{pendingCallings !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>
          </button>

          <button onClick={() => navigate('/clerk/child-records')} className="text-left">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Child Records</CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingChildRecords}</p>
                <p className="text-xs text-muted-foreground">pending task{pendingChildRecords !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300 space-y-6">
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
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-muted-foreground">
              <Activity className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No activity yet</p>
            </div>
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

      {/* Clerk Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <CardTitle className="text-base">Clerk Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentCompletions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No tasks completed yet</p>
            </div>
          ) : (
            recentCompletions.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between border-b px-6 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm">{task.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Recorded · {task.completed_at ? formatDate(task.completed_at) : '—'}
                  </p>
                </div>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
