import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { canEdit } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

export function HouseholdDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { households, members, updateHousehold } = useData()
  const { currentUser } = useAuth()

  const household = households.find((h) => h.id === id)
  const householdMembers = members.filter((m) => m.household_id === id)

  const [name, setName] = useState(household?.name ?? '')
  const [address, setAddress] = useState(household?.address ?? '')
  const [saved, setSaved] = useState(false)

  if (!household) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Household not found.{' '}
        <button className="underline" onClick={() => navigate('/households')}>
          Go back
        </button>
      </div>
    )
  }

  const fullEdit = canEdit(currentUser?.role ?? 'ministering')

  const handleSave = () => {
    if (!fullEdit) return
    updateHousehold(household.id, { name, address })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/households')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{household.name}</h2>
          <p className="text-sm text-muted-foreground">{householdMembers.length} members</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Household Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Household Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!fullEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!fullEdit}
            />
          </div>
          {fullEdit && (
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {householdMembers.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">No members in this household.</p>
          ) : (
            householdMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/members/${m.id}`)}
                className="flex w-full items-center justify-between px-6 py-3 hover:bg-accent/50"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {m.first_name} {m.last_name}
                  </p>
                  {m.phone && (
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  )}
                </div>
                <StatusBadge status={m.status} />
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
