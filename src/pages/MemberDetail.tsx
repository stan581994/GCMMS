import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { canEdit, canEditStatusOnly } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { MemberStatus } from '@/types'

export function MemberDetail() {
  usePageTitle('Member Detail')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateMember, members, households, users } = useData()
  const { currentUser } = useAuth()

  const member = members.find((m) => m.id === id)
  const household = member ? households.find((h) => h.id === member.household_id) : undefined

  const [status, setStatus] = useState<MemberStatus>(member?.status ?? 'unknown')
  const [firstName, setFirstName] = useState(member?.first_name ?? '')
  const [lastName, setLastName] = useState(member?.last_name ?? '')
  const [assignedTo, setAssignedTo] = useState<string>(member?.assigned_to ?? '__unassigned__')
  const [action, setAction] = useState<string>(member?.new_address ? 'update_address' : 'none')
  const [newAddress, setNewAddress] = useState(member?.new_address ?? '')
  const ministeringUsers = users.filter((u) => u.role === 'ministering')

  if (!member) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Member not found.{' '}
        <button className="underline" onClick={() => navigate('/members')}>
          Go back
        </button>
      </div>
    )
  }

  const role = currentUser?.role ?? 'ministering'
  const fullEdit = canEdit(role)
  const statusOnlyEdit = canEditStatusOnly(role)
  const editable = fullEdit || statusOnlyEdit

  const handleSave = () => {
    if (!editable || !currentUser) return
    const assigned_to = assignedTo === '__unassigned__' ? null : assignedTo
    const new_address = action === 'update_address' ? (newAddress || null) : null
    const updates = statusOnlyEdit
      ? { status, new_address, updated_by: currentUser.id }
      : { status, new_address, first_name: firstName, last_name: lastName, assigned_to, updated_by: currentUser.id }
    updateMember(member.id, updates)
    toast.success('Member details saved')
  }

  const lastEditor = member.updated_by ? users.find((u) => u.id === member.updated_by) : undefined

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="animate-in fade-in-0 duration-300 mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">
            {member.last_name}, {member.first_name}
          </h2>
          <p className="text-sm text-muted-foreground">{household?.name}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Member Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!fullEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!fullEdit}
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as MemberStatus)}
              disabled={!editable}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="moved_out">Moved Out</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Current Address</Label>
            <p className="text-sm min-h-[2.25rem] rounded-md border border-input bg-muted px-3 py-2 text-muted-foreground">
              {member.address || <span className="italic">No address on record</span>}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Address Action</Label>
            <Select
              value={action}
              onValueChange={setAction}
              disabled={!editable}
            >
              <SelectTrigger>
                <SelectValue placeholder="— No action —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No action —</SelectItem>
                <SelectItem value="update_address">Update Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>New Address</Label>
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              disabled={!editable || action !== 'update_address'}
              placeholder="Enter new address…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Assigned to Person</Label>
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
              disabled={!fullEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a person…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unassigned__">Unassigned</SelectItem>
                {ministeringUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editable && (
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Audit info */}
      <p className="text-xs text-muted-foreground">
        Last updated {formatDate(member.updated_at)} at {formatTime(member.updated_at)} by {lastEditor?.full_name ?? 'Unknown'}
      </p>
    </div>
  )
}
