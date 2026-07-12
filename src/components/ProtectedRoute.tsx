import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: UserRole
  allowedRoles?: UserRole[]
  blockedRoles?: UserRole[]
}

function roleFallback(role?: UserRole): string {
  if (role === 'account_specialist') return '/pending-accounts'
  if (role === 'clerk') return '/dashboard'
  if (role === 'secretary') return '/callings'
  return '/members'
}

export function ProtectedRoute({ children, requireRole, allowedRoles, blockedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, currentUser } = useAuth()

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireRole && currentUser?.role !== requireRole)
    return <Navigate to={roleFallback(currentUser?.role)} replace />
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role))
    return <Navigate to={roleFallback(currentUser.role)} replace />
  if (blockedRoles && currentUser && blockedRoles.includes(currentUser.role))
    return <Navigate to={roleFallback(currentUser.role)} replace />

  return <>{children}</>
}
