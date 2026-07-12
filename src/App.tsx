import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ForcePasswordChangeModal } from '@/components/ForcePasswordChangeModal'
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
import { ConfirmAccount } from '@/pages/ConfirmAccount'
import { ResetPassword } from '@/pages/ResetPassword'

function DefaultRedirect() {
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const to = role === 'admin' || role === 'clerk' ? '/dashboard' : role === 'account_specialist' ? '/pending-accounts' : role === 'secretary' ? '/callings' : '/members'
  return <Navigate to={to} replace />
}

function ForcePasswordGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  return (
    <>
      {children}
      {currentUser?.must_change_password && <ForcePasswordChangeModal />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ForcePasswordGate>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/confirm" element={<ConfirmAccount />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/members" element={<ProtectedRoute blockedRoles={['account_specialist', 'secretary']}><Members /></ProtectedRoute>} />
              <Route path="/members/:id" element={<ProtectedRoute blockedRoles={['account_specialist', 'secretary']}><MemberDetail /></ProtectedRoute>} />
              <Route path="/households" element={<ProtectedRoute blockedRoles={['account_specialist', 'secretary']}><Households /></ProtectedRoute>} />
              <Route path="/households/:id" element={<ProtectedRoute blockedRoles={['account_specialist', 'secretary']}><HouseholdDetail /></ProtectedRoute>} />
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
                  <ProtectedRoute allowedRoles={['admin', 'secretary']}>
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
        </ForcePasswordGate>
      </DataProvider>
    </AuthProvider>
  )
}
