export type MemberStatus = 'active' | 'moved_out' | 'transferred' | 'unknown'
export type UserRole = 'admin' | 'account_specialist' | 'clerk' | 'ministering' | 'secretary'

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

export interface ChildRecord {
  id: string
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
  created_by: string
  created_at: string
  updated_at: string
}

export interface ChildRecordTask {
  id: string
  child_record_id: string
  task_type: 'child_record_created'
  description: string
  is_complete: boolean
  completed_at: string | null
  created_by: string
  created_at: string
}
