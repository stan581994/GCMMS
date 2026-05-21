import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: UserRole
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, initializing } = useAuth()

  if (initializing) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireRole && currentUser?.role !== requireRole) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
