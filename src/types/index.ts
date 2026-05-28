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
  address?: string
  phone: string | null
  email: string | null
  status: MemberStatus
  notes: string
  new_address?: string | null
  assigned_to: string | null
  updated_by: string
  updated_at: string
  created_at: string
  pending_account?: boolean
}

export interface AppUser {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
  is_active: boolean
}

export type CallingStatus = 'active' | 'released'
export type ClerkTaskType = 'calling_assigned' | 'calling_released'

export interface Calling {
  id: string
  member_id: string
  position: string
  sustained_date: string | null
  is_set_apart: boolean
  released_date: string | null
  status: CallingStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface ClerkTask {
  id: string
  calling_id: string
  task_type: ClerkTaskType
  description: string
  is_complete: boolean
  completed_at: string | null
  created_by: string
  created_at: string
}

export interface ActivityLog {
  id: string
  action: string
  description: string
  performed_by: string | null
  performed_by_name: string
  created_at: string
}
