import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Members } from '@/pages/Members'
import { MemberDetail } from '@/pages/MemberDetail'
import { Households } from '@/pages/Households'
import { HouseholdDetail } from '@/pages/HouseholdDetail'
import { UserManagement } from '@/pages/UserManagement'
import { PendingAccounts } from '@/pages/PendingAccounts'
import { CallingManagement } from '@/pages/CallingManagement'
import { ChildRecordManagement } from '@/pages/ChildRecordManagement'
import { ClerkCallings } from '@/pages/ClerkCallings'
import { ClerkChildRecords } from '@/pages/ClerkChildRecords'

function DefaultRedirect() {
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const to = role === 'admin' || role === 'clerk' ? '/dashboard' : role === 'account_specialist' ? '/pending-accounts' : '/members'
  return <Navigate to={to} replace />
}

function DefaultRedirect() {
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const to = role === 'admin' || role === 'clerk' ? '/dashboard' : role === 'account_specialist' ? '/pending-accounts' : '/members'
  return <Navigate to={to} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DefaultRedirect />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/members" element={<ProtectedRoute blockedRoles={['account_specialist']}><Members /></ProtectedRoute>} />
              <Route path="/members/:id" element={<ProtectedRoute blockedRoles={['account_specialist']}><MemberDetail /></ProtectedRoute>} />
              <Route path="/households" element={<ProtectedRoute blockedRoles={['account_specialist']}><Households /></ProtectedRoute>} />
              <Route path="/households/:id" element={<ProtectedRoute blockedRoles={['account_specialist']}><HouseholdDetail /></ProtectedRoute>} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requireRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/pending-accounts" element={<ProtectedRoute blockedRoles={['clerk']}><PendingAccounts /></ProtectedRoute>} />
              <Route
                path="/callings"
                element={
                  <ProtectedRoute requireRole="admin">
                    <CallingManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/child-records"
                element={
                  <ProtectedRoute requireRole="admin">
                    <ChildRecordManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clerk/callings"
                element={
                  <ProtectedRoute requireRole="clerk">
                    <ClerkCallings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clerk/child-records"
                element={
                  <ProtectedRoute requireRole="clerk">
                    <ClerkChildRecords />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
