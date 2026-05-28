import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockMembers, mockHouseholds } from '@/data/mock'
import type { Member, Household, AppUser, MemberStatus, UserRole, Calling, ClerkTask } from '@/types'
import { supabase } from '@/lib/supabase'

interface DbMember {
  id: number
  preferred_name: string
  address_street1: string | null
  address_street2: string | null
  address_city: string | null
  status: 'Active' | 'Unknown' | 'Transferred' | 'Moved Out' | null
  new_address: string | null
  assigned_person: string | null
  created_at: string
  updated_at: string | null
}

const STATUS_MAP: Record<string, MemberStatus> = {
  Active: 'active',
  'Moved Out': 'moved_out',
  Transferred: 'transferred',
  Unknown: 'unknown',
}

const REVERSE_STATUS_MAP: Record<MemberStatus, string> = {
  active: 'Active',
  moved_out: 'Moved Out',
  transferred: 'Transferred',
  unknown: 'Unknown',
}

function mapDbMember(row: DbMember): Member {
  const commaIdx = row.preferred_name.indexOf(',')
  const last_name = commaIdx >= 0 ? row.preferred_name.slice(0, commaIdx).trim() : row.preferred_name
  const first_name = commaIdx >= 0 ? row.preferred_name.slice(commaIdx + 1).trim() : ''

  const addressParts = [row.address_street1, row.address_street2, row.address_city].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(', ') : undefined

  return {
    id: String(row.id),
    household_id: '',
    first_name,
    last_name,
    address,
    phone: null,
    email: null,
    status: (row.status ? STATUS_MAP[row.status] : undefined) ?? 'unknown',
    notes: '',
    new_address: row.new_address ?? null,
    assigned_to: row.assigned_person ?? null,
    updated_by: '',
    updated_at: row.updated_at ?? row.created_at,
    created_at: row.created_at,
  }
}

function mapDbCalling(row: Record<string, unknown>): Calling {
  return {
    ...(row as Omit<Calling, 'id' | 'member_id'>),
    id: String(row.id),
    member_id: String(row.member_id),
  }
}

function mapDbClerkTask(row: Record<string, unknown>): ClerkTask {
  return {
    ...(row as Omit<ClerkTask, 'id' | 'calling_id'>),
    id: String(row.id),
    calling_id: String(row.calling_id),
  }
}

interface AssignCallingInput {
  member_id: string
  position: string
  sustained_date: string | null
  is_set_apart: boolean
}

interface ReleaseCallingInput {
  calling_id: string
  released_date: string
}

interface DataContextType {
  members: Member[]
  households: Household[]
  users: AppUser[]
  callings: Calling[]
  clerkTasks: ClerkTask[]
  loading: boolean
  updateMember: (id: string, updates: Partial<Member>) => void
  updateHousehold: (id: string, updates: Partial<Household>) => void
  updateUser: (id: string, updates: Partial<AppUser>) => void
  addUser: (name: string, email: string, password: string, role: UserRole) => Promise<{ error: string | null }>
  deleteUser: (id: string) => Promise<{ error: string | null }>
  assignCalling: (input: AssignCallingInput) => Promise<{ error: string | null }>
  releaseCalling: (input: ReleaseCallingInput) => Promise<{ error: string | null }>
  completeTask: (taskId: string) => Promise<{ error: string | null }>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds)
  const [users, setUsers] = useState<AppUser[]>([])
  const [callings, setCallings] = useState<Calling[]>([])
  const [clerkTasks, setClerkTasks] = useState<ClerkTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function fetchAll() {
      setLoading(true)
      const fetchMembers = supabase
        .from('members')
        .select('*', { count: 'exact' })
        .order('preferred_name')
        .then(({ data, error }) => {
          if (error) {
            console.error('[DataContext] Members fetch error:', error)
          } else if (data) {
            setMembers((data as DbMember[]).map(mapDbMember))
          }
        })

      const fetchUsers = supabase
        .from('app_users')
        .select('*')
        .order('full_name')
        .then(({ data, error }) => {
          if (error) {
            console.error('[DataContext] app_users fetch error:', error)
          } else if (data) {
            setUsers(data as AppUser[])
          }
        })

      const fetchCallings = supabase
        .from('callings')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('[DataContext] callings fetch error:', error)
          else if (data) setCallings((data as Record<string, unknown>[]).map(mapDbCalling))
        })

      const fetchClerkTasks = supabase
        .from('clerk_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('[DataContext] clerk_tasks fetch error:', error)
          else if (data) setClerkTasks((data as Record<string, unknown>[]).map(mapDbClerkTask))
        })

      Promise.all([fetchMembers, fetchUsers, fetchCallings, fetchClerkTasks]).finally(() => setLoading(false))
    }

    fetchAll()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') fetchAll()
      if (event === 'SIGNED_OUT') { setMembers(mockMembers); setUsers([]); setCallings([]); setClerkTasks([]) }
    })

    const taskChannel = supabase
      .channel('clerk_tasks_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clerk_tasks' },
        (payload) => {
          const updated = mapDbClerkTask(payload.new as Record<string, unknown>)
          setClerkTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(taskChannel)
    }
  }, [])

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    )

    const current = members.find((m) => m.id === id)
    if (!current) return
    const merged = { ...current, ...updates }

    supabase
      .from('members')
      .update({
        preferred_name: `${merged.last_name}, ${merged.first_name}`,
        status: REVERSE_STATUS_MAP[merged.status],
        assigned_person: merged.assigned_to ?? null,
        new_address: merged.new_address ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(id))
      .then(({ error }) => {
        if (error) console.error('[DataContext] updateMember error:', error)
      })
  }

  const updateHousehold = (id: string, updates: Partial<Household>) =>
    setHouseholds((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))

  const updateUser = (id: string, updates: Partial<AppUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))

  const addUser = async (name: string, email: string, password: string, role: UserRole): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.rpc('create_managed_user', {
      p_email: email,
      p_password: password,
      p_full_name: name,
      p_role: role,
    })
    if (error) return { error: error.message }

    const created = data as { id: string; email: string }
    setUsers((prev) => [
      ...prev,
      { id: created.id, full_name: name, email, role, is_active: true, created_at: new Date().toISOString() },
    ])
    return { error: null }
  }

  const deleteUser = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.rpc('delete_managed_user', { p_user_id: id })
    if (error) return { error: error.message }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    return { error: null }
  }

  const assignCalling = async (input: AssignCallingInput): Promise<{ error: string | null }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: callingData, error: callingErr } = await supabase
      .from('callings')
      .insert({
        member_id: Number(input.member_id),
        position: input.position,
        sustained_date: input.sustained_date ?? null,
        is_set_apart: input.is_set_apart,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single()

    if (callingErr || !callingData) return { error: callingErr?.message ?? 'Failed to assign calling' }

    const member = members.find((m) => m.id === input.member_id)
    const memberName = member ? `${member.last_name}, ${member.first_name}` : `Member #${input.member_id}`
    const sustainedStr = input.sustained_date ?? 'TBD'
    const description = `Record calling: ${memberName} — ${input.position}, sustained ${sustainedStr}`

    const { data: taskData, error: taskErr } = await supabase
      .from('clerk_tasks')
      .insert({
        calling_id: callingData.id,
        task_type: 'calling_assigned',
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (taskErr) return { error: taskErr.message }

    setCallings((prev) => [mapDbCalling(callingData as Record<string, unknown>), ...prev])
    if (taskData) setClerkTasks((prev) => [mapDbClerkTask(taskData as Record<string, unknown>), ...prev])

    return { error: null }
  }

  const releaseCalling = async (input: ReleaseCallingInput): Promise<{ error: string | null }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const now = new Date().toISOString()
    const { error: updateErr } = await supabase
      .from('callings')
      .update({ status: 'released', released_date: input.released_date, updated_at: now })
      .eq('id', Number(input.calling_id))

    if (updateErr) return { error: updateErr.message }

    const calling = callings.find((c) => c.id === input.calling_id)
    const member = calling ? members.find((m) => m.id === calling.member_id) : null
    const memberName = member
      ? `${member.last_name}, ${member.first_name}`
      : `Member #${calling?.member_id}`
    const description = `Record release: ${memberName} — ${calling?.position ?? 'calling'}, released ${input.released_date}`

    const { data: taskData, error: taskErr } = await supabase
      .from('clerk_tasks')
      .insert({
        calling_id: Number(input.calling_id),
        task_type: 'calling_released',
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (taskErr) return { error: taskErr.message }

    setCallings((prev) =>
      prev.map((c) =>
        c.id === input.calling_id
          ? { ...c, status: 'released', released_date: input.released_date, updated_at: now }
          : c
      )
    )
    if (taskData) setClerkTasks((prev) => [mapDbClerkTask(taskData as Record<string, unknown>), ...prev])

    return { error: null }
  }

  const completeTask = async (taskId: string): Promise<{ error: string | null }> => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('clerk_tasks')
      .update({ is_complete: true, completed_at: now })
      .eq('id', Number(taskId))

    if (error) return { error: error.message }

    setClerkTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_complete: true, completed_at: now } : t))
    )
    return { error: null }
  }

  return (
    <DataContext.Provider
      value={{
        members, households, users, callings, clerkTasks, loading,
        updateMember, updateHousehold, updateUser, addUser, deleteUser,
        assignCalling, releaseCalling, completeTask,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
