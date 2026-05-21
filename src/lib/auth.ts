import type { UserRole } from '@/types'

export const canEdit = (role: UserRole): boolean =>
  role === 'admin' || role === 'account_specialist' || role === 'clerk'

export const canEditStatusOnly = (role: UserRole): boolean =>
  role === 'ministering'

export const isAdmin = (role: UserRole): boolean => role === 'admin'
