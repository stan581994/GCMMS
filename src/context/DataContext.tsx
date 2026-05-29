import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockMembers, mockHouseholds } from '@/data/mock'
import type { Member, Household, AppUser, MemberStatus, UserRole, Calling, ClerkTask, ActivityLog, ChildRecord, ChildRecordTask } from '@/types'
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

function mapDbChildRecord(row: Record<string, unknown>): ChildRecord {
  return {
    ...(row as Omit<ChildRecord, 'id'>),
    id: String(row.id),
  }
}

function mapDbChildRecordTask(row: Record<string, unknown>): ChildRecordTask {
  return {
    ...(row as Omit<ChildRecordTask, 'id' | 'child_record_id'>),
    id: String(row.id),
    child_record_id: String(row.child_record_id),
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

interface AddMemberInput {
  first_name: string
  last_name: string
  status: MemberStatus
  address_street1?: string
  address_city?: string
  assigned_to?: string | null
}

export interface SubmitChildRecordInput {
  child_name: string
  gender: 'male' | 'female'
  birth_date: string
  place_of_birth: string
  born_in_covenant: boolean
  address: string | null
  father_name: string | null
  father_is_member: boolean
  father_record_or_birthdate: string | null
  mother_maiden_name: string | null
  mother_is_member: boolean
  mother_record_or_birthdate: string | null
  parents_ward_branch: string | null
  parents_unit_number: string | null
  guardian_name: string | null
  guardian_is_member: boolean
  guardian_record_or_birthdate: string | null
  blessing_date: string | null
  blessing_performer_name: string | null
  blessing_priesthood_office: string | null
  blessing_performer_record_or_birthdate: string | null
}

interface DataContextType {
  members: Member[]
  households: Household[]
  users: AppUser[]
  callings: Calling[]
  clerkTasks: ClerkTask[]
  activityLog: ActivityLog[]
  childRecords: ChildRecord[]
  childRecordTasks: ChildRecordTask[]
  loading: boolean
  updateMember: (id: string, updates: Partial<Member>) => void
  updateHousehold: (id: string, updates: Partial<Household>) => void
  updateUser: (id: string, updates: Partial<AppUser>) => void
  addUser: (name: string, email: string, password: string, role: UserRole) => Promise<{ error: string | null }>
  deleteUser: (id: string) => Promise<{ error: string | null }>
  addMember: (input: AddMemberInput) => Promise<{ error: string | null }>
  setPendingAccount: (memberId: string, value: boolean) => void
  assignCalling: (input: AssignCallingInput) => Promise<{ error: string | null }>
  releaseCalling: (input: ReleaseCallingInput) => Promise<{ error: string | null }>
  completeTask: (taskId: string) => Promise<{ error: string | null }>
  submitChildRecord: (input: SubmitChildRecordInput) => Promise<{ error: string | null }>
  completeChildRecordTask: (taskId: string) => Promise<{ error: string | null }>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds)
  const [users, setUsers] = useState<AppUser[]>([])
  const [callings, setCallings] = useState<Calling[]>([])
  const [clerkTasks, setClerkTasks] = useState<ClerkTask[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [childRecords, setChildRecords] = useState<ChildRecord[]>([])
  const [childRecordTasks, setChildRecordTasks] = useState<ChildRecordTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function fetchAll() {
      setLoading(true)
      const fetchMembers = Promise.all([
        supabase.from('members').select('*').order('preferred_name'),
        supabase.from('pending_accounts').select('member_id'),
      ]).then(([membersResult, pendingResult]) => {
        if (membersResult.error) {
          console.error('[DataContext] Members fetch error:', membersResult.error)
        } else if (membersResult.data) {
          const pendingIds = new Set(
            (pendingResult.data ?? []).map((r: { member_id: number }) => String(r.member_id))
          )
          setMembers(
            (membersResult.data as DbMember[]).map((row) => ({
              ...mapDbMember(row),
              pending_account: pendingIds.has(String(row.id)),
            }))
          )
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

      const fetchActivityLog = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (error) console.error('[DataContext] activity_log fetch error:', error)
          else if (data) setActivityLog(data as ActivityLog[])
        })

      const fetchChildRecords = supabase
        .from('child_records')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('[DataContext] child_records fetch error:', error)
          else if (data) setChildRecords((data as Record<string, unknown>[]).map(mapDbChildRecord))
        })

      const fetchChildRecordTasks = supabase
        .from('child_record_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('[DataContext] child_record_tasks fetch error:', error)
          else if (data) setChildRecordTasks((data as Record<string, unknown>[]).map(mapDbChildRecordTask))
        })

      Promise.all([fetchMembers, fetchUsers, fetchCallings, fetchClerkTasks, fetchActivityLog, fetchChildRecords, fetchChildRecordTasks]).finally(() => setLoading(false))
    }

    fetchAll()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') fetchAll()
      if (event === 'SIGNED_OUT') { setMembers(mockMembers); setUsers([]); setCallings([]); setClerkTasks([]); setActivityLog([]); setChildRecords([]); setChildRecordTasks([]) }
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

    const childRecordTaskChannel = supabase
      .channel('child_record_tasks_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'child_record_tasks' },
        (payload) => {
          const updated = mapDbChildRecordTask(payload.new as Record<string, unknown>)
          setChildRecordTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(childRecordTaskChannel)
    }
  }, [])

  const logActivity = async (action: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const appUser = users.find((u) => u.id === user.id)
    const { data, error } = await supabase
      .from('activity_log')
      .insert({ action, description, performed_by: user.id, performed_by_name: appUser?.full_name ?? '' })
      .select()
      .single()
    if (error) { console.error('[DataContext] logActivity error:', error); return }
    if (data) setActivityLog((prev) => [data as ActivityLog, ...prev.slice(0, 49)])
  }

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    )

    const current = members.find((m) => m.id === id)
    if (!current) return
    const merged = { ...current, ...updates }

    const memberName = `${current.last_name}, ${current.first_name}`

    if ('status' in updates && updates.status !== current.status) {
      logActivity('Status Changed', `${memberName}'s status was changed to ${REVERSE_STATUS_MAP[updates.status!]}`)
    }
    if ('assigned_to' in updates && updates.assigned_to !== current.assigned_to) {
      const ministerName = updates.assigned_to
        ? (users.find((u) => u.id === updates.assigned_to)?.full_name ?? updates.assigned_to)
        : 'no one'
      logActivity('Ministering Assigned', `${memberName} was assigned to ${ministerName}`)
    }

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

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    const target = users.find((u) => u.id === id)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
    const { full_name, role, is_active } = updates as Partial<Pick<AppUser, 'full_name' | 'role' | 'is_active'>>
    const safeUpdates: Partial<Pick<AppUser, 'full_name' | 'role' | 'is_active'>> = {}
    if (full_name !== undefined) safeUpdates.full_name = full_name
    if (role !== undefined) safeUpdates.role = role
    if (is_active !== undefined) safeUpdates.is_active = is_active
    supabase
      .from('app_users')
      .update(safeUpdates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('[DataContext] updateUser error:', error)
      })
    if (target && updates.role) {
      const roleLabel = updates.role.replace('_', ' ')
      logActivity('Role Updated', `${target.full_name}'s role was updated to ${roleLabel}`)
    }
  }

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
    logActivity('User Created', `New user ${name} was created with role ${role.replace('_', ' ')}`)
    return { error: null }
  }

  const deleteUser = async (id: string): Promise<{ error: string | null }> => {
    const target = users.find((u) => u.id === id)
    const { error } = await supabase.rpc('delete_managed_user', { p_user_id: id })
    if (error) return { error: error.message }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    if (target) logActivity('User Deleted', `User ${target.full_name} was deleted`)
    return { error: null }
  }

  const addMember = async (input: AddMemberInput): Promise<{ error: string | null }> => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('members')
      .insert({
        preferred_name: `${input.last_name}, ${input.first_name}`,
        status: REVERSE_STATUS_MAP[input.status],
        address_street1: input.address_street1 || null,
        address_street2: null,
        address_city: input.address_city || null,
        assigned_person: input.assigned_to || null,
        new_address: null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error || !data) return { error: error?.message ?? 'Failed to add member' }

    setMembers((prev) => [...prev, mapDbMember(data as DbMember)])
    logActivity('Member Added', `${input.last_name}, ${input.first_name} was added as a new member`)
    return { error: null }
  }

  const setPendingAccount = (memberId: string, value: boolean) => {
    const member = members.find((m) => m.id === memberId)
    const memberName = member ? `${member.last_name}, ${member.first_name}` : `Member #${memberId}`
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, pending_account: value } : m))
    )
    if (value) {
      supabase
        .from('pending_accounts')
        .insert({ member_id: Number(memberId) })
        .then(({ error }) => {
          if (error) console.error('[DataContext] setPendingAccount insert error:', error)
        })
      logActivity('Pending Account Added', `${memberName} was flagged for LDS Account creation`)
    } else {
      supabase
        .from('pending_accounts')
        .delete()
        .eq('member_id', Number(memberId))
        .then(({ error }) => {
          if (error) console.error('[DataContext] setPendingAccount delete error:', error)
        })
      logActivity('Account Created', `LDS Account confirmed as created for ${memberName}`)
    }
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
    logActivity('Calling Assigned', `${memberName} was called as ${input.position}`)

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
    logActivity('Calling Released', `${memberName} was released from ${calling?.position ?? 'calling'}`)

    return { error: null }
  }

  const submitChildRecord = async (input: SubmitChildRecordInput): Promise<{ error: string | null }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: recordData, error: recordErr } = await supabase
      .from('child_records')
      .insert({ ...input, created_by: user.id })
      .select()
      .single()

    if (recordErr || !recordData) return { error: recordErr?.message ?? 'Failed to create child record' }

    const description = `Record child blessing: ${input.child_name}${input.blessing_date ? `, blessed ${input.blessing_date}` : ''}`

    const { data: taskData, error: taskErr } = await supabase
      .from('child_record_tasks')
      .insert({
        child_record_id: recordData.id,
        task_type: 'child_record_created',
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (taskErr) return { error: taskErr.message }

    setChildRecords((prev) => [mapDbChildRecord(recordData as Record<string, unknown>), ...prev])
    if (taskData) setChildRecordTasks((prev) => [mapDbChildRecordTask(taskData as Record<string, unknown>), ...prev])

    return { error: null }
  }

  const completeChildRecordTask = async (taskId: string): Promise<{ error: string | null }> => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('child_record_tasks')
      .update({ is_complete: true, completed_at: now })
      .eq('id', Number(taskId))

    if (error) return { error: error.message }

    setChildRecordTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_complete: true, completed_at: now } : t))
    )
    return { error: null }
  }

  const completeTask = async (taskId: string): Promise<{ error: string | null }> => {
    const task = clerkTasks.find((t) => t.id === taskId)
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('clerk_tasks')
      .update({ is_complete: true, completed_at: now })
      .eq('id', Number(taskId))

    if (error) return { error: error.message }

    setClerkTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_complete: true, completed_at: now } : t))
    )
    if (task) logActivity('Calling Confirmed', `Clerk confirmed: ${task.description}`)
    return { error: null }
  }

  return (
    <DataContext.Provider
      value={{
        members, households, users, callings, clerkTasks, activityLog, childRecords, childRecordTasks, loading,
        updateMember, updateHousehold, updateUser, addUser, deleteUser, addMember,
        setPendingAccount, assignCalling, releaseCalling, completeTask,
        submitChildRecord, completeChildRecordTask,
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
