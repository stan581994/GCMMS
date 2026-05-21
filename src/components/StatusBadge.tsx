import type { MemberStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const labels: Record<MemberStatus, string> = {
  active: 'Active',
  moved_out: 'Moved Out',
  transferred: 'Transferred',
  unknown: 'Unknown',
}

const styles: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  moved_out: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
  transferred: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  unknown: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
}

export function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant="outline" className={cn(styles[status])}>
      {labels[status]}
    </Badge>
  )
}
