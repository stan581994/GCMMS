import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { canEdit, canEditStatusOnly } from '@/lib/auth'
import { getUserById } from '@/data/mock'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import type { MemberStatus } from '@/types'

export function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateMember, members, households } = useData()
  const { currentUser } = useAuth()

  const member = members.find((m) => m.id === id)
  const household = member ? households.find((h) => h.id === member.household_id) : undefined
  const householdMembers = member
    ? members.filter((m) => m.household_id === member.household_id && m.id !== id)
    : []
  const lastEditor = member ? getUserById(member.updated_by) : undefined

  const [status, setStatus] = useState<MemberStatus>(member?.status ?? 'unknown')
  const [notes, setNotes] = useState(member?.notes ?? '')
  const [firstName, setFirstName] = useState(member?.first_name ?? '')
  const [lastName, setLastName] = useState(member?.last_name ?? '')
  const [saved, setSaved] = useState(false)

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
    const updates = statusOnlyEdit
      ? { status, notes, updated_by: currentUser.id }
      : { status, notes, first_name: firstName, last_name: lastName, updated_by: currentUser.id }
    updateMember(member.id, updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">
            {member.first_name} {member.last_name}
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
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!editable}
              rows={3}
              placeholder="Add notes about this member…"
            />
          </div>

          {editable && (
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Audit info */}
      <p className="text-xs text-muted-foreground">
        Last updated {formatDate(member.updated_at)} by {lastEditor?.full_name ?? 'Unknown'}
      </p>

      {/* Household members */}
      {householdMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other Household Members</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {householdMembers.map((hm) => (
              <button
                key={hm.id}
                onClick={() => navigate(`/members/${hm.id}`)}
                className="flex w-full items-center justify-between px-6 py-3 hover:bg-accent/50"
              >
                <span className="text-sm font-medium">
                  {hm.first_name} {hm.last_name}
                </span>
                <StatusBadge status={hm.status} />
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
