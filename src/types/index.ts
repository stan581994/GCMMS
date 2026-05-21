export type MemberStatus = 'active' | 'moved_out' | 'transferred' | 'unknown'
export type UserRole = 'admin' | 'account_specialist' | 'clerk' | 'ministering'

export interface Household {
  id: string
  name: string
  address: string
  created_at: string
}

export interface Member {
  id: string
  household_id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  status: MemberStatus
  notes: string
  updated_by: string
  updated_at: string
  created_at: string
}

export interface AppUser {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
  is_active: boolean
}
