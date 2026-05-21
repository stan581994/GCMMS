import { useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MemberStatus } from '@/types'

const statusLabel: Record<MemberStatus, string> = {
  active: 'Active',
  moved_out: 'Moved',
  transferred: 'Transferred',
  unknown: 'Unknown',
}

export function Households() {
  const { households, members } = useData()
  const navigate = useNavigate()

  const householdStats = households.map((h) => {
    const hMembers = members.filter((m) => m.household_id === h.id)
    const counts = {
      active: hMembers.filter((m) => m.status === 'active').length,
      moved_out: hMembers.filter((m) => m.status === 'moved_out').length,
      transferred: hMembers.filter((m) => m.status === 'transferred').length,
      unknown: hMembers.filter((m) => m.status === 'unknown').length,
    }
    return { ...h, total: hMembers.length, counts }
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Households</h2>
        <p className="text-sm text-muted-foreground">{households.length} households</p>
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Household</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead>Status Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {householdStats.map((h) => (
              <TableRow
                key={h.id}
                className="cursor-pointer"
                onClick={() => navigate(`/households/${h.id}`)}
              >
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell className="text-muted-foreground">{h.address}</TableCell>
                <TableCell className="text-right">{h.total}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {(Object.keys(h.counts) as MemberStatus[])
                      .filter((s) => h.counts[s] > 0)
                      .map((s) => `${h.counts[s]} ${statusLabel[s]}`)
                      .join(' · ')}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {householdStats.map((h) => (
          <button
            key={h.id}
            onClick={() => navigate(`/households/${h.id}`)}
            className="flex w-full items-start justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent/50"
          >
            <div className="min-w-0">
              <p className="font-medium">{h.name}</p>
              <p className="truncate text-xs text-muted-foreground">{h.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(Object.keys(h.counts) as MemberStatus[])
                  .filter((s) => h.counts[s] > 0)
                  .map((s) => `${h.counts[s]} ${statusLabel[s]}`)
                  .join(' · ')}
              </p>
            </div>
            <span className="ml-4 shrink-0 text-sm font-semibold">{h.total}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
