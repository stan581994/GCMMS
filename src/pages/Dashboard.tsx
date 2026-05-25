import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { getUserById } from '@/data/mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { ClerkTaskList } from '@/components/ClerkTaskList'
import { Users, UserCheck, LogOut, ArrowRightLeft, HelpCircle } from 'lucide-react'
import type { MemberStatus } from '@/types'

const STATUS_ICONS: Record<MemberStatus, React.ReactNode> = {
  active: <UserCheck className="h-5 w-5 text-green-600" />,
  moved_out: <LogOut className="h-5 w-5 text-orange-600" />,
  transferred: <ArrowRightLeft className="h-5 w-5 text-blue-600" />,
  unknown: <HelpCircle className="h-5 w-5 text-gray-500" />,
}

export function Dashboard() {
  const { members, clerkTasks, completeTask } = useData()
  const { currentUser } = useAuth()

  const counts = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    moved_out: members.filter((m) => m.status === 'moved_out').length,
    transferred: members.filter((m) => m.status === 'transferred').length,
    unknown: members.filter((m) => m.status === 'unknown').length,
  }

  const recentUpdates = [...members]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
        <Card>
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
          <Card key={s}>
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
        <CardContent className="space-y-3 p-0">
          {recentUpdates.map((m) => {
            const editor = getUserById(m.updated_by)
            return (
              <div
                key={m.id}
                className="flex items-center justify-between border-b px-6 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {m.last_name}, {m.first_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Updated by {editor?.full_name ?? 'Unknown'} · {formatDate(m.updated_at)}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
