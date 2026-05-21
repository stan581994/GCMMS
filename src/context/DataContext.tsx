import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockMembers, mockHouseholds, mockUsers } from '@/data/mock'
import type { Member, Household, AppUser, MemberStatus } from '@/types'
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
    assigned_to: row.assigned_person ?? null,
    updated_by: '',
    updated_at: row.updated_at ?? row.created_at,
    created_at: row.created_at,
  }
}

interface DataContextType {
  members: Member[]
  households: Household[]
  users: AppUser[]
  loading: boolean
  updateMember: (id: string, updates: Partial<Member>) => void
  updateHousehold: (id: string, updates: Partial<Household>) => void
  updateUser: (id: string, updates: Partial<AppUser>) => void
  addUser: (user: AppUser) => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds)
  const [users, setUsers] = useState<AppUser[]>(mockUsers)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) {
      console.log('[DataContext] Supabase not configured — using mock data')
      return
    }

    const fetchMembers = supabase
      .from('members')
      .select('*', { count: 'exact' })
      .order('preferred_name')
      .then(({ data, error, count, status, statusText }) => {
        console.log('[DataContext] Members — status:', status, statusText, '| count:', count)
        if (error) {
          console.error('[DataContext] Members fetch error:', error)
        } else if (data) {
          const mapped = (data as DbMember[]).map(mapDbMember)
          setMembers(mapped)
        }
      })

    const fetchUsers = supabase
      .from('app_users')
      .select('id, full_name, role, is_active, created_at')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          console.error('[DataContext] app_users fetch error:', error)
        } else if (data) {
          setUsers(data as AppUser[])
        }
      })

    Promise.all([fetchMembers, fetchUsers]).then(() => setLoading(false))
  }, [])

  const updateMember = (id: string, updates: Partial<Member>) =>
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    )

  const updateHousehold = (id: string, updates: Partial<Household>) =>
    setHouseholds((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))

  const updateUser = (id: string, updates: Partial<AppUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))

  const addUser = (user: AppUser) => setUsers((prev) => [...prev, user])

  return (
    <DataContext.Provider
      value={{ members, households, users, loading, updateMember, updateHousehold, updateUser, addUser }}
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
